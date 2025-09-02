-- ClimateTime Database Migration v2
-- Add historical climate data support for Iteration 2

-- Historical weather data table for time-series storage
CREATE TABLE IF NOT EXISTS historical_weather (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    date DATE NOT NULL,
    temperature_max DECIMAL(5, 2),
    temperature_min DECIMAL(5, 2),
    temperature_mean DECIMAL(5, 2),
    precipitation DECIMAL(6, 2),
    humidity DECIMAL(5, 2),
    wind_speed DECIMAL(6, 2),
    pressure DECIMAL(7, 2),
    data_source VARCHAR(50) DEFAULT 'open-meteo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, date, data_source)
);

-- Yearly climate aggregates for faster queries
CREATE TABLE IF NOT EXISTS yearly_climate_summary (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    year INTEGER NOT NULL,
    temperature_max_avg DECIMAL(5, 2),
    temperature_min_avg DECIMAL(5, 2),
    temperature_mean_avg DECIMAL(5, 2),
    precipitation_total DECIMAL(8, 2),
    precipitation_avg DECIMAL(6, 2),
    humidity_avg DECIMAL(5, 2),
    wind_speed_avg DECIMAL(6, 2),
    pressure_avg DECIMAL(7, 2),
    data_points_count INTEGER DEFAULT 0,
    data_source VARCHAR(50) DEFAULT 'open-meteo',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, year, data_source)
);

-- Decadal climate averages for long-term trend analysis
CREATE TABLE IF NOT EXISTS decadal_climate_summary (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    decade_start INTEGER NOT NULL, -- e.g., 1980, 1990, 2000
    decade_end INTEGER NOT NULL,   -- e.g., 1989, 1999, 2009
    temperature_max_avg DECIMAL(5, 2),
    temperature_min_avg DECIMAL(5, 2),
    temperature_mean_avg DECIMAL(5, 2),
    precipitation_total_avg DECIMAL(8, 2),
    precipitation_annual_avg DECIMAL(6, 2),
    humidity_avg DECIMAL(5, 2),
    wind_speed_avg DECIMAL(6, 2),
    pressure_avg DECIMAL(7, 2),
    years_count INTEGER DEFAULT 0,
    data_source VARCHAR(50) DEFAULT 'open-meteo',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, decade_start, data_source)
);

-- Climate change indicators for comparison analysis
CREATE TABLE IF NOT EXISTS climate_trends (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    metric VARCHAR(100) NOT NULL, -- 'temperature_mean', 'precipitation', etc.
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    trend_slope DECIMAL(10, 6), -- Rate of change per year
    trend_direction VARCHAR(20), -- 'increasing', 'decreasing', 'stable'
    confidence_level DECIMAL(5, 2), -- Statistical confidence 0-100
    baseline_value DECIMAL(10, 4),
    current_value DECIMAL(10, 4),
    percent_change DECIMAL(8, 4),
    data_source VARCHAR(50) DEFAULT 'open-meteo',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, metric, period_start, period_end, data_source)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_historical_weather_location_date ON historical_weather(location_id, date);
CREATE INDEX IF NOT EXISTS idx_historical_weather_date ON historical_weather(date);
CREATE INDEX IF NOT EXISTS idx_yearly_summary_location_year ON yearly_climate_summary(location_id, year);
CREATE INDEX IF NOT EXISTS idx_yearly_summary_year ON yearly_climate_summary(year);
CREATE INDEX IF NOT EXISTS idx_decadal_summary_location_decade ON decadal_climate_summary(location_id, decade_start);
CREATE INDEX IF NOT EXISTS idx_climate_trends_location_metric ON climate_trends(location_id, metric);

-- Add constraints for data quality
ALTER TABLE historical_weather 
ADD CONSTRAINT chk_historical_weather_date 
CHECK (date >= '1940-01-01' AND date <= CURRENT_DATE);

