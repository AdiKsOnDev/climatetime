export interface LocationData {
  address: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

export interface ClimateData {
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  location: LocationData;
  timestamp: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface HistoricalWeatherData {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  temperatureMean: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
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

export interface HistoricalClimateResponse {
  location: LocationData;
  requestedYears: number[];
  retrievedYears: number[];
  yearlyData: YearlyClimateData[];
  decadalData?: DecadalClimateData[];
  trends?: ClimateTrendData[];
}