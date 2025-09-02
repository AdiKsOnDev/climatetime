import axios from 'axios';
import { logger } from '../utils/logger';

export interface HistoricalWeatherParams {
  latitude: number;
  longitude: number;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
}

export interface DailyWeatherData {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  temperatureMean: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

export interface HistoricalWeatherResponse {
  location: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  timezoneAbbreviation: string;
  elevation: number;
  dailyData: DailyWeatherData[];
  generationTimeMs: number;
}

export interface YearlyClimateData {
  year: number;
  temperatureMaxAvg: number;
  temperatureMinAvg: number;
  temperatureMeanAvg: number;
  precipitationTotal: number;
  precipitationAvg: number;
  humidityAvg: number;
  windSpeedAvg: number;
  pressureAvg: number;
  dataPointsCount: number;
}

export interface DecadalClimateData {
  decadeStart: number;
  decadeEnd: number;
  temperatureMaxAvg: number;
  temperatureMinAvg: number;
  temperatureMeanAvg: number;
  precipitationTotalAvg: number;
  precipitationAnnualAvg: number;
  humidityAvg: number;
  windSpeedAvg: number;
  pressureAvg: number;
  yearsCount: number;
}

export interface ClimateTrendData {
  metric: string;
  periodStart: string;
  periodEnd: string;
  trendSlope: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  confidenceLevel: number;
  baselineValue: number;
  currentValue: number;
  percentChange: number;
}

class HistoricalWeatherService {
  private readonly baseUrl = 'https://archive-api.open-meteo.com/v1/archive';
  private readonly maxYearsPerRequest = 10; // Limit to prevent oversized requests

  async getHistoricalWeather(params: HistoricalWeatherParams): Promise<HistoricalWeatherResponse> {
    try {
      const { latitude, longitude, startDate, endDate } = params;
      
      logger.info(`📊 Fetching historical weather data for ${latitude}, ${longitude} from ${startDate} to ${endDate}`);

      const response = await axios.get(this.baseUrl, {
        params: {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          start_date: startDate,
          end_date: endDate,
          daily: [
            'temperature_2m_max',
            'temperature_2m_min', 
            'temperature_2m_mean',
            'precipitation_sum',
            'relative_humidity_2m_mean',
            'wind_speed_10m_mean',
            'surface_pressure_mean'
          ].join(','),
          timezone: 'auto'
        },
        timeout: 10000
      });

      const data = response.data;
      
      if (!data.daily || !data.daily.time) {
        throw new Error('Invalid response format from Open-Meteo API');
      }

      const dailyData: DailyWeatherData[] = data.daily.time.map((date: string, index: number) => ({
        date,
        temperatureMax: data.daily.temperature_2m_max?.[index] || null,
        temperatureMin: data.daily.temperature_2m_min?.[index] || null,
        temperatureMean: data.daily.temperature_2m_mean?.[index] || null,
        precipitation: data.daily.precipitation_sum?.[index] || 0,
        humidity: data.daily.relative_humidity_2m_mean?.[index] || null,
        windSpeed: data.daily.wind_speed_10m_mean?.[index] || null,
        pressure: data.daily.surface_pressure_mean?.[index] || null
      }));

      const result: HistoricalWeatherResponse = {
        location: {
          latitude: data.latitude || latitude,
          longitude: data.longitude || longitude
        },
        timezone: data.timezone || 'UTC',
        timezoneAbbreviation: data.timezone_abbreviation || 'UTC',
        elevation: data.elevation || 0,
        dailyData,
        generationTimeMs: data.generationtime_ms || 0
      };

      logger.info(`✅ Retrieved ${dailyData.length} days of historical weather data`);
      return result;

    } catch (error) {
      logger.error('❌ Historical weather API call failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid request parameters for historical weather data');
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded for historical weather API');
        }
      }
      
