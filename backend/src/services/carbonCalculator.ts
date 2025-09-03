import { logger } from '../utils/logger';
import { MemoryCache } from '../utils/cache';
import {
  CarbonCalculationRequest,
  CarbonCalculationResponse,
  FootprintCalculationAPIResponse,
  EmissionFactor,
  ActivityData,
  PersonalProfile,
  CurrentFootprint
} from '../types/actions';

// Comprehensive emission factors database (in production, would be in database)
const EMISSION_FACTORS: EmissionFactor[] = [
  // ELECTRICITY (by region/grid)
  {
    id: 'electricity_us_average',
    category: 'energy',
    activity: 'electricity_consumption',
    unit: 'kwh',
    co2eKgPerUnit: 0.386, // kg CO2e per kWh (US average 2023)
    region: 'US',
    source: 'EPA eGRID 2023',
    year: 2023,
    uncertainty: 15
  },
  {
    id: 'electricity_california',
    category: 'energy', 
    activity: 'electricity_consumption',
    unit: 'kwh',
    co2eKgPerUnit: 0.234, // California has cleaner grid
    region: 'US-CA',
    source: 'EPA eGRID 2023',
    year: 2023,
    uncertainty: 12
  },
  {
    id: 'electricity_renewable',
    category: 'energy',
    activity: 'electricity_consumption',
    unit: 'kwh', 
    co2eKgPerUnit: 0.0, // Renewable energy
    region: 'global',
    source: 'EPA',
    year: 2023,
    uncertainty: 5
  },

  // NATURAL GAS
  {
    id: 'natural_gas_heating',
    category: 'energy',
    activity: 'natural_gas_consumption',
    unit: 'therm',
    co2eKgPerUnit: 5.3, // kg CO2e per therm
    region: 'global',
    source: 'EPA GHG Protocol',
    year: 2023,
    uncertainty: 8
  },

  // TRANSPORTATION
  {
    id: 'gasoline_car_average',
    category: 'transportation',
    activity: 'gasoline_car_driving',
    unit: 'mile',
    co2eKgPerUnit: 0.404, // kg CO2e per mile (average car)
    region: 'US',
    source: 'EPA Transportation',
    year: 2023,
    uncertainty: 10
  },
  {
    id: 'gasoline_car_efficient',
    category: 'transportation',
    activity: 'gasoline_car_efficient',
    unit: 'mile',
    co2eKgPerUnit: 0.271, // kg CO2e per mile (efficient car ~35 MPG)
    region: 'US',
    source: 'EPA Transportation',
    year: 2023,
    uncertainty: 8
  },
  {
    id: 'electric_vehicle',
    category: 'transportation',
    activity: 'electric_vehicle_driving',
    unit: 'mile',
    co2eKgPerUnit: 0.15, // kg CO2e per mile (includes electricity generation)
    region: 'US',
    source: 'EPA Transportation with eGRID',
    year: 2023,
    uncertainty: 20
  },
  {
    id: 'public_bus',
    category: 'transportation',
    activity: 'bus_transit',
    unit: 'mile',
    co2eKgPerUnit: 0.089, // kg CO2e per passenger-mile
    region: 'US',
    source: 'FTA National Transit Database',
    year: 2023,
    uncertainty: 15
  },
  {
    id: 'subway_train',
    category: 'transportation',
    activity: 'rail_transit',
    unit: 'mile',
    co2eKgPerUnit: 0.062, // kg CO2e per passenger-mile
    region: 'US',
    source: 'FTA National Transit Database',
    year: 2023,
    uncertainty: 12
  },
  {
    id: 'domestic_flight',
    category: 'transportation',
    activity: 'domestic_flight',
    unit: 'mile',
    co2eKgPerUnit: 0.257, // kg CO2e per passenger-mile
    region: 'US',
    source: 'EPA Transportation',
    year: 2023,
    uncertainty: 18
  },
  {
    id: 'international_flight',
    category: 'transportation',
    activity: 'international_flight',
    unit: 'mile',
    co2eKgPerUnit: 0.188, // kg CO2e per passenger-mile (more efficient per mile)
    region: 'global',
    source: 'IPCC Aviation',
    year: 2023,
    uncertainty: 22
  },

  // FOOD AND CONSUMPTION
  {
    id: 'beef_consumption',
    category: 'consumption',
    activity: 'beef_consumption',
    unit: 'kg',
    co2eKgPerUnit: 60.0, // kg CO2e per kg beef
    region: 'global',
    source: 'FAO GLEAM 2023',
    year: 2023,
    uncertainty: 30
  },
  {
    id: 'pork_consumption',
    category: 'consumption',
    activity: 'pork_consumption', 
    unit: 'kg',
    co2eKgPerUnit: 7.6, // kg CO2e per kg pork
    region: 'global',
    source: 'FAO GLEAM 2023',
    year: 2023,
    uncertainty: 25
  },
  {
    id: 'chicken_consumption',
    category: 'consumption',
    activity: 'chicken_consumption',
    unit: 'kg',
    co2eKgPerUnit: 6.9, // kg CO2e per kg chicken
    region: 'global',
    source: 'FAO GLEAM 2023',
    year: 2023,
    uncertainty: 20
  },
  {
    id: 'dairy_consumption',
    category: 'consumption',
    activity: 'dairy_consumption',
    unit: 'liter',
    co2eKgPerUnit: 3.2, // kg CO2e per liter milk
    region: 'global',
    source: 'FAO GLEAM 2023',
    year: 2023,
    uncertainty: 25
  },
  {
    id: 'rice_consumption',
    category: 'consumption',
    activity: 'rice_consumption',
    unit: 'kg',
    co2eKgPerUnit: 2.7, // kg CO2e per kg rice
    region: 'global',
    source: 'IPCC Agriculture',
    year: 2023,
    uncertainty: 18
  },
  {
    id: 'vegetables_consumption',
    category: 'consumption',
    activity: 'vegetables_consumption',
    unit: 'kg',
    co2eKgPerUnit: 0.4, // kg CO2e per kg vegetables (average)
    region: 'global',
    source: 'IPCC Agriculture',
    year: 2023,
    uncertainty: 30
  },

  // WASTE
  {
    id: 'municipal_waste',
    category: 'consumption',
    activity: 'municipal_waste_generation',
    unit: 'kg',
    co2eKgPerUnit: 0.5, // kg CO2e per kg waste (includes methane from landfills)
    region: 'US',
    source: 'EPA Waste Management',
    year: 2023,
    uncertainty: 35
  }
];

