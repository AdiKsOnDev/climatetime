-- ClimateTime Database Initialization
-- Create database and initial tables for storing climate data

-- Create database (run manually if needed)
-- CREATE DATABASE climatetime;

-- Enable PostGIS extension for geographic data (if available)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Locations table for caching geocoded results
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    address VARCHAR(500) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lon DECIMAL(11, 8) NOT NULL,
    city VARCHAR(255),
    country VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather data cache table
CREATE TABLE IF NOT EXISTS weather_data (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    temperature DECIMAL(5, 2),
    humidity INTEGER,
    precipitation DECIMAL(6, 2),
    wind_speed DECIMAL(6, 2),
    description VARCHAR(255),
    icon VARCHAR(10),
    data_source VARCHAR(50) DEFAULT 'openweather',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User queries log for analytics (optional)
CREATE TABLE IF NOT EXISTS query_logs (
    id SERIAL PRIMARY KEY,
    user_ip VARCHAR(45),
    query_text VARCHAR(1000),
    location_lat DECIMAL(10, 8),
    location_lon DECIMAL(11, 8),
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations(lat, lon);
CREATE INDEX IF NOT EXISTS idx_locations_address ON locations(address);
CREATE INDEX IF NOT EXISTS idx_weather_data_location ON weather_data(location_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_recorded ON weather_data(recorded_at);
CREATE INDEX IF NOT EXISTS idx_query_logs_created ON query_logs(created_at);

-- Update trigger for locations table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_locations_updated_at 
    BEFORE UPDATE ON locations 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();