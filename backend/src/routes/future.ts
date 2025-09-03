import express from 'express';
import { futureClimateService, ClimateScenario } from '../services/futureClimate';
import { logger } from '../utils/logger';
import { cache, CACHE_TTL } from '../utils/cache';

const router = express.Router();

// GET /api/future/projections?lat=<lat>&lon=<lon>&scenario=<scenario>
router.get('/projections', async (req, res) => {
  try {
    const { lat, lon, scenario = 'moderate' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Missing required parameters: lat and lon'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
      });
    }

    const validScenarios: ClimateScenario[] = ['optimistic', 'moderate', 'pessimistic'];
    if (!validScenarios.includes(scenario as ClimateScenario)) {
      return res.status(400).json({
        error: 'Invalid scenario. Must be: optimistic, moderate, or pessimistic'
      });
    }

    // Check cache first
    const cacheKey = cache.generateFutureProjectionsKey(latitude, longitude, scenario as ClimateScenario);
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      logger.info(`📦 Returning cached future projections for ${latitude}, ${longitude} (${scenario})`);
      return res.json(cachedData);
    }

    const projections = await futureClimateService.getFutureProjections({
      latitude,
      longitude,
      startDate: '2020-01-01',
      endDate: '2050-12-31',
      scenario: scenario as ClimateScenario
    });

    // Cache the result for 24 hours (projections don't change frequently)
    cache.set(cacheKey, projections, CACHE_TTL.FUTURE_PROJECTIONS);

    res.json(projections);

  } catch (error) {
    logger.error('Future projections endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch future climate projections'
    });
  }
});

// GET /api/future/scenarios?lat=<lat>&lon=<lon>
router.get('/scenarios', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Missing required parameters: lat and lon'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
      });
    }

    // Check cache first
    const cacheKey = cache.generateAllScenariosKey(latitude, longitude);
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      logger.info(`📦 Returning cached scenario comparison for ${latitude}, ${longitude}`);
      return res.json(cachedData);
    }

    const scenarios = await futureClimateService.getAllScenarios(latitude, longitude);

    // Cache the result for 24 hours
    cache.set(cacheKey, scenarios, CACHE_TTL.FUTURE_PROJECTIONS);

    res.json(scenarios);

  } catch (error) {
    logger.error('Scenario comparison endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch climate scenario comparison'
    });
  }
});

// GET /api/future/periods?lat=<lat>&lon=<lon>&scenario=<scenario>&periods=<periods>
router.get('/periods', async (req, res) => {
  try {
    const { lat, lon, scenario = 'moderate', periods } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Missing required parameters: lat and lon'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
      });
    }

    const validScenarios: ClimateScenario[] = ['optimistic', 'moderate', 'pessimistic'];
    if (!validScenarios.includes(scenario as ClimateScenario)) {
      return res.status(400).json({
        error: 'Invalid scenario. Must be: optimistic, moderate, or pessimistic'
      });
    }

    // Parse requested periods (comma-separated)
    const requestedPeriods = periods ? 
      (periods as string).split(',').map(p => p.trim() as '2020s' | '2030s' | '2040s' | '2050s') : 
      ['2030s', '2040s', '2050s'];

    const validPeriods = ['2020s', '2030s', '2040s', '2050s'];
    const invalidPeriods = requestedPeriods.filter(p => !validPeriods.includes(p));
    
    if (invalidPeriods.length > 0) {
      return res.status(400).json({
        error: `Invalid periods: ${invalidPeriods.join(', ')}. Valid periods: ${validPeriods.join(', ')}`
      });
    }

    // Get full projections and filter to requested periods
    const projections = await futureClimateService.getFutureProjections({
      latitude,
      longitude,
      startDate: '2020-01-01',
      endDate: '2050-12-31',
      scenario: scenario as ClimateScenario
    });

    // Filter to requested periods
    const filteredProjections = {
      ...projections,
      projectionPeriods: projections.projectionPeriods.filter(p => 
        requestedPeriods.includes(p.period)
      )
    };

    res.json({
      ...filteredProjections,
      requestedPeriods,
      availablePeriods: projections.projectionPeriods.map(p => p.period)
    });

  } catch (error) {
    logger.error('Climate periods endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch climate periods data'
    });
  }
});

// GET /api/future/summary?lat=<lat>&lon=<lon>
router.get('/summary', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Missing required parameters: lat and lon'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
      });
    }

    // Get moderate scenario for summary
    const projections = await futureClimateService.getFutureProjections({
      latitude,
      longitude,
      startDate: '2020-01-01',
      endDate: '2050-12-31',
      scenario: 'moderate'
    });

    // Create summary data
    const summary = {
      location: projections.location,
      keyChanges: {
        temperature2030s: projections.projectionPeriods.find(p => p.period === '2030s')?.changeFromBaseline.temperature || 0,
        temperature2050s: projections.projectionPeriods.find(p => p.period === '2050s')?.changeFromBaseline.temperature || 0,
        precipitation2030s: projections.projectionPeriods.find(p => p.period === '2030s')?.changeFromBaseline.precipitation || 0,
        precipitation2050s: projections.projectionPeriods.find(p => p.period === '2050s')?.changeFromBaseline.precipitation || 0,
      },
      projectionPeriods: projections.projectionPeriods.map(period => ({
        period: period.period,
        temperatureChange: period.changeFromBaseline.temperature,
        precipitationChange: period.changeFromBaseline.precipitation,
        uncertaintyRange: {
          temperature: {
            low: period.uncertaintyRange.temperatureLow - period.temperatureMeanAvg,
            high: period.uncertaintyRange.temperatureHigh - period.temperatureMeanAvg
          }
        }
      })),
      baseline: projections.baseline,
      metadata: projections.metadata
    };

    res.json(summary);

  } catch (error) {
    logger.error('Future climate summary endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch future climate summary'
    });
  }
});

export default router;