import express from 'express';
import { historicalWeatherService } from '../services/historicalWeather';
import { logger } from '../utils/logger';
import { cache, CACHE_TTL } from '../utils/cache';

const router = express.Router();

// GET /api/historical/weather?lat=<lat>&lon=<lon>&startDate=<YYYY-MM-DD>&endDate=<YYYY-MM-DD>
router.get('/weather', async (req, res) => {
  try {
    const { lat, lon, startDate, endDate } = req.query;
    
    if (!lat || !lon || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters: lat, lon, startDate, endDate'
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

    // Validate date format (basic check)
    const startDateStr = startDate as string;
    const endDateStr = endDate as string;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD format.'
      });
    }

    const startDateObj = new Date(startDateStr);
    const endDateObj = new Date(endDateStr);
    const minDate = new Date('1940-01-01');
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - 2); // Open-Meteo has 2-day delay

    if (startDateObj < minDate || endDateObj > maxDate) {
      return res.status(400).json({
        error: `Date range must be between 1940-01-01 and ${maxDate.toISOString().split('T')[0]}`
      });
    }

    if (startDateObj >= endDateObj) {
      return res.status(400).json({
        error: 'Start date must be before end date'
      });
    }

    // Limit date range to prevent oversized requests (max 5 years at once)
    const daysDiff = (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 3600 * 24);
    if (daysDiff > 1825) { // ~5 years
      return res.status(400).json({
        error: 'Date range too large. Maximum 5 years per request.'
      });
    }

    const historicalData = await historicalWeatherService.getHistoricalWeather({
      latitude,
      longitude,
      startDate: startDateStr,
      endDate: endDateStr
    });

    res.json(historicalData);
    
  } catch (error) {
    logger.error('Historical weather endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch historical weather data'
    });
  }
});

// GET /api/historical/yearly?lat=<lat>&lon=<lon>&years=<comma-separated-years>
router.get('/yearly', async (req, res) => {
  try {
    const { lat, lon, years } = req.query;
    
    if (!lat || !lon || !years) {
      return res.status(400).json({
        error: 'Missing required parameters: lat, lon, years'
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

    const yearStrings = (years as string).split(',');
    const yearNumbers = yearStrings.map(y => parseInt(y.trim())).filter(y => !isNaN(y));
    
    if (yearNumbers.length === 0) {
      return res.status(400).json({
        error: 'Invalid years format. Provide comma-separated years like: 2020,2021,2022'
      });
    }

    // Validate year range
    const currentYear = new Date().getFullYear();
    const invalidYears = yearNumbers.filter(y => y < 1940 || y >= currentYear);
    
    if (invalidYears.length > 0) {
      return res.status(400).json({
        error: `Invalid years: ${invalidYears.join(', ')}. Years must be between 1940 and ${currentYear - 1}`
      });
    }

    // Limit number of years to prevent excessive API calls
    if (yearNumbers.length > 10) {
      return res.status(400).json({
        error: 'Too many years requested. Maximum 10 years per request.'
      });
    }

    // Check cache first
    const cacheKey = cache.generateHistoricalKey(latitude, longitude, Math.min(...yearNumbers), Math.max(...yearNumbers));
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      logger.info(`📦 Returning cached yearly climate data for ${latitude}, ${longitude}`);
      return res.json(cachedData);
    }

    const yearlyData = await historicalWeatherService.getYearlyClimateData(
      latitude, 
      longitude, 
      yearNumbers.sort()
    );

    const result = {
      location: { latitude, longitude },
      requestedYears: yearNumbers,
      retrievedYears: yearlyData.map(d => d.year),
      yearlyData
    };

    // Cache the result
    cache.set(cacheKey, result, CACHE_TTL.HISTORICAL_YEARLY);

    res.json(result);
    
  } catch (error) {
    logger.error('Yearly climate data endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch yearly climate data'
    });
  }
});

// GET /api/historical/decades?lat=<lat>&lon=<lon>&startDecade=<YYYY>&endDecade=<YYYY>
router.get('/decades', async (req, res) => {
  try {
    const { lat, lon, startDecade, endDecade } = req.query;
    
    if (!lat || !lon || !startDecade || !endDecade) {
      return res.status(400).json({
        error: 'Missing required parameters: lat, lon, startDecade, endDecade'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);
    const startDec = parseInt(startDecade as string);
    const endDec = parseInt(endDecade as string);

    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
      });
    }

    if (isNaN(startDec) || isNaN(endDec)) {
      return res.status(400).json({
        error: 'Invalid decade format. Use 4-digit years like: 1980, 1990, 2000'
      });
    }

    // Normalize decades to start of decade (e.g., 1985 -> 1980)
    const normalizedStart = Math.floor(startDec / 10) * 10;
    const normalizedEnd = Math.floor(endDec / 10) * 10;

    if (normalizedStart < 1940 || normalizedEnd >= new Date().getFullYear()) {
      return res.status(400).json({
        error: `Decade range must be between 1940 and ${Math.floor(new Date().getFullYear() / 10) * 10 - 10}`
      });
    }

    // Generate years for the requested decades
    const years: number[] = [];
    const currentYear = new Date().getFullYear() - 1;
    
    for (let decade = normalizedStart; decade <= normalizedEnd; decade += 10) {
      for (let year = decade; year < decade + 10 && year <= currentYear; year++) {
        years.push(year);
      }
    }

    // Limit to prevent excessive API calls
    if (years.length > 50) {
      return res.status(400).json({
        error: 'Too many years requested. Limit to 5 decades maximum.'
      });
    }

    const yearlyData = await historicalWeatherService.getYearlyClimateData(
      latitude, 
      longitude, 
      years
    );

    const decadalData = historicalWeatherService.generateDecadalSummary(yearlyData);

    res.json({
      location: { latitude, longitude },
      requestedDecades: { start: normalizedStart, end: normalizedEnd },
      decadalData
    });
    
  } catch (error) {
    logger.error('Decadal climate data endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch decadal climate data'
    });
  }
});