      throw new Error(
        error instanceof Error 
          ? `Historical weather data fetch failed: ${error.message}`
          : 'Unknown error fetching historical weather data'
      );
    }
  }

  async getYearlyClimateData(latitude: number, longitude: number, years: number[]): Promise<YearlyClimateData[]> {
    const yearlyData: YearlyClimateData[] = [];
    logger.info(`🏛️ Fetching yearly climate data for ${years.length} years: ${years[0]}-${years[years.length-1]}`);

    for (let i = 0; i < years.length; i++) {
      const year = years[i];
      try {
        logger.info(`📅 Processing year ${year} (${i + 1}/${years.length})`);
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        
        const historicalData = await this.getHistoricalWeather({
          latitude,
          longitude,
          startDate,
          endDate
        });

        const validDays = historicalData.dailyData.filter(day => 
          day.temperatureMean !== null && 
          day.temperatureMax !== null && 
          day.temperatureMin !== null
        );

        if (validDays.length === 0) continue;

        const yearSummary: YearlyClimateData = {
          year,
          temperatureMaxAvg: this.calculateAverage(validDays.map(d => d.temperatureMax).filter(t => t !== null)),
          temperatureMinAvg: this.calculateAverage(validDays.map(d => d.temperatureMin).filter(t => t !== null)),
          temperatureMeanAvg: this.calculateAverage(validDays.map(d => d.temperatureMean).filter(t => t !== null)),
          precipitationTotal: validDays.reduce((sum, day) => sum + (day.precipitation || 0), 0),
          precipitationAvg: this.calculateAverage(validDays.map(d => d.precipitation).filter(p => p !== null)),
          humidityAvg: this.calculateAverage(validDays.map(d => d.humidity).filter(h => h !== null)),
          windSpeedAvg: this.calculateAverage(validDays.map(d => d.windSpeed).filter(w => w !== null)),
          pressureAvg: this.calculateAverage(validDays.map(d => d.pressure).filter(p => p !== null)),
          dataPointsCount: validDays.length
        };

        yearlyData.push(yearSummary);
        
        // Add delay to respect API rate limits (10,000/day = ~7 per minute)
        // Reduced delay for better user experience (while still respecting limits)
        await this.delay(2000); // 2 second delay between years
        
      } catch (error) {
        logger.warn(`⚠️ Failed to fetch data for year ${year}:`, error);
        continue;
      }
    }

    return yearlyData;
  }

  generateDecadalSummary(yearlyData: YearlyClimateData[]): DecadalClimateData[] {
    const decadesMap = new Map<number, YearlyClimateData[]>();
    
    // Group yearly data by decades
    yearlyData.forEach(yearData => {
      const decadeStart = Math.floor(yearData.year / 10) * 10;
      if (!decadesMap.has(decadeStart)) {
        decadesMap.set(decadeStart, []);
      }
      decadesMap.get(decadeStart)!.push(yearData);
    });

    const decadalData: DecadalClimateData[] = [];
    
    decadesMap.forEach((years, decadeStart) => {
      if (years.length === 0) return;
      
      const decadeEnd = decadeStart + 9;
      
      const decadeSummary: DecadalClimateData = {
        decadeStart,
        decadeEnd,
        temperatureMaxAvg: this.calculateAverage(years.map(y => y.temperatureMaxAvg)),
        temperatureMinAvg: this.calculateAverage(years.map(y => y.temperatureMinAvg)),
        temperatureMeanAvg: this.calculateAverage(years.map(y => y.temperatureMeanAvg)),
        precipitationTotalAvg: this.calculateAverage(years.map(y => y.precipitationTotal)),
        precipitationAnnualAvg: this.calculateAverage(years.map(y => y.precipitationAvg)),
        humidityAvg: this.calculateAverage(years.map(y => y.humidityAvg)),
        windSpeedAvg: this.calculateAverage(years.map(y => y.windSpeedAvg)),
        pressureAvg: this.calculateAverage(years.map(y => y.pressureAvg)),
        yearsCount: years.length
      };
      
      decadalData.push(decadeSummary);
    });

    return decadalData.sort((a, b) => a.decadeStart - b.decadeStart);
  }

  calculateClimateTrends(yearlyData: YearlyClimateData[]): ClimateTrendData[] {
    if (yearlyData.length < 10) {
      logger.warn('⚠️ Insufficient data for trend analysis (minimum 10 years required)');
      return [];
    }

    const trends: ClimateTrendData[] = [];
    const sortedData = yearlyData.sort((a, b) => a.year - b.year);
    const periodStart = sortedData[0].year.toString();
    const periodEnd = sortedData[sortedData.length - 1].year.toString();

    // Temperature trend analysis
    const tempMeanTrend = this.calculateLinearTrend(
      sortedData.map(d => d.year),
      sortedData.map(d => d.temperatureMeanAvg)
    );
    
    trends.push({
      metric: 'temperature_mean',
      periodStart,
      periodEnd,
      trendSlope: tempMeanTrend.slope,
      trendDirection: this.getTrendDirection(tempMeanTrend.slope),
      confidenceLevel: tempMeanTrend.rSquared * 100,
      baselineValue: sortedData[0].temperatureMeanAvg,
      currentValue: sortedData[sortedData.length - 1].temperatureMeanAvg,
      percentChange: ((sortedData[sortedData.length - 1].temperatureMeanAvg - sortedData[0].temperatureMeanAvg) / sortedData[0].temperatureMeanAvg) * 100
    });

    // Precipitation trend analysis
    const precipTrend = this.calculateLinearTrend(
      sortedData.map(d => d.year),
      sortedData.map(d => d.precipitationTotal)
    );
    
    trends.push({
      metric: 'precipitation_annual',
      periodStart,
      periodEnd,
      trendSlope: precipTrend.slope,
      trendDirection: this.getTrendDirection(precipTrend.slope),
      confidenceLevel: precipTrend.rSquared * 100,
      baselineValue: sortedData[0].precipitationTotal,
      currentValue: sortedData[sortedData.length - 1].precipitationTotal,
      percentChange: ((sortedData[sortedData.length - 1].precipitationTotal - sortedData[0].precipitationTotal) / sortedData[0].precipitationTotal) * 100
    });

    return trends;
  }

  private calculateAverage(values: number[]): number {
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }

  private calculateLinearTrend(xValues: number[], yValues: number[]): { slope: number; intercept: number; rSquared: number } {
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    const sumYY = yValues.reduce((sum, y) => sum + y * y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const residualSumSquares = yValues.reduce((sum, y, i) => {
      const predicted = slope * xValues[i] + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);

    return { slope, intercept, rSquared };
  }

  private getTrendDirection(slope: number): 'increasing' | 'decreasing' | 'stable' {
    const threshold = 0.01; // Adjust based on data precision needs
    if (Math.abs(slope) < threshold) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const historicalWeatherService = new HistoricalWeatherService();