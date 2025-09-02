// Location data interfaces
export interface LocationData {
  address: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

// Current climate data interfaces
export interface CurrentWeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export interface ClimateData {
  current: CurrentWeatherData;
  location: LocationData;
  timestamp: string;
}

// Historical climate data interfaces
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