// GET /api/historical/trends?lat=<lat>&lon=<lon>&startYear=<YYYY>&endYear=<YYYY>
router.get('/trends', async (req, res) => {
  try {
    const { lat, lon, startYear, endYear } = req.query;
    
    if (!lat || !lon || !startYear || !endYear) {
      return res.status(400).json({
        error: 'Missing required parameters: lat, lon, startYear, endYear'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);
    const startYr = parseInt(startYear as string);
    const endYr = parseInt(endYear as string);

    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
      });
    }

    if (isNaN(startYr) || isNaN(endYr)) {
      return res.status(400).json({
        error: 'Invalid year format. Use 4-digit years like: 1980, 2020'
      });
    }

    const currentYear = new Date().getFullYear() - 1;
    
    if (startYr < 1940 || endYr > currentYear || startYr >= endYr) {
      return res.status(400).json({
        error: `Invalid year range. Must be between 1940 and ${currentYear}, with startYear < endYear`
      });
    }

    if (endYr - startYr < 10) {
      return res.status(400).json({
        error: 'Minimum 10 years required for trend analysis'
      });
    }

    // Generate years array
    const years = Array.from({ length: endYr - startYr + 1 }, (_, i) => startYr + i);
    
    if (years.length > 50) {
      return res.status(400).json({
        error: 'Too many years requested. Maximum 50 years for trend analysis.'
      });
    }

    const yearlyData = await historicalWeatherService.getYearlyClimateData(
      latitude, 
      longitude, 
      years
    );

    const trends = historicalWeatherService.calculateClimateTrends(yearlyData);

    res.json({
      location: { latitude, longitude },
      period: { startYear: startYr, endYear: endYr },
      dataYears: yearlyData.map(d => d.year),
      trends,
      yearlyData // Include raw data for client-side analysis
    });
    
  } catch (error) {
    logger.error('Climate trends endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to calculate climate trends'
    });
  }
});

export default router;