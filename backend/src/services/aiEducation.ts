import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { ClimateData, LocationData, YearlyClimateData, ClimateTrendData } from '../types/climate';

export interface ClimateContext {
  location: LocationData;
  currentClimate?: ClimateData;
  historicalData?: YearlyClimateData[];
  trends?: ClimateTrendData[];
  timeRange?: string;
}

export interface AIExplanationRequest {
  question: string;
  context: ClimateContext;
  complexityLevel: 'beginner' | 'intermediate' | 'advanced';
  previousConversation?: ConversationTurn[];
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIExplanationResponse {
  explanation: string;
  relatedConcepts: string[];
  followUpSuggestions: string[];
  confidenceLevel: number;
  sources: string[];
}

class AIEducationService {
  private gemini25: any;
  private gemini20: any;
  private rateLimitDelay = 2000; // 2 seconds between requests
  private lastRequestTime = 0;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      logger.warn('⚠️ Gemini API key not found. AI features will use mock responses.');
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Primary model: Gemini 2.5 Flash
      this.gemini25 = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash"
      });
      
      // Fallback model: Gemini 2.0 Flash
      this.gemini20 = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash"
      });
      
      logger.info('✅ Gemini AI service initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Gemini AI service:', error);
    }
  }

  async explainClimateData(request: AIExplanationRequest): Promise<AIExplanationResponse> {
    try {
      await this.respectRateLimit();
      
      const prompt = this.buildContextualPrompt(request);
      logger.info(`🤖 Generating AI explanation for: "${request.question}"`);
      
      let response;
      
      try {
        // Try Gemini 2.5 Flash first
        if (this.gemini25) {
          const result = await this.gemini25.generateContent(prompt);
          response = result.response.text();
          logger.info('✅ Used Gemini 2.5 Flash for response');
        } else {
          throw new Error('Gemini 2.5 not available');
        }
      } catch (error) {
        logger.warn('⚠️ Gemini 2.5 failed, falling back to Gemini 2.0:', error);
        
        if (this.gemini20) {
          const result = await this.gemini20.generateContent(prompt);
          response = result.response.text();
          logger.info('✅ Used Gemini 2.0 Flash fallback');
        } else {
          throw new Error('Both Gemini models unavailable');
        }
      }

      return this.parseAIResponse(response, request.complexityLevel);
      
    } catch (error) {
      logger.error('❌ AI explanation generation failed:', error);
      return this.getMockExplanation(request);
    }
  }

  private buildContextualPrompt(request: AIExplanationRequest): string {
    const { question, context, complexityLevel, previousConversation } = request;
    
    let prompt = `You are a knowledgeable climate science educator helping users understand climate change data for their specific location.

LOCATION CONTEXT:
- Location: ${context.location.address}
- Coordinates: ${context.location.lat}°N, ${context.location.lon}°W

`;

    // Add current climate data if available
    if (context.currentClimate) {
      prompt += `CURRENT CLIMATE:
- Temperature: ${context.currentClimate.current.temperature}°C
- Humidity: ${context.currentClimate.current.humidity}%
- Precipitation: ${context.currentClimate.current.precipitation}mm
- Wind Speed: ${context.currentClimate.current.windSpeed} km/h
- Description: ${context.currentClimate.current.description}

`;
    }

    // Add historical data context if available
    if (context.historicalData && context.historicalData.length > 0) {
      const firstYear = context.historicalData[0];
      const lastYear = context.historicalData[context.historicalData.length - 1];
      
      prompt += `HISTORICAL CLIMATE DATA (${firstYear.year}-${lastYear.year}):
- Temperature change: ${firstYear.temperatureMeanAvg.toFixed(1)}°C → ${lastYear.temperatureMeanAvg.toFixed(1)}°C
- Precipitation change: ${firstYear.precipitationTotal.toFixed(0)}mm → ${lastYear.precipitationTotal.toFixed(0)}mm
- Data spans ${context.historicalData.length} years

`;
    }

    // Add trend analysis if available
    if (context.trends && context.trends.length > 0) {
      prompt += `CLIMATE TRENDS:
`;
      context.trends.forEach(trend => {
        prompt += `- ${trend.metric}: ${trend.trendDirection} trend (${trend.percentChange.toFixed(1)}% change, ${trend.confidenceLevel.toFixed(0)}% confidence)
`;
      });
      prompt += '\n';
    }

    // Add conversation context if available
    if (previousConversation && previousConversation.length > 0) {
      prompt += `CONVERSATION HISTORY:
`;
      previousConversation.slice(-4).forEach(turn => {
        prompt += `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.content}
`;
      });
      prompt += '\n';
    }

    // Set complexity level guidelines
    const complexityGuidelines = {
      beginner: 'Use simple, everyday language. Avoid technical jargon. Focus on practical impacts and analogies.',
      intermediate: 'Use moderate technical terms with explanations. Include some scientific concepts but keep accessible.',
      advanced: 'Use appropriate scientific terminology. Include detailed explanations of mechanisms and uncertainties.'
    };

    prompt += `EXPLANATION LEVEL: ${complexityLevel.toUpperCase()}
Guidelines: ${complexityGuidelines[complexityLevel]}

USER QUESTION: "${question}"

Please provide a comprehensive response in the following JSON format:
{
  "explanation": "Your detailed explanation here",
  "relatedConcepts": ["concept1", "concept2", "concept3"],
  "followUpSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "confidenceLevel": 85,
  "sources": ["source1", "source2"]
}

Focus on:
1. Directly answering the user's question using their location-specific data
2. Connecting the data to broader climate science concepts
3. Explaining any trends or changes in accessible terms
4. Providing actionable insights where relevant
5. Maintaining scientific accuracy while matching the complexity level`;

    return prompt;
  }

  private parseAIResponse(response: string, complexityLevel: string): AIExplanationResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          explanation: parsed.explanation || response,
          relatedConcepts: parsed.relatedConcepts || [],
          followUpSuggestions: parsed.followUpSuggestions || [],
          confidenceLevel: parsed.confidenceLevel || 75,
          sources: parsed.sources || ['Climate science knowledge base']
        };
      }
      
      // Fallback: treat entire response as explanation
      return {
        explanation: response,
        relatedConcepts: [],
        followUpSuggestions: [],
        confidenceLevel: 70,
        sources: ['AI-generated explanation']
      };
      
    } catch (error) {
      logger.warn('⚠️ Failed to parse AI response JSON, using raw text');
      return {
        explanation: response,
        relatedConcepts: [],
        followUpSuggestions: [],
        confidenceLevel: 65,
        sources: ['AI-generated explanation']
      };
    }
  }

  private getMockExplanation(request: AIExplanationRequest): AIExplanationResponse {
    const mockExplanations = {
      beginner: {
        explanation: `Based on the climate data for ${request.context.location.address}, I can see some interesting patterns. Climate change affects different places in different ways. Your location shows changes over time that are part of larger global trends. Think of climate like a giant system where small changes can add up to big differences over many years.`,
        relatedConcepts: ['Global Warming', 'Climate Patterns', 'Temperature Trends'],
        followUpSuggestions: [
          'How has temperature changed in my area?',
          'What causes climate to change?',
          'Is this normal weather variation?'
        ]
      },
      intermediate: {
        explanation: `The climate data for ${request.context.location.address} demonstrates regional manifestations of global climate change. Local temperature and precipitation patterns are influenced by both global trends and regional factors like geography, ocean currents, and urbanization. The observed changes align with climate model predictions for this region.`,
        relatedConcepts: ['Regional Climate Variability', 'Climate Forcing', 'Urban Heat Island'],
        followUpSuggestions: [
          'What drives these local climate changes?',
          'How do regional patterns differ from global trends?',
          'What are the confidence levels in this data?'
        ]
      },
      advanced: {
        explanation: `The climatological data for ${request.context.location.address} exhibits trends consistent with anthropogenic climate forcing. Statistical analysis of the temperature time series shows warming trends with confidence intervals that exceed natural variability. The precipitation patterns suggest potential shifts in regional hydroclimate dynamics, possibly linked to changes in atmospheric circulation patterns.`,
        relatedConcepts: ['Anthropogenic Forcing', 'Statistical Significance', 'Hydroclimate Dynamics'],
        followUpSuggestions: [
          'What is the statistical significance of these trends?',
          'How do these changes relate to atmospheric circulation?',
          'What are the uncertainties in the projections?'
        ]
      }
    };

    const mock = mockExplanations[request.complexityLevel] || mockExplanations.intermediate;
    
    return {
      ...mock,
      confidenceLevel: 60,
      sources: ['Mock climate education system']
    };
  }

  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      logger.info(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  async suggestQuestions(context: ClimateContext): Promise<string[]> {
    const suggestions = [
      'How has the climate changed in my area over the past 30 years?',
      'What do these temperature trends mean for my local environment?',
      'Is the precipitation pattern normal for this region?',
      'How does my location compare to global climate change?',
      'What might cause these climate changes I\'m seeing?'
    ];

    // Add context-specific suggestions
    if (context.trends) {
      const warmingTrend = context.trends.find(t => t.metric === 'temperature_mean' && t.trendDirection === 'increasing');
      if (warmingTrend) {
        suggestions.unshift('Why is my area warming faster than others?');
      }
    }

    if (context.currentClimate) {
      suggestions.push(`Why is it ${context.currentClimate.current.description.toLowerCase()} today?`);
    }

    return suggestions.slice(0, 6); // Return top 6 suggestions
  }
}

export const aiEducationService = new AIEducationService();