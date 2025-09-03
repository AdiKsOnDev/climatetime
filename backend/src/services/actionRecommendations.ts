import { logger } from '../utils/logger';
import { MemoryCache } from '../utils/cache';
import {
  ClimateAction,
  PersonalProfile,
  RecommendationRequest,
  RecommendationResponse,
  PersonalizedRecommendation,
  ImpactMetrics,
  ActionCategory,
  LocalOpportunity,
  ActionTemplate,
  EmissionFactor
} from '../types/actions';

// In-memory action database (in production, this would be in a database)
const ACTION_DATABASE: ClimateAction[] = [
  // ENERGY CATEGORY
  {
    id: 'led-bulbs-upgrade',
    title: 'Switch to LED Light Bulbs',
    description: 'Replace incandescent and CFL bulbs with energy-efficient LEDs',
    detailedDescription: `## Why Switch to LED Bulbs?\n\nLED bulbs use **75% less energy** and last 25 times longer than incandescent bulbs. This simple switch is one of the easiest ways to reduce your energy consumption and carbon footprint.\n\n### Benefits:\n- Immediate energy savings on your electricity bill\n- Reduce CO₂ emissions from power generation\n- Less frequent bulb replacements reduce waste\n- Better light quality and dimming options`,
    category: 'energy',
    difficulty: 'easy',
    timeframe: 'immediate',
    costLevel: 'low',
    impact: {
      co2ReductionKgPerYear: 180,
      costSavingsPerYear: 45,
      energySavingsKwhPerYear: 500,
      confidenceLevel: 95
    },
    applicableRegions: ['global'],
    locationSpecific: false,
    prerequisites: [],
    barriers: ['upfront_cost', 'bulb_compatibility'],
    steps: [
      {
        order: 1,
        title: 'Audit Current Lighting',
        description: 'Count and identify all incandescent and CFL bulbs in your home',
        estimatedTimeMinutes: 20
      },
      {
        order: 2,
        title: 'Choose LED Replacements',
        description: 'Select LED bulbs with equivalent brightness (lumens) and color temperature',
        estimatedTimeMinutes: 30,
        cost: 5 // per bulb
      },
      {
        order: 3,
        title: 'Install LED Bulbs',
        description: 'Replace bulbs starting with the most-used fixtures first',
        estimatedTimeMinutes: 5 // per bulb
      }
    ],
    resources: [
      {
        id: 'led-buying-guide',
        type: 'website',
        title: 'LED Bulb Buying Guide',
        url: 'https://www.energystar.gov/products/lighting_fans/light_bulbs/learn_about_led_bulbs',
        description: 'Energy Star guide to choosing the right LED bulbs'
      },
      {
        id: 'led-calculator',
        type: 'calculator',
        title: 'LED Savings Calculator',
        url: 'https://www.energystar.gov/productfinder/product/certified-light-bulbs/details/2310',
        description: 'Calculate your potential savings from switching to LEDs'
      }
    ],
    tags: ['lighting', 'energy_efficiency', 'electricity', 'home_improvement'],
    sources: ['EPA Energy Star', 'DOE Lighting Facts'],
    lastUpdated: '2025-01-01T00:00:00Z',
    verified: true
  },
  
  {
    id: 'programmable-thermostat',
    title: 'Install a Programmable Thermostat',
    description: 'Automatically control heating and cooling to reduce energy waste',
    detailedDescription: `## Smart Temperature Control\n\nProgrammable thermostats can **save up to 10%** on heating and cooling costs by automatically adjusting temperatures when you're away or asleep.\n\n### Key Features:\n- **7-day scheduling**: Different programs for weekdays and weekends\n- **Smart learning**: Some models learn your preferences\n- **Remote control**: Adjust from anywhere via smartphone\n- **Energy reports**: Track your usage patterns`,
    category: 'energy',
    difficulty: 'moderate',
    timeframe: 'short_term',
    costLevel: 'low',
    impact: {
      co2ReductionKgPerYear: 800,
      costSavingsPerYear: 180,
      energySavingsKwhPerYear: 2400,
      confidenceLevel: 90,
      timeToPayback: 8
    },
    applicableRegions: ['global'],
    locationSpecific: true, // climate affects savings
    prerequisites: ['owns_home_or_controls_thermostat'],
    barriers: ['installation_complexity', 'existing_wiring'],
    steps: [
      {
        order: 1,
        title: 'Check Current System',
        description: 'Verify compatibility with your heating/cooling system',
        estimatedTimeMinutes: 15
      },
      {
        order: 2,
        title: 'Choose Thermostat Model',
        description: 'Select based on system compatibility and desired features',
        estimatedTimeMinutes: 30,
        cost: 150
      },
      {
        order: 3,
        title: 'Install Thermostat',
        description: 'Follow manufacturer instructions or hire a professional',
        estimatedTimeMinutes: 60
      },
      {
        order: 4,
        title: 'Program Schedule',
        description: 'Set up heating/cooling schedule based on your routine',
        estimatedTimeMinutes: 30
      }
    ],
    resources: [
      {
        id: 'thermostat-rebates',
        type: 'rebate',
        title: 'Utility Rebate Programs',
        description: 'Many utilities offer rebates for programmable thermostats'
      }
    ],
    tags: ['hvac', 'automation', 'energy_efficiency', 'smart_home'],
    sources: ['EPA Energy Star', 'DOE Home Energy Audits'],
    lastUpdated: '2025-01-01T00:00:00Z',
    verified: true
  },

  // TRANSPORTATION CATEGORY
  {
    id: 'public-transit-switch',
    title: 'Switch to Public Transportation',
    description: 'Replace car trips with buses, trains, or other public transit',
    detailedDescription: `## The Power of Shared Transportation\n\nPublic transportation produces **45% fewer CO₂ emissions** per passenger mile than private vehicles. A single bus can replace up to 40 cars on the road.\n\n### Environmental Benefits:\n- Dramatically lower carbon footprint per trip\n- Reduced air pollution in urban areas\n- Less traffic congestion\n- Decreased demand for parking infrastructure\n\n### Personal Benefits:\n- **Save money**: Often cheaper than car ownership costs\n- **Reduce stress**: No driving in traffic\n- **Productive time**: Read, work, or relax during commutes\n- **Health**: Often involves walking to/from stations`,
    category: 'transportation',
    difficulty: 'moderate',
    timeframe: 'immediate',
    costLevel: 'low',
    impact: {
      co2ReductionKgPerYear: 2400,
      costSavingsPerYear: 1200,
      confidenceLevel: 85
    },
    applicableRegions: ['urban_areas'],
    locationSpecific: true,
    prerequisites: ['public_transit_available'],
    barriers: ['route_convenience', 'schedule_flexibility', 'weather_exposure'],
    steps: [
      {
        order: 1,
        title: 'Research Transit Options',
        description: 'Map out bus and train routes for your regular destinations',
        estimatedTimeMinutes: 60
      },
      {
        order: 2,
        title: 'Plan Trial Trips',
        description: 'Test routes and timing for important destinations like work',
        estimatedTimeMinutes: 120,
        cost: 10 // trial passes
      },
      {
        order: 3,
        title: 'Get Monthly Pass',
        description: 'Purchase ongoing transit pass based on your usage',
        cost: 100 // monthly pass estimate
      },
      {
        order: 4,
        title: 'Track Savings',
        description: 'Monitor reduced car usage and associated cost savings',
        estimatedTimeMinutes: 15
      }
    ],
    resources: [
      {
        id: 'transit-apps',
        type: 'website',
        title: 'Transit Planning Apps',
        description: 'Apps like Citymapper, Transit, and Google Maps for route planning'
      }
    ],
    tags: ['commuting', 'urban_mobility', 'cost_savings', 'public_transport'],
    sources: ['EPA Transportation Analysis', 'American Public Transportation Association'],
    lastUpdated: '2025-01-01T00:00:00Z',
    verified: true
  },

  {
    id: 'bike-commuting',
    title: 'Start Bike Commuting',
    description: 'Replace short car trips with bicycle transportation',
    detailedDescription: `## Zero-Emission Personal Mobility\n\nBicycling produces **zero direct emissions** and provides exercise. For trips under 5 miles, bikes can often be faster than cars in urban areas.\n\n### Environmental Impact:\n- No fuel consumption or emissions\n- Minimal manufacturing footprint compared to cars\n- No parking infrastructure needed\n- Reduced road wear and maintenance\n\n### Health Benefits:\n- **Cardiovascular fitness**: Regular aerobic exercise\n- **Mental health**: Outdoor activity reduces stress\n- **Cost effective**: Low purchase and maintenance costs\n- **Parking**: Park almost anywhere for free`,
    category: 'transportation',
    difficulty: 'moderate',
    timeframe: 'short_term',
    costLevel: 'medium',
    impact: {
      co2ReductionKgPerYear: 1800,
      costSavingsPerYear: 800,
      confidenceLevel: 90
    },
    applicableRegions: ['urban_areas', 'bike_friendly'],
    locationSpecific: true,
    prerequisites: ['bike_infrastructure', 'reasonable_distances'],
    barriers: ['weather', 'physical_fitness', 'safety_concerns', 'bike_theft'],
    steps: [
      {
        order: 1,
        title: 'Assess Route Safety',
        description: 'Map bike-friendly routes to regular destinations',
        estimatedTimeMinutes: 45
      },
      {
        order: 2,
        title: 'Get Proper Equipment',
        description: 'Purchase or tune up bike, helmet, lights, and lock',
        estimatedTimeMinutes: 120,
        cost: 400 // basic commuter setup
      },
      {
        order: 3,
        title: 'Start with Short Trips',
        description: 'Begin with easy destinations and build up distance/confidence',
        estimatedTimeMinutes: 30 // per trip
      },
      {
        order: 4,
        title: 'Plan for Weather',
        description: 'Get appropriate clothing and backup transportation plans',
        cost: 100 // weather gear
      }
    ],
    resources: [
      {
        id: 'bike-safety',
        type: 'website',
        title: 'Bicycle Safety Guide',
        url: 'https://www.nhtsa.gov/road-safety/bicycle-safety',
        description: 'NHTSA guide to safe cycling practices'
      },
      {
        id: 'bike-maps',
        type: 'website',
        title: 'Bike Route Planning',
        description: 'Apps and websites for finding bike-friendly routes'
      }
    ],
    tags: ['cycling', 'health', 'zero_emissions', 'urban_mobility'],
    sources: ['EPA Transportation', 'League of American Bicyclists'],
    lastUpdated: '2025-01-01T00:00:00Z',
    verified: true
  },

  // HOME CATEGORY
  {
    id: 'insulation-upgrade',
    title: 'Improve Home Insulation',
    description: 'Add or upgrade attic, wall, and basement insulation to reduce heating/cooling needs',
    detailedDescription: `## The Foundation of Energy Efficiency\n\nProper insulation can **reduce heating and cooling costs by 15%** while making your home more comfortable year-round.\n\n### Why Insulation Matters:\n- **Year-round savings**: Keeps heat in during winter, out during summer\n- **Comfort improvement**: More consistent temperatures throughout home\n- **Noise reduction**: Better sound insulation from outside\n- **Increased home value**: Energy efficiency improvements add resale value\n\n### Priority Areas:\n1. **Attic**: Usually the biggest opportunity for improvement\n2. **Basement/Crawl space**: Often overlooked but significant impact\n3. **Walls**: More complex but very effective in older homes`,
    category: 'home',
    difficulty: 'challenging',
    timeframe: 'short_term',
    costLevel: 'high',
    impact: {
      co2ReductionKgPerYear: 1500,
      costSavingsPerYear: 400,
      energySavingsKwhPerYear: 4000,
      confidenceLevel: 90,
      timeToPayback: 36
    },
    applicableRegions: ['cold_climates', 'hot_climates'],
    locationSpecific: true,
    prerequisites: ['owns_home', 'access_to_attic_basement'],
    barriers: ['high_upfront_cost', 'installation_complexity', 'home_disruption'],
    steps: [
      {
        order: 1,
        title: 'Energy Audit',
        description: 'Professional assessment of current insulation and air leaks',
        estimatedTimeMinutes: 180,
        cost: 400
      },
      {
        order: 2,
        title: 'Plan Insulation Upgrade',
        description: 'Choose insulation types and R-values for your climate zone',
        estimatedTimeMinutes: 120
      },
      {
        order: 3,
        title: 'Seal Air Leaks First',
        description: 'Caulk and weather-strip before adding insulation',
        estimatedTimeMinutes: 480,
        cost: 200
      },
      {
        order: 4,
        title: 'Install Insulation',
        description: 'Add insulation to attic, walls, and basement as planned',
        cost: 2500 // professional installation
      }
    ],
    resources: [
      {
        id: 'insulation-rebates',
        type: 'rebate',
        title: 'Energy Efficiency Rebates',
        description: 'Federal, state, and utility rebates for insulation upgrades'
      },
      {
        id: 'rvalue-map',
        type: 'website',
        title: 'Recommended R-Values by Zone',
        url: 'https://www.energystar.gov/saveathome/seal_insulate/methodology',
        description: 'Energy Star recommendations for your climate zone'
      }
    ],
    tags: ['insulation', 'hvac_efficiency', 'home_improvement', 'weatherization'],
    sources: ['EPA Energy Star', 'DOE Insulation Guidelines'],
    lastUpdated: '2025-01-01T00:00:00Z',
    verified: true
  },

  // CONSUMPTION CATEGORY
  {
    id: 'reduce-meat-consumption',
    title: 'Reduce Meat Consumption',
    description: 'Decrease environmental impact by eating less meat, especially beef',
    detailedDescription: `## The Climate Impact of Food Choices\n\nLivestock production accounts for **14.5% of global greenhouse gas emissions**. Reducing meat consumption, especially beef, is one of the most impactful dietary changes you can make.\n\n### Environmental Benefits:\n- **Lower emissions**: Beef produces 20x more CO₂ than beans per gram of protein\n- **Water conservation**: Animal agriculture uses 70% of agricultural water\n- **Land use**: Plant-based foods require 75% less land\n- **Pollution reduction**: Less agricultural runoff and methane emissions\n\n### Health Benefits:\n- **Heart health**: Lower saturated fat intake\n- **Chronic disease**: Reduced risk of certain cancers and diabetes\n- **Weight management**: Plant-based meals often lower in calories\n- **Longevity**: Mediterranean and plant-forward diets linked to longer life`,
    category: 'consumption',
    difficulty: 'moderate',
    timeframe: 'immediate',
    costLevel: 'free',
    impact: {
      co2ReductionKgPerYear: 1200,
      costSavingsPerYear: 300,
      confidenceLevel: 85
    },
    applicableRegions: ['global'],
    locationSpecific: false,
    prerequisites: [],
    barriers: ['cultural_habits', 'family_preferences', 'cooking_skills', 'protein_concerns'],
    steps: [
      {
        order: 1,
        title: 'Track Current Consumption',
        description: 'Log your current meat consumption for one week',
        estimatedTimeMinutes: 5 // daily
      },
      {
        order: 2,
        title: 'Choose Meatless Days',
        description: 'Start with 1-2 meatless days per week (like "Meatless Monday")',
        estimatedTimeMinutes: 30 // meal planning
      },
      {
        order: 3,
        title: 'Learn Plant-Based Recipes',
        description: 'Build a collection of satisfying vegetarian meals you enjoy',
        estimatedTimeMinutes: 60
      },
      {
        order: 4,
        title: 'Gradual Reduction',
        description: 'Slowly increase meatless days and reduce portion sizes',
        estimatedTimeMinutes: 15 // ongoing planning
      }
    ],
    resources: [
      {
        id: 'meatless-monday',
        type: 'website',
        title: 'Meatless Monday',
        url: 'https://www.mondaycampaigns.org/meatless-monday',
        description: 'Recipes and tips for weekly meatless meals'
      },
      {
        id: 'plant-protein-guide',
        type: 'document',
        title: 'Complete Plant Protein Guide',
        description: 'How to get complete proteins from plant sources'
      }
    ],
    tags: ['diet', 'plant_based', 'health', 'agriculture'],
    sources: ['FAO Livestock Report', 'Harvard Health Publishing'],
    lastUpdated: '2025-01-01T00:00:00Z',
    verified: true
  },

  // COMMUNITY CATEGORY
  {
    id: 'community-garden',
    title: 'Join or Start a Community Garden',
    description: 'Participate in local food production and carbon sequestration',
    detailedDescription: `## Growing Food, Building Community\n\nCommunity gardens provide **local food production**, reduce transportation emissions, and create green spaces that sequester carbon.\n\n### Environmental Benefits:\n- **Food miles reduction**: Locally grown produce travels virtually no distance\n- **Carbon sequestration**: Plants and soil store CO₂ from atmosphere\n- **Biodiversity**: Gardens support pollinators and local ecosystems\n- **Stormwater management**: Soil absorption reduces runoff\n\n### Community Benefits:\n- **Social connection**: Meet neighbors and build relationships\n- **Skill sharing**: Learn from experienced gardeners\n- **Food security**: Access to fresh, healthy produce\n- **Mental health**: Therapeutic benefits of gardening and nature`,
    category: 'community',
    difficulty: 'moderate',
    timeframe: 'short_term',
    costLevel: 'low',
    impact: {
      co2ReductionKgPerYear: 300,
      costSavingsPerYear: 120,
      confidenceLevel: 75
    },
    applicableRegions: ['urban_areas', 'suburban_areas'],
    locationSpecific: true,
    prerequisites: ['available_space', 'community_interest'],
    barriers: ['time_commitment', 'seasonal_limitations', 'physical_demands'],
    steps: [
      {
        order: 1,
        title: 'Find Local Gardens',
        description: 'Search for existing community gardens in your area',
        estimatedTimeMinutes: 30
      },
      {
        order: 2,
        title: 'Visit and Join',
        description: 'Tour gardens and sign up for a plot or volunteer opportunities',
        estimatedTimeMinutes: 60,
        cost: 50 // typical plot fee
      },
      {
        order: 3,
        title: 'Start Small',
        description: 'Begin with easy-to-grow crops like herbs and lettuce',
        estimatedTimeMinutes: 60,
        cost: 30 // seeds and basic tools
      },
      {
        order: 4,
        title: 'Regular Participation',
        description: 'Maintain your plot and participate in garden activities',
        estimatedTimeMinutes: 120 // weekly
      }
    ],
    resources: [
      {
        id: 'community-garden-locator',
        type: 'website',
        title: 'Community Garden Locator',
        description: 'Find community gardens near you'
      },
      {
        id: 'gardening-basics',
        type: 'document',
        title: 'Beginner Gardening Guide',
        description: 'Basic techniques for successful vegetable gardening'
      }
    ],
    tags: ['gardening', 'local_food', 'community_engagement', 'carbon_sequestration'],
    sources: ['American Community Gardening Association', 'EPA Urban Agriculture'],
    lastUpdated: '2025-01-01T00:00:00Z',
    verified: true
  }
];

