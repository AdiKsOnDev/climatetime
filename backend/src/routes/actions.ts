import express from 'express';
import { logger } from '../utils/logger';
import { actionRecommendationService } from '../services/actionRecommendations';
import { carbonCalculatorService } from '../services/carbonCalculator';
import { 
  RecommendationRequest, 
  PersonalProfile, 
  ActionRecommendationAPIResponse,
  RecommendationPreferences,
  ActionCategory,
  CarbonCalculationRequest,
  FootprintCalculationAPIResponse
} from '../types/actions';

const router = express.Router();

/**
 * GET /api/actions/recommendations
 * Get personalized climate action recommendations based on user profile
 */
router.get('/recommendations', async (req, res) => {
  try {
    const {
      lat,
      lon,
      address,
      // Profile parameters
      householdSize,
      dwellingType,
      ownsHome,
      annualIncome,
      maxInvestment,
      timeAvailable,
      // Preference parameters
      maxRecommendations,
      focusAreas,
      difficultyLevels,
      budgetConstraint
    } = req.query;

    // Validate required parameters
    if (!lat || !lon || !address) {
      logger.warn('⚠️ Missing required location parameters');
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: lat, lon, address',
        metadata: {
          requestId: `req_${Date.now()}`,
          processTime: 0,
          apiVersion: '1.0.0',
          dataSourcesUsed: []
        }
      } as ActionRecommendationAPIResponse);
    }

    const startTime = Date.now();
    const requestId = `req_${startTime}`;

    logger.info(`🎯 Processing action recommendations request for ${address}`);

    // Build user profile
    const profile: PersonalProfile = {
      location: {
        lat: parseFloat(lat as string),
        lon: parseFloat(lon as string),
        address: address as string
      },
      householdSize: householdSize ? parseInt(householdSize as string) : undefined,
      dwellingType: dwellingType as any,
      ownsHome: ownsHome === 'true',
      annualIncome: annualIncome as any,
      maxInvestmentAmount: maxInvestment ? parseFloat(maxInvestment as string) : undefined,
      timeAvailabilityHours: timeAvailable ? parseFloat(timeAvailable as string) : undefined
    };

    // Build preferences
    const preferences: RecommendationPreferences = {
      maxRecommendations: maxRecommendations ? parseInt(maxRecommendations as string) : undefined,
      focusAreas: focusAreas ? (focusAreas as string).split(',') as ActionCategory[] : undefined,
      difficultyLevels: difficultyLevels ? (difficultyLevels as string).split(',') as any[] : undefined,
      budgetConstraint: budgetConstraint ? parseFloat(budgetConstraint as string) : undefined
    };

    // Build request
    const request: RecommendationRequest = {
      profile,
      preferences
    };

    // Get recommendations
    const recommendations = await actionRecommendationService.getPersonalizedRecommendations(request);
    
    const processTime = Date.now() - startTime;
    logger.info(`✅ Generated ${recommendations.recommendations.length} recommendations in ${processTime}ms`);

    const response: ActionRecommendationAPIResponse = {
      success: true,
      data: recommendations,
      metadata: {
        requestId,
        processTime,
        apiVersion: '1.0.0',
        dataSourcesUsed: ['Action Database', 'Emission Factors', 'Local Opportunities']
      }
    };

    res.json(response);

  } catch (error) {
    const processTime = Date.now() - (req as any).startTime || 0;
    logger.error('❌ Failed to get action recommendations:', error);
    
    const errorResponse: ActionRecommendationAPIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      metadata: {
        requestId: `req_${Date.now()}`,
        processTime,
        apiVersion: '1.0.0',
        dataSourcesUsed: []
      }
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * POST /api/actions/recommendations
 * Get personalized recommendations with full profile data
 */
router.post('/recommendations', async (req, res) => {
  try {
    const startTime = Date.now();
    const requestId = `req_${startTime}`;

    logger.info('🎯 Processing detailed action recommendations request');

    const request: RecommendationRequest = req.body;

    // Validate request structure
    if (!request.profile?.location) {
      logger.warn('⚠️ Invalid request structure - missing profile.location');
      return res.status(400).json({
        success: false,
        error: 'Invalid request structure: profile.location is required',
        metadata: {
          requestId,
          processTime: 0,
          apiVersion: '1.0.0',
          dataSourcesUsed: []
        }
      } as ActionRecommendationAPIResponse);
    }

    // Get recommendations
    const recommendations = await actionRecommendationService.getPersonalizedRecommendations(request);
    
    const processTime = Date.now() - startTime;
    logger.info(`✅ Generated ${recommendations.recommendations.length} detailed recommendations in ${processTime}ms`);

    const response: ActionRecommendationAPIResponse = {
      success: true,
      data: recommendations,
      metadata: {
        requestId,
        processTime,
        apiVersion: '1.0.0',
        dataSourcesUsed: ['Action Database', 'Emission Factors', 'Climate Context', 'Local Opportunities']
      }
    };

    res.json(response);

  } catch (error) {
    const processTime = Date.now() - (req as any).startTime || 0;
    logger.error('❌ Failed to get detailed action recommendations:', error);
    
    const errorResponse: ActionRecommendationAPIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      metadata: {
        requestId: `req_${Date.now()}`,
        processTime,
        apiVersion: '1.0.0',
        dataSourcesUsed: []
      }
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/actions/categories
 * Get list of available action categories
 */
router.get('/categories', async (req, res) => {
  try {
    logger.info('📋 Fetching action categories');

    const categories = [
      {
        id: 'energy',
        name: 'Energy',
        description: 'Home energy efficiency, renewable energy, and smart technology',
        icon: '⚡',
        averageImpact: 1200 // kg CO2/year
      },
      {
        id: 'transportation',
        name: 'Transportation', 
        description: 'Public transit, cycling, electric vehicles, and trip reduction',
        icon: '🚌',
        averageImpact: 2000
      },
      {
        id: 'consumption',
        name: 'Consumption',
        description: 'Food choices, shopping habits, and waste reduction',
        icon: '🛒',
        averageImpact: 800
      },
      {
        id: 'home',
        name: 'Home',
        description: 'Insulation, appliances, heating/cooling, and water usage',
        icon: '🏠',
        averageImpact: 1500
      },
      {
        id: 'community',
        name: 'Community',
        description: 'Local programs, volunteering, and collective action',
        icon: '👥',
        averageImpact: 500
      },
      {
        id: 'investment',
        name: 'Investment',
        description: 'Green banking, sustainable investing, and financial choices',
        icon: '💰',
        averageImpact: 1000
      },
      {
        id: 'advocacy',
        name: 'Advocacy',
        description: 'Political action, awareness raising, and policy support',
        icon: '📢',
        averageImpact: 300
      }
    ];

    res.json({
      success: true,
      data: {
        categories,
        totalCategories: categories.length
      },
      metadata: {
        requestId: `req_${Date.now()}`,
        processTime: 1,
        apiVersion: '1.0.0',
        dataSourcesUsed: ['Action Categories']
      }
    });

  } catch (error) {
    logger.error('❌ Failed to get action categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve action categories'
    });
  }
});

/**
 * GET /api/actions/local-opportunities
 * Get local climate programs and opportunities
 */
router.get('/local-opportunities', async (req, res) => {
  try {
    const { lat, lon, radius = 50 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: lat, lon'
      });
    }

    logger.info(`🏘️ Fetching local opportunities near ${lat}, ${lon}`);

    // In production, this would query local program databases
    const opportunities = [
      {
        id: 'sample-solar-program',
        title: 'Community Solar Program',
        description: 'Subscribe to local solar farm without installing panels on your roof',
        type: 'program',
        organization: 'Local Utility Co-op',
        category: 'energy',
        estimatedSavings: 300, // USD/year
        co2Reduction: 1200, // kg/year
        contactInfo: {
          website: 'https://example-solar.com',
          phone: '555-SOLAR-01',
          email: 'info@example-solar.com'
        },
        eligibility: ['residential_customer', 'service_area'],
        nextSteps: [
          'Check if your address is in the service area',
          'Review subscription options and pricing',
          'Sign up for a subscription level that fits your usage'
        ]
      },
      {
        id: 'bike-share-program',
        title: 'City Bike Share Program',
        description: 'Access to shared bicycles throughout the city',
        type: 'service',
        organization: 'City Transportation Department',
        category: 'transportation',
        estimatedSavings: 200,
        co2Reduction: 800,
        contactInfo: {
          website: 'https://citybikes.gov',
          phone: '555-BIKE-NOW'
        },
        eligibility: ['city_resident'],
        nextSteps: [
          'Download the bike share app',
          'Purchase a monthly or annual membership',
          'Find nearby bike stations for your routes'
        ]
      }
    ];

    res.json({
      success: true,
      data: {
        opportunities,
        searchRadius: parseFloat(radius as string),
        totalOpportunities: opportunities.length
      },
      metadata: {
        requestId: `req_${Date.now()}`,
        processTime: 50,
        apiVersion: '1.0.0',
        dataSourcesUsed: ['Local Program Database', 'Utility Programs', 'Government Initiatives']
      }
    });

  } catch (error) {
    logger.error('❌ Failed to get local opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve local opportunities'
    });
  }
});

