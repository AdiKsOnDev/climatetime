// Climate Action Types and Interfaces for Personalized Recommendations

export interface LocationData {
  lat: number;
  lon: number;
  address: string;
  city?: string;
  region?: string;
  country?: string;
}

// Core Action Types
export type ActionCategory = 
  | 'energy'           // Home energy efficiency, solar, etc.
  | 'transportation'   // Public transit, cycling, EVs
  | 'consumption'      // Food, shopping, waste reduction
  | 'home'            // Insulation, heating/cooling, appliances  
  | 'community'       // Local programs, volunteering
  | 'investment'      // Green investments, banking
  | 'advocacy';       // Political action, awareness

export type ActionDifficulty = 'easy' | 'moderate' | 'challenging';
export type ActionTimeframe = 'immediate' | 'short_term' | 'long_term'; // days, months, years
export type ActionCostLevel = 'free' | 'low' | 'medium' | 'high';

// Impact Metrics
export interface ImpactMetrics {
  co2ReductionKgPerYear: number;
  costSavingsPerYear?: number;        // USD
  energySavingsKwhPerYear?: number;    // kWh
  waterSavingsGallonsPerYear?: number; // gallons
  confidenceLevel: number;             // 0-100%
  timeToPayback?: number;              // months for investments
}

// Action Recommendation Structure
export interface ClimateAction {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;        // Markdown formatted
  category: ActionCategory;
  difficulty: ActionDifficulty;
  timeframe: ActionTimeframe;
  costLevel: ActionCostLevel;
  impact: ImpactMetrics;
  
  // Location relevance
  applicableRegions: string[];        // ['US', 'Europe', 'global'] 
  locationSpecific: boolean;          // requires local data
  
  // Prerequisites and barriers
  prerequisites: string[];            // ['owns_home', 'has_car', 'has_income_X']
  barriers: string[];                 // Common obstacles
  
  // Implementation details
  steps: ActionStep[];
  resources: Resource[];
  
  // Tracking and validation
  tags: string[];
  sources: string[];                  // Research citations
  lastUpdated: string;               // ISO date
  verified: boolean;                 // Fact-checked
}

export interface ActionStep {
  order: number;
  title: string;
  description: string;
  estimatedTimeMinutes?: number;
  cost?: number;                     // USD
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
  localArea?: string;               // Geographic relevance
}

// Personal Impact Calculator
export interface PersonalProfile {
  userId?: string;
  location: LocationData;
  
  // Demographics (optional, for better recommendations)
  householdSize?: number;
  dwellingType?: 'apartment' | 'house' | 'condo' | 'other';
  ownsHome?: boolean;
  annualIncome?: 'under_30k' | '30k_60k' | '60k_100k' | '100k_plus' | 'prefer_not_to_say';
  
  // Current behaviors (for personalization)
  currentTransportModes?: ('car' | 'public_transit' | 'bike' | 'walk' | 'remote_work')[];
  energySource?: 'grid' | 'renewable' | 'mixed' | 'unknown';
  dietType?: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian';
  
  // Preferences
  preferredActionTypes?: ActionCategory[];
  maxInvestmentAmount?: number;      // USD willing to spend
  timeAvailabilityHours?: number;    // hours per week for climate actions
}

export interface CurrentFootprint {
  totalCO2PerYear: number;          // kg CO2 equivalent
  breakdown: {
    energy: number;
    transportation: number;
    food: number;
    consumption: number;
    other: number;
  };
  comparisonToAverage: {
    local: number;                  // percentage vs local average
    national: number;               // percentage vs national average  
    global: number;                 // percentage vs global average
  };
  calculationMethod: string;
  confidenceLevel: number;          // 0-100%
  lastCalculated: string;           // ISO date
}

// Recommendation Engine Types
export interface RecommendationRequest {
  profile: PersonalProfile;
  currentFootprint?: CurrentFootprint;
  climateData?: {
    currentClimate: any;            // from existing climate data
    historicalTrends: any;
    futureProjections: any;
  };
  preferences?: RecommendationPreferences;
}

export interface RecommendationPreferences {
  maxRecommendations?: number;      // default 8
  focusAreas?: ActionCategory[];    // prioritize certain categories
  difficultyLevels?: ActionDifficulty[]; // filter by difficulty
  budgetConstraint?: number;        // max USD for recommendations
  timeConstraint?: ActionTimeframe; // only show actions in timeframe
  excludeActionIds?: string[];      // actions user has dismissed/completed
}

export interface PersonalizedRecommendation {
  action: ClimateAction;
  personalizationScore: number;     // 0-100, how relevant to this user
  reasoning: string[];              // why this was recommended
  localizedResources: Resource[];   // location-specific resources
  customizedSteps?: ActionStep[];   // modified steps for this user
  estimatedPersonalImpact: ImpactMetrics; // personalized impact calculation
}

export interface RecommendationResponse {
  recommendations: PersonalizedRecommendation[];
  totalPotentialImpact: ImpactMetrics; // if user did all recommendations
  alternativeActions: PersonalizedRecommendation[]; // additional options
  localOpportunities: LocalOpportunity[];
  nextSteps: string[];              // immediate next actions
  confidenceLevel: number;
  lastUpdated: string;
}