// Sample local opportunities (would be populated from external APIs)
const SAMPLE_LOCAL_OPPORTUNITIES: LocalOpportunity[] = [
  {
    id: 'local-solar-program',
    title: 'Community Solar Program',
    description: 'Subscribe to local solar farm and reduce electricity emissions',
    type: 'program',
    organization: 'Local Utility Company',
    contactInfo: [
      {
        id: 'solar-phone',
        type: 'phone',
        title: 'Solar Program Hotline',
        phoneNumber: '1-800-SOLAR-01'
      }
    ],
    location: { lat: 0, lon: 0, address: 'Local Area' },
    radius: 50,
    category: 'energy'
  }
];

class ActionRecommendationService {
  private cache: MemoryCache;
  private emissionFactors: Map<string, EmissionFactor>;

  constructor() {
    this.cache = new MemoryCache();
    this.emissionFactors = new Map();
    this.loadEmissionFactors();
  }

  private loadEmissionFactors(): void {
    // Basic emission factors (in production, load from database or external API)
    const factors: EmissionFactor[] = [
      {
        id: 'electricity_us_grid',
        category: 'energy',
        activity: 'electricity_consumption',
        unit: 'kwh',
        co2eKgPerUnit: 0.4, // kg CO2e per kWh (US average)
        region: 'US',
        source: 'EPA eGRID',
        year: 2023,
        uncertainty: 15
      },
      {
        id: 'gasoline_car_driving',
        category: 'transportation', 
        activity: 'gasoline_car_driving',
        unit: 'mile',
        co2eKgPerUnit: 0.4, // kg CO2e per mile
        region: 'US',
        source: 'EPA Transportation',
        year: 2023,
        uncertainty: 10
      },
      {
        id: 'beef_consumption',
        category: 'consumption',
        activity: 'beef_consumption', 
        unit: 'kg',
        co2eKgPerUnit: 60, // kg CO2e per kg beef
        region: 'global',
        source: 'FAO GLEAM',
        year: 2023,
        uncertainty: 25
      }
    ];

    factors.forEach(factor => {
      this.emissionFactors.set(factor.id, factor);
    });

    logger.info('✅ Loaded emission factors for carbon calculations');
  }