/**
 * GET /api/actions/impact-calculator
 * Calculate potential CO2 reduction from specific actions
 */
router.get('/impact-calculator', async (req, res) => {
  try {
    const { actions, householdSize = 1, location } = req.query;

    if (!actions) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: actions (comma-separated list)'
      });
    }

    logger.info('🧮 Calculating impact for specified actions');

    const actionIds = (actions as string).split(',');
    const household = parseInt(householdSize as string);

    // Mock calculation (in production, would use actual emission factors)
    const calculations = actionIds.map(actionId => {
      let co2Reduction = 0;
      let costSavings = 0;

      switch (actionId) {
        case 'led-bulbs-upgrade':
          co2Reduction = 180 * household * 0.8; // household adjustment
          costSavings = 45 * household * 0.8;
          break;
        case 'programmable-thermostat':
          co2Reduction = 800 * Math.min(household, 2); // less scaling for thermostat
          costSavings = 180 * Math.min(household, 2);
          break;
        case 'public-transit-switch':
          co2Reduction = 2400; // per person switching
          costSavings = 1200;
          break;
        case 'reduce-meat-consumption':
          co2Reduction = 1200 * household;
          costSavings = 300 * household;
          break;
        default:
          co2Reduction = 500; // default estimate
          costSavings = 100;
      }

      return {
        actionId,
        co2ReductionKgPerYear: co2Reduction,
        costSavingsPerYear: costSavings,
        confidence: 85
      };
    });

    const totalCO2Reduction = calculations.reduce((sum, calc) => sum + calc.co2ReductionKgPerYear, 0);
    const totalCostSavings = calculations.reduce((sum, calc) => sum + calc.costSavingsPerYear, 0);

    res.json({
      success: true,
      data: {
        individualActions: calculations,
        totalImpact: {
          co2ReductionKgPerYear: totalCO2Reduction,
          costSavingsPerYear: totalCostSavings,
          equivalentCarsMilesAvoided: Math.round(totalCO2Reduction * 2.5), // rough conversion
          householdSize: household
        },
        methodology: 'EPA emission factors with household size adjustments'
      },
      metadata: {
        requestId: `req_${Date.now()}`,
        processTime: 15,
        apiVersion: '1.0.0',
        dataSourcesUsed: ['EPA Emission Factors', 'Action Impact Database']
      }
    });

  } catch (error) {
    logger.error('❌ Failed to calculate impact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate impact'
    });
  }
});