class CarbonCalculatorService {
  private cache: MemoryCache;
  private emissionFactors: Map<string, EmissionFactor>;

  constructor() {
    this.cache = new MemoryCache();
    this.emissionFactors = new Map();
    this.loadEmissionFactors();
  }

  private loadEmissionFactors(): void {
    EMISSION_FACTORS.forEach(factor => {
      this.emissionFactors.set(factor.id, factor);
    });
    
    logger.info(`✅ Loaded ${EMISSION_FACTORS.length} emission factors for carbon calculations`);
  }

  async calculateCarbonFootprint(request: CarbonCalculationRequest): Promise<CarbonCalculationResponse> {
    try {
      logger.info(`🧮 Calculating carbon footprint for ${request.activities.length} activities`);

      const calculations = [];
      let totalCO2e = 0;

      for (const activity of request.activities) {
        const calculation = await this.calculateActivityEmissions(activity, request.location);
        calculations.push(calculation);
        totalCO2e += calculation.co2eKg;
      }

      // Create breakdown with percentages
      const breakdown = calculations.map(calc => ({
        activity: calc.activity,
        co2eKg: calc.co2eKg,
        percentage: Math.round((calc.co2eKg / totalCO2e) * 100)
      }));

      const response: CarbonCalculationResponse = {
        totalCO2eKg: Math.round(totalCO2e * 100) / 100, // round to 2 decimal places
        breakdown,
        methodology: 'EPA and IPCC emission factors with location adjustments',
        sources: [...new Set(calculations.map(c => c.source))], // unique sources
        calculatedAt: new Date().toISOString(),
        confidence: this.calculateOverallConfidence(calculations)
      };

      return response;

    } catch (error) {
      logger.error('❌ Failed to calculate carbon footprint:', error);
      throw new Error('Carbon footprint calculation failed');
    }
  }

