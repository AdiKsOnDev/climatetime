import axios from 'axios';
import { logger } from '../utils/logger';

interface OpenWeatherMapResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    '1h': number;
  };
  snow?: {
    '1h': number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  name: string;
}

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  location: {
    address: string;
    lat: number;
    lon: number;
    city?: string;
    country?: string;
  };
  timestamp: string;
}

class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('⚠️ OpenWeather API key not found. Using mock data.');
    }
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      logger.info(`🌤️ Fetching weather for: ${lat}, ${lon}`);
      
      if (!this.apiKey) {
        return this.getMockWeatherData(lat, lon);
      }

      const response = await axios.get<OpenWeatherMapResponse>(this.baseUrl, {
        params: {
          lat: lat.toString(),
          lon: lon.toString(),
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 5000
      });

      const data = response.data;
      
      const weatherData: WeatherData = {
        current: {
          temperature: Math.round(data.main.temp * 10) / 10,
          humidity: data.main.humidity,
          precipitation: (data.rain?.['1h'] || data.snow?.['1h'] || 0),
          windSpeed: Math.round(data.wind.speed * 3.6 * 10) / 10, // Convert m/s to km/h
          description: data.weather[0].description,
          icon: this.getWeatherEmoji(data.weather[0].icon)
        },
        location: {
          address: `${data.name}, ${data.sys.country}`,
          lat,
          lon,
          city: data.name,
          country: data.sys.country
        },
        timestamp: new Date().toISOString()
      };

      logger.info(`✅ Weather data retrieved for ${data.name}, ${data.sys.country}`);
      return weatherData;
      
    } catch (error) {
      logger.error('❌ Weather API call failed:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeather API configuration.');
      }
      
      logger.warn('🔄 Falling back to mock weather data');
      return this.getMockWeatherData(lat, lon);
    }
  }

  private getMockWeatherData(lat: number, lon: number): WeatherData {
    // Generate realistic mock data based on latitude for demo purposes
    const isNorthern = lat > 0;
    const isWinter = new Date().getMonth() < 3 || new Date().getMonth() > 10;
    
    let baseTemp = 20; // Default moderate temperature
    
    if (Math.abs(lat) > 60) {
      baseTemp = isWinter ? -10 : 10; // Polar regions
    } else if (Math.abs(lat) > 40) {
      baseTemp = isWinter ? 5 : 25; // Temperate regions
    } else if (Math.abs(lat) < 23.5) {
      baseTemp = 30; // Tropical regions
    }
    
    const temperature = baseTemp + (Math.random() * 10 - 5); // ±5°C variation
    
    return {
      current: {
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.floor(Math.random() * 40 + 40), // 40-80%
        precipitation: Math.random() * 5, // 0-5mm
        windSpeed: Math.round(Math.random() * 20 * 10) / 10, // 0-20 km/h
        description: this.getMockDescription(temperature),
        icon: this.getMockIcon(temperature)
      },
      location: {
        address: `Mock Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
        lat,
        lon,
        city: 'Demo City',
        country: 'Demo Country'
      },
      timestamp: new Date().toISOString()
    };
  }

  private getMockDescription(temp: number): string {
    if (temp < 0) return 'very cold';
    if (temp < 10) return 'cold';
    if (temp < 20) return 'mild';
    if (temp < 30) return 'warm';
    return 'hot';
  }

  private getMockIcon(temp: number): string {
    if (temp < 0) return '❄️';
    if (temp < 10) return '🌨️';
    if (temp < 20) return '⛅';
    if (temp < 30) return '☀️';
    return '🌡️';
  }

  private getWeatherEmoji(icon: string): string {
    const emojiMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    
    return emojiMap[icon] || '🌤️';
  }
}

export const weatherService = new WeatherService();