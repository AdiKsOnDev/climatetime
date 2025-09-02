import express from 'express';
import { weatherService } from '../services/weather';
import { logger } from '../utils/logger';

const router = express.Router();

// GET /api/weather?lat=<lat>&lon=<lon>
router.get('/', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon || typeof lat !== 'string' || typeof lon !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid lat/lon parameters'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
      });
    }

    const weatherData = await weatherService.getCurrentWeather(latitude, longitude);
    res.json(weatherData);
    
  } catch (error) {
    logger.error('Weather endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch weather data'
    });
  }
});

export default router;