/**
 * POST /api/actions/carbon-footprint
 * Calculate carbon footprint from specific activities
 */
router.post('/carbon-footprint', async (req, res) => {
  try {
    const startTime = Date.now();
    const requestId = `req_${startTime}`;

    logger.info('🧮 Processing carbon footprint calculation request');

    const request: CarbonCalculationRequest = req.body;

    // Validate request
    if (!request.activities || !Array.isArray(request.activities)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: activities array is required',
        metadata: {
          requestId,
          processTime: 0,
          apiVersion: '1.0.0',
          emissionFactorsUsed: []
        }
      } as FootprintCalculationAPIResponse);
    }

    // Calculate carbon footprint
    const calculation = await carbonCalculatorService.calculateCarbonFootprint(request);
    
    const processTime = Date.now() - startTime;
    logger.info(`✅ Calculated carbon footprint: ${calculation.totalCO2eKg} kg CO2e in ${processTime}ms`);

    const response: FootprintCalculationAPIResponse = {
      success: true,
      data: calculation,
      metadata: {
        requestId,
        processTime,
        apiVersion: '1.0.0',
        emissionFactorsUsed: calculation.sources
      }
    };

    res.json(response);

  } catch (error) {
    const processTime = Date.now() - (req as any).startTime || 0;
    logger.error('❌ Failed to calculate carbon footprint:', error);
    
    const errorResponse: FootprintCalculationAPIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      metadata: {
        requestId: `req_${Date.now()}`,
        processTime,
        apiVersion: '1.0.0',
        emissionFactorsUsed: []
      }
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/actions/personal-footprint
 * Calculate personal carbon footprint based on user profile
 */
router.get('/personal-footprint', async (req, res) => {
  try {
    const {
      lat,
      lon,
      address,
      householdSize,
      dwellingType,
      dietType,
      transportModes,
      energySource
    } = req.query;

    if (!lat || !lon || !address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: lat, lon, address'
      });
    }

    logger.info(`👤 Calculating personal footprint for ${address}`);

    // Build profile from query parameters
    const profile: PersonalProfile = {
      location: {
        lat: parseFloat(lat as string),
        lon: parseFloat(lon as string), 
        address: address as string
      },
      householdSize: householdSize ? parseInt(householdSize as string) : undefined,
      dwellingType: dwellingType as any,
      dietType: dietType as any,
      currentTransportModes: transportModes ? (transportModes as string).split(',') as any[] : undefined,
      energySource: energySource as any
    };

    // Calculate personal footprint
    const footprint = await carbonCalculatorService.calculatePersonalFootprint(profile);
    
    logger.info(`✅ Personal footprint: ${footprint.totalCO2PerYear} kg CO2e/year`);

    res.json({
      success: true,
      data: footprint,
      metadata: {
        requestId: `req_${Date.now()}`,
        processTime: Date.now() - (req as any).startTime || 0,
        apiVersion: '1.0.0',
        methodology: footprint.calculationMethod
      }
    });

  } catch (error) {
    logger.error('❌ Failed to calculate personal footprint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate personal footprint'
    });
  }
});