  async calculatePersonalFootprint(profile: PersonalProfile): Promise<CurrentFootprint> {
    try {
      logger.info(`👤 Calculating personal carbon footprint for ${profile.location.address}`);

      // Generate typical activities based on profile
      const activities = this.generateTypicalActivities(profile);
      
      // Calculate emissions
      const calculation = await this.calculateCarbonFootprint({
        activities,
        location: profile.location
      });

      // Break down by category
      const categoryTotals = {
        energy: 0,
        transportation: 0,
        food: 0,
        consumption: 0,
        other: 0
      };

      calculation.breakdown.forEach(item => {
        const factor = this.findEmissionFactor(item.activity);
        if (factor) {
          switch (factor.category) {
            case 'energy':
              categoryTotals.energy += item.co2eKg;
              break;
            case 'transportation':
              categoryTotals.transportation += item.co2eKg;
              break;
            case 'consumption':
              if (['beef', 'pork', 'chicken', 'dairy', 'rice', 'vegetables'].some(food => item.activity.includes(food))) {
                categoryTotals.food += item.co2eKg;
              } else {
                categoryTotals.consumption += item.co2eKg;
              }
              break;
            default:
              categoryTotals.other += item.co2eKg;
          }
        }
      });

      // Get comparison data (would be from database in production)
      const comparisons = this.getFootprintComparisons(calculation.totalCO2eKg, profile.location);

      const footprint: CurrentFootprint = {
        totalCO2PerYear: calculation.totalCO2eKg,
        breakdown: categoryTotals,
        comparisonToAverage: comparisons,
        calculationMethod: calculation.methodology,
        confidenceLevel: calculation.confidence,
        lastCalculated: calculation.calculatedAt
      };

      return footprint;

    } catch (error) {
      logger.error('❌ Failed to calculate personal footprint:', error);
      throw new Error('Personal footprint calculation failed');
    }
  }

  private async calculateActivityEmissions(activity: ActivityData, location: any): Promise<any> {
    // Find appropriate emission factor
    let factor = this.findEmissionFactorForActivity(activity.activityType, location?.country);
    
    if (!factor) {
      // Fallback to global or default factor
      factor = this.findEmissionFactor(activity.activityType) || this.getDefaultFactor(activity.activityType);
    }

    if (!factor) {
      logger.warn(`⚠️ No emission factor found for activity: ${activity.activityType}`);
      return {
        activity: activity.activityType,
        co2eKg: 0,
        source: 'Unknown',
        confidence: 0
      };
    }

    // Convert amount to annual if needed
    let annualAmount = activity.amount;
    switch (activity.timeframe) {
      case 'daily':
        annualAmount *= 365;
        break;
      case 'weekly':
        annualAmount *= 52;
        break;
      case 'monthly':
        annualAmount *= 12;
        break;
      // yearly is already correct
    }

    const co2eKg = annualAmount * factor.co2eKgPerUnit;

    return {
      activity: activity.activityType,
      co2eKg: co2eKg,
      source: factor.source,
      confidence: 100 - (factor.uncertainty || 15)
    };
  }

  private generateTypicalActivities(profile: PersonalProfile): ActivityData[] {
    const activities: ActivityData[] = [];
    const householdSize = profile.householdSize || 1;

    // ENERGY - Electricity consumption (varies by dwelling type)
    let electricityKwh = 10000; // US average household
    if (profile.dwellingType === 'apartment') electricityKwh *= 0.6;
    if (profile.dwellingType === 'house') electricityKwh *= 1.1;
    electricityKwh *= Math.sqrt(householdSize); // not linear scaling

    activities.push({
      activityType: 'electricity_consumption',
      amount: electricityKwh,
      unit: 'kwh',
      timeframe: 'yearly'
    });

    // TRANSPORTATION - Car driving (if no public transit preference)
    if (!profile.currentTransportModes?.includes('public_transit')) {
      const milesPerYear = 12000; // US average
      activities.push({
        activityType: 'gasoline_car_driving',
        amount: milesPerYear,
        unit: 'mile',
        timeframe: 'yearly'
      });
    } else {
      // Some car + public transit
      activities.push({
        activityType: 'gasoline_car_driving',
        amount: 6000, // reduced car use
        unit: 'mile', 
        timeframe: 'yearly'
      });
      activities.push({
        activityType: 'bus_transit',
        amount: 2000,
        unit: 'mile',
        timeframe: 'yearly'
      });
    }

    // FOOD - Diet-based calculations
    if (profile.dietType === 'vegan') {
      activities.push(
        { activityType: 'vegetables_consumption', amount: 200 * householdSize, unit: 'kg', timeframe: 'yearly' },
        { activityType: 'rice_consumption', amount: 50 * householdSize, unit: 'kg', timeframe: 'yearly' }
      );
    } else if (profile.dietType === 'vegetarian') {
      activities.push(
        { activityType: 'vegetables_consumption', amount: 150 * householdSize, unit: 'kg', timeframe: 'yearly' },
        { activityType: 'dairy_consumption', amount: 200 * householdSize, unit: 'liter', timeframe: 'yearly' },
        { activityType: 'rice_consumption', amount: 40 * householdSize, unit: 'kg', timeframe: 'yearly' }
      );
    } else {
      // Omnivore diet (US average)
      activities.push(
        { activityType: 'beef_consumption', amount: 25 * householdSize, unit: 'kg', timeframe: 'yearly' },
        { activityType: 'pork_consumption', amount: 20 * householdSize, unit: 'kg', timeframe: 'yearly' },
        { activityType: 'chicken_consumption', amount: 50 * householdSize, unit: 'kg', timeframe: 'yearly' },
        { activityType: 'dairy_consumption', amount: 180 * householdSize, unit: 'liter', timeframe: 'yearly' },
        { activityType: 'vegetables_consumption', amount: 100 * householdSize, unit: 'kg', timeframe: 'yearly' }
      );
    }

    // WASTE
    const wasteKg = 700 * householdSize; // US average per person
    activities.push({
      activityType: 'municipal_waste_generation',
      amount: wasteKg,
      unit: 'kg',
      timeframe: 'yearly'
    });

    return activities;
  }