ALTER TABLE yearly_climate_summary 
ADD CONSTRAINT chk_yearly_summary_year 
CHECK (year >= 1940 AND year <= EXTRACT(YEAR FROM CURRENT_DATE));

ALTER TABLE decadal_climate_summary 
ADD CONSTRAINT chk_decadal_summary_decade 
CHECK (decade_start >= 1940 AND decade_end <= EXTRACT(YEAR FROM CURRENT_DATE));

-- Function to calculate yearly summaries from historical data
CREATE OR REPLACE FUNCTION calculate_yearly_summary(p_location_id INTEGER, p_year INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO yearly_climate_summary (
        location_id, year, temperature_max_avg, temperature_min_avg, 
        temperature_mean_avg, precipitation_total, precipitation_avg,
        humidity_avg, wind_speed_avg, pressure_avg, data_points_count
    )
    SELECT 
        p_location_id,
        p_year,
        AVG(temperature_max),
        AVG(temperature_min),
        AVG(temperature_mean),
        SUM(precipitation),
        AVG(precipitation),
        AVG(humidity),
        AVG(wind_speed),
        AVG(pressure),
        COUNT(*)
    FROM historical_weather 
    WHERE location_id = p_location_id 
      AND EXTRACT(YEAR FROM date) = p_year
    ON CONFLICT (location_id, year, data_source) 
    DO UPDATE SET 
        temperature_max_avg = EXCLUDED.temperature_max_avg,
        temperature_min_avg = EXCLUDED.temperature_min_avg,
        temperature_mean_avg = EXCLUDED.temperature_mean_avg,
        precipitation_total = EXCLUDED.precipitation_total,
        precipitation_avg = EXCLUDED.precipitation_avg,
        humidity_avg = EXCLUDED.humidity_avg,
        wind_speed_avg = EXCLUDED.wind_speed_avg,
        pressure_avg = EXCLUDED.pressure_avg,
        data_points_count = EXCLUDED.data_points_count,
        calculated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate decadal summaries from yearly data
CREATE OR REPLACE FUNCTION calculate_decadal_summary(p_location_id INTEGER, p_decade_start INTEGER)
RETURNS VOID AS $$
DECLARE
    p_decade_end INTEGER := p_decade_start + 9;
BEGIN
    INSERT INTO decadal_climate_summary (
        location_id, decade_start, decade_end, temperature_max_avg, 
        temperature_min_avg, temperature_mean_avg, precipitation_total_avg,
        precipitation_annual_avg, humidity_avg, wind_speed_avg, 
        pressure_avg, years_count
    )
    SELECT 
        p_location_id,
        p_decade_start,
        p_decade_end,
        AVG(temperature_max_avg),
        AVG(temperature_min_avg),
        AVG(temperature_mean_avg),
        AVG(precipitation_total),
        AVG(precipitation_avg),
        AVG(humidity_avg),
        AVG(wind_speed_avg),
        AVG(pressure_avg),
        COUNT(*)
    FROM yearly_climate_summary 
    WHERE location_id = p_location_id 
      AND year >= p_decade_start 
      AND year <= p_decade_end
    HAVING COUNT(*) > 0
    ON CONFLICT (location_id, decade_start, data_source) 
    DO UPDATE SET 
        decade_end = EXCLUDED.decade_end,
        temperature_max_avg = EXCLUDED.temperature_max_avg,
        temperature_min_avg = EXCLUDED.temperature_min_avg,
        temperature_mean_avg = EXCLUDED.temperature_mean_avg,
        precipitation_total_avg = EXCLUDED.precipitation_total_avg,
        precipitation_annual_avg = EXCLUDED.precipitation_annual_avg,
        humidity_avg = EXCLUDED.humidity_avg,
        wind_speed_avg = EXCLUDED.wind_speed_avg,
        pressure_avg = EXCLUDED.pressure_avg,
        years_count = EXCLUDED.years_count,
        calculated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;