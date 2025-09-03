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

// Future Climate Projections Types
export type ClimateScenario = 'optimistic' | 'moderate' | 'pessimistic';

export interface ProjectionPeriod {
  period: '2020s' | '2030s' | '2040s' | '2050s';
  startYear: number;
  endYear: number;
  temperatureMaxAvg: number;
  temperatureMinAvg: number;
  temperatureMeanAvg: number;
  precipitationTotal: number;
  precipitationAvg: number;
  changeFromBaseline: {
    temperature: number;
    precipitation: number;
  };
  uncertaintyRange: {
    temperatureLow: number;
    temperatureHigh: number;
    precipitationLow: number;
    precipitationHigh: number;
  };
}

export interface FutureClimateResponse {
  location: {
    latitude: number;
    longitude: number;
  };
  scenario: ClimateScenario;
  model: string;
  projectionPeriods: ProjectionPeriod[];
  baseline: {
    period: string;
    temperatureMean: number;
    precipitation: number;
  };
  metadata: {
    dataSource: string;
    lastUpdated: string;
    confidenceLevel: string;
  };
}

export interface ScenarioComparison {
  optimistic: FutureClimateResponse;
  moderate: FutureClimateResponse;
  pessimistic: FutureClimateResponse;
}

// Climate Action Types
export type ActionCategory = 
  | 'energy' 
  | 'transportation' 
  | 'consumption' 
  | 'home' 
  | 'community' 
  | 'investment' 
  | 'advocacy';

export type ActionDifficulty = 'easy' | 'moderate' | 'challenging';
export type ActionTimeframe = 'immediate' | 'short_term' | 'long_term';
export type ActionCostLevel = 'free' | 'low' | 'medium' | 'high';

export interface ImpactMetrics {
  co2ReductionKgPerYear: number;
  costSavingsPerYear?: number;
  energySavingsKwhPerYear?: number;
  waterSavingsGallonsPerYear?: number;
  confidenceLevel: number;
  timeToPayback?: number;
}

export interface ActionStep {
  order: number;
  title: string;
  description: string;
  estimatedTimeMinutes?: number;
  cost?: number;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  type: 'website' | 'phone' | 'email' | 'document' | 'video' | 'calculator' | 'rebate';
  title: string;
  url?: string;
  description?: string;
  phoneNumber?: string;
  email?: string;
  localArea?: string;
}

export interface ClimateAction {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  category: ActionCategory;
  difficulty: ActionDifficulty;
  timeframe: ActionTimeframe;
  costLevel: ActionCostLevel;
  impact: ImpactMetrics;
  applicableRegions: string[];
  locationSpecific: boolean;
  prerequisites: string[];
  barriers: string[];
  steps: ActionStep[];
  resources: Resource[];
  tags: string[];
  sources: string[];
  lastUpdated: string;
  verified: boolean;
}

export interface PersonalizedRecommendation {
  action: ClimateAction;
  personalizationScore: number;
  reasoning: string[];
  localizedResources: Resource[];
  customizedSteps?: ActionStep[];
  estimatedPersonalImpact: ImpactMetrics;
}

export interface LocalOpportunity {
  id: string;
  title: string;
  description: string;
  type: 'program' | 'incentive' | 'event' | 'group' | 'service';
  organization: string;
  category: ActionCategory;
  estimatedSavings?: number;
  co2Reduction?: number;
  contactInfo: {
    website?: string;
    phone?: string;
    email?: string;
  };
  eligibility?: string[];
  nextSteps?: string[];
}

export interface RecommendationResponse {
  recommendations: PersonalizedRecommendation[];
  totalPotentialImpact: ImpactMetrics;
  alternativeActions: PersonalizedRecommendation[];
  localOpportunities: LocalOpportunity[];
  nextSteps: string[];
  confidenceLevel: number;
  lastUpdated: string;
}

export interface PersonalProfile {
  location: LocationData;
  householdSize?: number;
  dwellingType?: 'apartment' | 'house' | 'condo' | 'other';
  ownsHome?: boolean;
  annualIncome?: 'under_30k' | '30k_60k' | '60k_100k' | '100k_plus' | 'prefer_not_to_say';
  currentTransportModes?: ('car' | 'public_transit' | 'bike' | 'walk' | 'remote_work')[];
  energySource?: 'grid' | 'renewable' | 'mixed' | 'unknown';
  dietType?: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian';
  preferredActionTypes?: ActionCategory[];
  maxInvestmentAmount?: number;
  timeAvailabilityHours?: number;
}

export interface CurrentFootprint {
  totalCO2PerYear: number;
  breakdown: {
    energy: number;
    transportation: number;
    food: number;
    consumption: number;
    other: number;
  };
  comparisonToAverage: {
    local: number;
    national: number;
    global: number;
  };
  calculationMethod: string;
  confidenceLevel: number;
  lastCalculated: string;
}

export interface CarbonCalculation {
  calculationType: string;
  result: number;
  unit: string;
  description: string;
  equivalents: {
    treesNeeded: number;
    carMilesEquivalent: number;
    coalPounds: number;
  };
}