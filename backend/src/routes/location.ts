import express from 'express';
import { geocodingService } from '../services/geocoding';
import { logger } from '../utils/logger';

const router = express.Router();

// GET /api/location?address=<address>
router.get('/', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid address parameter'
      });
    }

    // Check if address is coordinates (lat,lon format)
    const coordMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({
          error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
        });
      }
      
      const result = await geocodingService.reverseGeocode(lat, lon);
      return res.json(result);
    } else {
      const result = await geocodingService.geocodeAddress(address);
      return res.json(result);
    }
    
  } catch (error) {
    logger.error('Location endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process location'
    });
  }
});

export default router;