// Local Solutions and Community Features
export interface LocalOpportunity {
  id: string;
  title: string;
  description: string;
  type: 'program' | 'incentive' | 'event' | 'group' | 'service';
  organization: string;
  contactInfo: Resource[];
  location: LocationData;
  radius: number;                   // miles from user location
  category: ActionCategory;
  
  // Program details
  eligibilityRequirements?: string[];
  applicationDeadline?: string;     // ISO date
  fundingAmount?: number;           // USD if applicable
  participantCount?: number;        // how many people involved
  
  // Engagement
  website?: string;
  socialMediaLinks?: Resource[];
  upcomingEvents?: LocalEvent[];
}

export interface LocalEvent {
  id: string;
  title: string;
  description: string;
  date: string;                     // ISO date
  location: string;
  registrationRequired: boolean;
  registrationLink?: string;
  cost?: number;                    // USD
}

// Carbon Footprint Calculation Support
export interface EmissionFactor {
  id: string;
  category: ActionCategory;
  activity: string;                 // 'driving_gasoline_car', 'electricity_grid', etc.
  unit: string;                     // 'per_mile', 'per_kwh', etc.
  co2eKgPerUnit: number;           // kg CO2 equivalent per unit
  region?: string;                  // geographic applicability
  source: string;                   // EPA, IPCC, etc.
  year: number;                     // data year
  uncertainty?: number;             // percentage uncertainty
}

export interface ActivityData {
  activityType: string;
  amount: number;
  unit: string;
  location?: LocationData;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface CarbonCalculationRequest {
  activities: ActivityData[];
  location: LocationData;
  emissionFactors?: EmissionFactor[]; // custom factors if needed
}

export interface CarbonCalculationResponse {
  totalCO2eKg: number;
  breakdown: Array<{
    activity: string;
    co2eKg: number;
    percentage: number;
  }>;
  methodology: string;
  sources: string[];
  calculatedAt: string;             // ISO date
  confidence: number;               // 0-100%
}

// API Response Types
export interface ActionRecommendationAPIResponse {
  success: boolean;
  data?: RecommendationResponse;
  error?: string;
  metadata: {
    requestId: string;
    processTime: number;            // milliseconds
    apiVersion: string;
    dataSourcesUsed: string[];
  };
}

export interface FootprintCalculationAPIResponse {
  success: boolean;
  data?: CarbonCalculationResponse;
  error?: string;
  metadata: {
    requestId: string;
    processTime: number;
    apiVersion: string;
    emissionFactorsUsed: string[];
  };
}

// Database Schema Support Types
export interface ActionTemplate {
  id: string;
  baseAction: ClimateAction;
  localizationRules: LocalizationRule[];
  personalizationRules: PersonalizationRule[];
}

export interface LocalizationRule {
  condition: string;                // 'location.country === "US"'
  modifications: {
    resources?: Resource[];
    steps?: ActionStep[];
    impact?: Partial<ImpactMetrics>;
  };
}

export interface PersonalizationRule {
  condition: string;                // 'profile.dwellingType === "apartment"'
  scoreModifier: number;           // multiply relevance score
  modifications?: {
    description?: string;
    steps?: ActionStep[];
    impact?: Partial<ImpactMetrics>;
  };
}

// User Tracking and Progress
export interface UserActionProgress {
  userId: string;
  actionId: string;
  status: 'interested' | 'started' | 'in_progress' | 'completed' | 'dismissed';
  startDate?: string;               // ISO date
  completedDate?: string;
  currentStep?: number;
  notes?: string;
  measuredImpact?: Partial<ImpactMetrics>; // actual vs estimated
  rating?: number;                  // 1-5 user rating
  feedback?: string;
}

export interface UserRecommendationHistory {
  userId: string;
  sessionId: string;
  requestedAt: string;              // ISO date
  profile: PersonalProfile;
  recommendations: PersonalizedRecommendation[];
  userInteractions: Array<{
    actionId: string;
    interactionType: 'viewed' | 'clicked' | 'dismissed' | 'started';
    timestamp: string;
  }>;
}

// External API Integration Types
export interface EPADataResponse {
  data: any[];                      // EPA API structure varies
  metadata: {
    source: string;
    lastUpdated: string;
    coverage: string;
  };
}

export interface NRELSolarResponse {
  outputs: {
    avg_dni: number;               // Direct Normal Irradiance
    avg_ghi: number;               // Global Horizontal Irradiance
    avg_lat_tilt: number;          // Tilt angle
    solrad_annual: number;         // Annual solar radiation
  };
  station_info: {
    city: string;
    state: string;
    country: string;
  };
}

export interface ClimatiqEmissionResponse {
  co2e: number;                     // kg CO2 equivalent
  co2e_unit: string;
  emission_factor: {
    activity_id: string;
    source: string;
    year: number;
    region: string;
    unit: string;
  };
}