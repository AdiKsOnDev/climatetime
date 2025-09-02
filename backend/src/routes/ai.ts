import express from 'express';
import { aiEducationService } from '../services/aiEducation';
import { logger } from '../utils/logger';
import { cache, CACHE_TTL } from '../utils/cache';

const router = express.Router();

// POST /api/ai/explain - Get AI explanation for climate data
router.post('/explain', async (req, res) => {
  try {
    const { question, context, complexityLevel = 'intermediate', previousConversation } = req.body;
    
    // Validation
    if (!question || !context) {
      return res.status(400).json({
        error: 'Missing required parameters: question and context are required'
      });
    }

    if (!context.location || !context.location.lat || !context.location.lon) {
      return res.status(400).json({
        error: 'Invalid context: location with coordinates is required'
      });
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(complexityLevel)) {
      return res.status(400).json({
        error: 'Invalid complexity level. Must be: beginner, intermediate, or advanced'
      });
    }

    // Rate limiting check - limit to 10 questions per minute per IP
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const rateLimitKey = `ai_rate_limit:${clientIp}`;
    const currentCount = (cache.get(rateLimitKey) as number) || 0;
    
    if (currentCount >= 10) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Maximum 10 AI questions per minute.',
        retryAfter: 60
      });
    }

    // Increment rate limit counter
    cache.set(rateLimitKey, currentCount + 1, 60); // 60 second TTL

    logger.info(`🤖 AI explanation request from ${clientIp}: "${question}" (${complexityLevel})`);

    const explanation = await aiEducationService.explainClimateData({
      question,
      context,
      complexityLevel,
      previousConversation
    });

    // Log successful response
    logger.info(`✅ AI explanation generated (confidence: ${explanation.confidenceLevel}%)`);

    res.json({
      success: true,
      explanation,
      metadata: {
        complexityLevel,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('AI explanation endpoint error:', error);
    
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate AI explanation',
      fallback: {
        explanation: 'I apologize, but I\'m having trouble generating a detailed explanation right now. The climate data you\'re looking at shows important patterns that are part of the broader story of how our climate is changing. Please try asking a more specific question, or try again in a moment.',
        relatedConcepts: ['Climate Change', 'Data Analysis', 'Weather Patterns'],
        followUpSuggestions: [
          'What does this temperature trend mean?',
          'How has precipitation changed here?',
          'Is this change significant?'
        ],
        confidenceLevel: 50,
        sources: ['System fallback response']
      }
    });
  }
});

// GET /api/ai/suggestions?lat=<lat>&lon=<lon> - Get suggested questions for location
router.get('/suggestions', async (req, res) => {
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

    // Create basic context for suggestions
    const context = {
      location: {
        address: `${latitude}, ${longitude}`,
        lat: latitude,
        lon: longitude
      }
    };

    const suggestions = await aiEducationService.suggestQuestions(context);

    res.json({
      success: true,
      suggestions,
      metadata: {
        location: context.location,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('AI suggestions endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate question suggestions',
      fallback: {
        suggestions: [
          'How has the climate changed in my area?',
          'What do these temperature trends mean?',
          'Is this weather pattern normal?',
          'How does my location compare to global trends?',
          'What might cause these changes?'
        ]
      }
    });
  }
});

// GET /api/ai/concepts - Get available climate science concepts
router.get('/concepts', async (req, res) => {
  try {
    const concepts = {
      beginner: [
        'Global Warming',
        'Climate vs Weather',
        'Temperature Changes',
        'Precipitation Patterns',
        'Seasons and Climate'
      ],
      intermediate: [
        'Climate Variability',
        'Regional Climate Patterns',
        'Climate Forcing',
        'Statistical Trends',
        'Urban Heat Island Effect',
        'Extreme Weather Events'
      ],
      advanced: [
        'Anthropogenic Climate Forcing',
        'Radiative Forcing',
        'Climate Sensitivity',
        'Hydroclimate Dynamics',
        'Atmospheric Circulation',
        'Climate Model Projections',
        'Statistical Significance',
        'Paleoclimate Records'
      ]
    };

    res.json({
      success: true,
      concepts,
      metadata: {
        totalConcepts: Object.values(concepts).flat().length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('AI concepts endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to retrieve climate concepts'
    });
  }
});

// Route configuration complete

export default router;