  async getPersonalizedRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      logger.info(`🤖 Generating personalized recommendations for ${request.profile.location.address}`);
      
      // Generate cache key based on profile
      const cacheKey = this.generateCacheKey(request);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.info('✅ Returning cached recommendations');
        return cached as RecommendationResponse;
      }

      // Score and filter actions based on user profile
      const scoredActions = await this.scoreActions(request);
      
      // Sort by relevance score and take top recommendations
      const maxRecs = request.preferences?.maxRecommendations || 6;
      const topActions = scoredActions
        .sort((a, b) => b.personalizationScore - a.personalizationScore)
        .slice(0, maxRecs);

      // Get alternative actions (next best options)
      const alternatives = scoredActions
        .slice(maxRecs, maxRecs + 4)
        .filter(action => action.personalizationScore > 50);

      // Calculate total potential impact
      const totalImpact = this.calculateTotalImpact(topActions);

      // Get local opportunities
      const localOpportunities = await this.getLocalOpportunities(request.profile.location);

      // Generate next steps
      const nextSteps = this.generateNextSteps(topActions);

      const response: RecommendationResponse = {
        recommendations: topActions,
        totalPotentialImpact: totalImpact,
        alternativeActions: alternatives,
        localOpportunities,
        nextSteps,
        confidenceLevel: 85,
        lastUpdated: new Date().toISOString()
      };

      // Cache the response for 6 hours
      this.cache.set(cacheKey, response, 6 * 60 * 60 * 1000);
      
      return response;

    } catch (error) {
      logger.error('❌ Failed to generate recommendations:', error);
      throw new Error('Failed to generate personalized recommendations');
    }
  }

  private async scoreActions(request: RecommendationRequest): Promise<PersonalizedRecommendation[]> {
    const { profile, preferences, climateData } = request;
    const recommendations: PersonalizedRecommendation[] = [];

    for (const action of ACTION_DATABASE) {
      // Skip excluded actions
      if (preferences?.excludeActionIds?.includes(action.id)) {
        continue;
      }

      // Apply filters
      if (preferences?.difficultyLevels && !preferences.difficultyLevels.includes(action.difficulty)) {
        continue;
      }

      if (preferences?.focusAreas && !preferences.focusAreas.includes(action.category)) {
        continue;
      }

      // Calculate personalization score
      const score = this.calculatePersonalizationScore(action, profile, climateData);
      
      if (score < 30) continue; // Skip low-relevance actions

      // Generate reasoning
      const reasoning = this.generateReasoning(action, profile, score);

      // Localize resources
      const localizedResources = await this.localizeResources(action.resources, profile.location);

      // Personalize impact calculation
      const personalImpact = this.personalizeImpact(action.impact, profile);

      recommendations.push({
        action,
        personalizationScore: score,
        reasoning,
        localizedResources,
        estimatedPersonalImpact: personalImpact
      });
    }

    return recommendations;
  }

  private calculatePersonalizationScore(
    action: ClimateAction, 
    profile: PersonalProfile,
    climateData?: any
  ): number {
    let score = 50; // base score

    // Location relevance
    if (action.locationSpecific) {
      if (action.applicableRegions.includes('global')) {
        score += 10;
      } else if (profile.location.country && action.applicableRegions.includes(profile.location.country)) {
        score += 20;
      } else if (action.applicableRegions.includes('urban_areas') && this.isUrbanArea(profile.location)) {
        score += 15;
      } else {
        score -= 20; // not applicable to location
      }
    }

    // Dwelling type compatibility
    if (action.prerequisites.includes('owns_home') && !profile.ownsHome) {
      score -= 30;
    }

    if (action.category === 'energy' && profile.dwellingType === 'apartment') {
      score -= 15; // limited energy control in apartments
    }

    // Budget compatibility
    if (profile.maxInvestmentAmount !== undefined) {
      const actionCost = this.estimateActionCost(action);
      if (actionCost > profile.maxInvestmentAmount) {
        score -= 25;
      } else if (actionCost < profile.maxInvestmentAmount * 0.1) {
        score += 10; // well within budget
      }
    }

    // User preferences alignment
    if (profile.preferredActionTypes?.includes(action.category)) {
      score += 15;
    }

    // Climate data relevance
    if (climateData) {
      if (action.category === 'energy' && climateData.futureProjections) {
        // Higher scores for energy actions in areas with projected warming
        const tempIncrease = climateData.futureProjections.projectionPeriods?.[0]?.changeFromBaseline?.temperature || 0;
        if (tempIncrease > 2) score += 10;
      }
    }

    // Impact potential
    const impactScore = action.impact.co2ReductionKgPerYear / 100; // scale to 0-50 range
    score += Math.min(impactScore, 20);

    // Difficulty penalty based on user availability
    if (action.difficulty === 'challenging' && (profile.timeAvailabilityHours || 0) < 5) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateReasoning(action: ClimateAction, profile: PersonalProfile, score: number): string[] {
    const reasons = [];

    if (score > 80) {
      reasons.push('Highly recommended based on your location and preferences');
    } else if (score > 60) {
      reasons.push('Good fit for your situation');
    }

    if (action.impact.co2ReductionKgPerYear > 1000) {
      reasons.push('High climate impact potential');
    }

    if (action.impact.costSavingsPerYear && action.impact.costSavingsPerYear > 200) {
      reasons.push('Significant cost savings opportunity');
    }

    if (action.difficulty === 'easy') {
      reasons.push('Easy to implement');
    }

    if (action.category === 'energy' && profile.dwellingType === 'house' && profile.ownsHome) {
      reasons.push('Perfect for homeowners');
    }

    return reasons;
  }

  private async localizeResources(resources: any[], location: any): Promise<any[]> {
    // In production, this would query local databases or APIs
    // For now, return the original resources
    return resources;
  }

  private personalizeImpact(baseImpact: ImpactMetrics, profile: PersonalProfile): ImpactMetrics {
    const personalImpact = { ...baseImpact };

    // Adjust based on household size
    if (profile.householdSize && profile.householdSize > 1) {
      personalImpact.co2ReductionKgPerYear *= profile.householdSize * 0.7; // economies of scale
      if (personalImpact.costSavingsPerYear) {
        personalImpact.costSavingsPerYear *= profile.householdSize * 0.8;
      }
    }

    // Adjust based on dwelling type
    if (profile.dwellingType === 'apartment') {
      personalImpact.co2ReductionKgPerYear *= 0.6; // smaller space
      if (personalImpact.energySavingsKwhPerYear) {
        personalImpact.energySavingsKwhPerYear *= 0.6;
      }
    }

    return personalImpact;
  }

  private calculateTotalImpact(recommendations: PersonalizedRecommendation[]): ImpactMetrics {
    const total: ImpactMetrics = {
      co2ReductionKgPerYear: 0,
      costSavingsPerYear: 0,
      energySavingsKwhPerYear: 0,
      confidenceLevel: 80
    };

    recommendations.forEach(rec => {
      total.co2ReductionKgPerYear += rec.estimatedPersonalImpact.co2ReductionKgPerYear;
      if (rec.estimatedPersonalImpact.costSavingsPerYear) {
        total.costSavingsPerYear! += rec.estimatedPersonalImpact.costSavingsPerYear;
      }
      if (rec.estimatedPersonalImpact.energySavingsKwhPerYear) {
        total.energySavingsKwhPerYear! += rec.estimatedPersonalImpact.energySavingsKwhPerYear;
      }
    });

    return total;
  }

  private async getLocalOpportunities(location: any): Promise<LocalOpportunity[]> {
    // In production, query local program databases
    return SAMPLE_LOCAL_OPPORTUNITIES;
  }

  private generateNextSteps(recommendations: PersonalizedRecommendation[]): string[] {
    const steps = [];

    if (recommendations.length > 0) {
      const easiest = recommendations.find(r => r.action.difficulty === 'easy');
      if (easiest) {
        steps.push(`Start with: ${easiest.action.title}`);
      }

      const quickWin = recommendations.find(r => r.action.timeframe === 'immediate');
      if (quickWin && quickWin !== easiest) {
        steps.push(`Quick impact: ${quickWin.action.title}`);
      }

      steps.push('Track your progress and measure actual impact');
      steps.push('Share your actions with friends and family');
    }

    return steps;
  }

  private generateCacheKey(request: RecommendationRequest): string {
    const key = {
      location: `${request.profile.location.lat}-${request.profile.location.lon}`,
      dwelling: request.profile.dwellingType,
      owns: request.profile.ownsHome,
      budget: request.profile.maxInvestmentAmount,
      prefs: request.preferences?.focusAreas?.sort().join('-')
    };
    return `recommendations:${JSON.stringify(key)}`;
  }

  private isUrbanArea(location: any): boolean {
    // Simple heuristic - in production would use population density data
    return location.city && location.city.length > 0;
  }

  private estimateActionCost(action: ClimateAction): number {
    // Estimate total cost from steps
    let totalCost = 0;
    action.steps.forEach(step => {
      if (step.cost) totalCost += step.cost;
    });
    return totalCost;
  }
}

export const actionRecommendationService = new ActionRecommendationService();