  private findEmissionFactorForActivity(activityType: string, region?: string): EmissionFactor | undefined {
    // First try to find region-specific factor
    if (region) {
      for (const factor of this.emissionFactors.values()) {
        if (factor.activity === activityType && factor.region === region) {
          return factor;
        }
      }
      
      // Try country-specific (US-CA -> US)
      const countryCode = region.split('-')[0];
      for (const factor of this.emissionFactors.values()) {
        if (factor.activity === activityType && factor.region === countryCode) {
          return factor;
        }
      }
    }

    // Fall back to global or first match
    for (const factor of this.emissionFactors.values()) {
      if (factor.activity === activityType) {
        return factor;
      }
    }

    return undefined;
  }

  private findEmissionFactor(id: string): EmissionFactor | undefined {
    return this.emissionFactors.get(id);
  }

  private getDefaultFactor(activityType: string): EmissionFactor | undefined {
    // Provide reasonable defaults for unknown activities
    const defaults: Record<string, Partial<EmissionFactor>> = {
      'unknown_electricity': { co2eKgPerUnit: 0.4, unit: 'kwh' },
      'unknown_transport': { co2eKgPerUnit: 0.4, unit: 'mile' },
      'unknown_consumption': { co2eKgPerUnit: 2.0, unit: 'kg' }
    };

    const defaultKey = Object.keys(defaults).find(key => activityType.includes(key.replace('unknown_', '')));
    
    if (defaultKey) {
      const defaultData = defaults[defaultKey];
      return {
        id: `default_${activityType}`,
        category: 'consumption',
        activity: activityType,
        unit: defaultData.unit!,
        co2eKgPerUnit: defaultData.co2eKgPerUnit!,
        region: 'global',
        source: 'Default Estimate',
        year: 2023,
        uncertainty: 50
      };
    }

    return undefined;
  }

  private calculateOverallConfidence(calculations: any[]): number {
    if (calculations.length === 0) return 0;
    
    const totalWeight = calculations.reduce((sum, calc) => sum + calc.co2eKg, 0);
    const weightedConfidence = calculations.reduce((sum, calc) => {
      const weight = calc.co2eKg / totalWeight;
      return sum + (calc.confidence * weight);
    }, 0);

    return Math.round(weightedConfidence);
  }

  private getFootprintComparisons(totalCO2: number, location: any): { local: number, national: number, global: number } {
    // Average footprints (kg CO2e per year)
    const averages = {
      global: 4800,    // Global average
      national: 16000, // US average (would vary by country)
      local: 14000     // Would be calculated from local data
    };

    return {
      local: Math.round(((totalCO2 / averages.local) - 1) * 100),
      national: Math.round(((totalCO2 / averages.national) - 1) * 100),
      global: Math.round(((totalCO2 / averages.global) - 1) * 100)
    };
  }

  // Quick calculation methods for common scenarios
  async quickElectricityFootprint(kwhPerYear: number, location: any): Promise<number> {
    const factor = this.findEmissionFactorForActivity('electricity_consumption', location?.country) ||
                   this.emissionFactors.get('electricity_us_average');
    
    return factor ? kwhPerYear * factor.co2eKgPerUnit : 0;
  }

  async quickDrivingFootprint(milesPerYear: number, vehicleType: 'average' | 'efficient' | 'electric' = 'average'): Promise<number> {
    const factorMap = {
      'average': 'gasoline_car_average',
      'efficient': 'gasoline_car_efficient',
      'electric': 'electric_vehicle'
    };

    const factor = this.emissionFactors.get(factorMap[vehicleType]);
    return factor ? milesPerYear * factor.co2eKgPerUnit : 0;
  }

  async quickDietFootprint(dietType: 'omnivore' | 'vegetarian' | 'vegan', householdSize: number = 1): Promise<number> {
    const dietEmissions = {
      'vegan': 1500,      // kg CO2e per person per year
      'vegetarian': 2500,
      'omnivore': 3300    // US average
    };

    return dietEmissions[dietType] * householdSize;
  }
}

export const carbonCalculatorService = new CarbonCalculatorService();