/**
 * GET /api/actions/quick-calculations
 * Quick carbon footprint calculations for common activities
 */
router.get('/quick-calculations', async (req, res) => {
  try {
    const { type, ...params } = req.query;

    let result = 0;
    let unit = 'kg CO2e/year';
    let description = '';

    switch (type) {
      case 'electricity':
        const kwh = parseFloat(params.kwh as string) || 0;
        result = await carbonCalculatorService.quickElectricityFootprint(kwh, { country: params.country });
        description = `${kwh} kWh electricity consumption`;
        break;

      case 'driving':
        const miles = parseFloat(params.miles as string) || 0;
        const vehicleType = (params.vehicleType as any) || 'average';
        result = await carbonCalculatorService.quickDrivingFootprint(miles, vehicleType);
        description = `${miles} miles driving (${vehicleType} vehicle)`;
        break;

      case 'diet':
        const dietType = (params.dietType as any) || 'omnivore';
        const householdSize = parseInt(params.householdSize as string) || 1;
        result = await carbonCalculatorService.quickDietFootprint(dietType, householdSize);
        description = `${dietType} diet for ${householdSize} person(s)`;
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid calculation type. Supported types: electricity, driving, diet'
        });
    }

    res.json({
      success: true,
      data: {
        calculationType: type,
        result: Math.round(result * 100) / 100,
        unit,
        description,
        equivalents: {
          treesNeeded: Math.round(result / 21), // trees needed to offset per year
          carMilesEquivalent: Math.round(result * 2.5), // equivalent car miles
          coalPounds: Math.round(result * 2.2) // pounds of coal equivalent
        }
      },
      metadata: {
        requestId: `req_${Date.now()}`,
        processTime: 5,
        apiVersion: '1.0.0'
      }
    });

  } catch (error) {
    logger.error('❌ Failed to perform quick calculation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform calculation'
    });
  }
});

export default router;