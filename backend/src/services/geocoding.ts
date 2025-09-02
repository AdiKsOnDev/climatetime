import axios from 'axios';
import { logger } from '../utils/logger';

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

export interface LocationResult {
  address: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

class GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly userAgent = 'ClimateTime/1.0.0';

  async geocodeAddress(address: string): Promise<LocationResult> {
    try {
      logger.info(`🔍 Geocoding address: ${address}`);
      
      const response = await axios.get<NominatimResult[]>(this.baseUrl, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 5000
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No results found for the given address');
      }

      const result = response.data[0];
      
      const locationResult: LocationResult = {
        address: result.display_name,
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        city: this.extractCity(result.display_name),
        country: this.extractCountry(result.display_name)
      };

      logger.info(`✅ Geocoding successful for: ${address} -> ${locationResult.lat}, ${locationResult.lon}`);
      return locationResult;
      
    } catch (error) {
      logger.error('❌ Geocoding failed:', error);
      throw new Error(
        error instanceof Error 
          ? `Geocoding failed: ${error.message}`
          : 'Unknown geocoding error'
      );
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<LocationResult> {
    try {
      logger.info(`🔄 Reverse geocoding: ${lat}, ${lon}`);
      
      const response = await axios.get<NominatimResult>(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            lat: lat.toString(),
            lon: lon.toString(),
            format: 'json',
            addressdetails: 1
          },
          headers: {
            'User-Agent': this.userAgent
          },
          timeout: 5000
        }
      );

      const result = response.data;
      
      const locationResult: LocationResult = {
        address: result.display_name,
        lat,
        lon,
        city: this.extractCity(result.display_name),
        country: this.extractCountry(result.display_name)
      };

      logger.info(`✅ Reverse geocoding successful for: ${lat}, ${lon}`);
      return locationResult;
      
    } catch (error) {
      logger.error('❌ Reverse geocoding failed:', error);
      throw new Error(
        error instanceof Error 
          ? `Reverse geocoding failed: ${error.message}`
          : 'Unknown reverse geocoding error'
      );
    }
  }

  private extractCity(displayName: string): string | undefined {
    const parts = displayName.split(',');
    return parts.length > 0 ? parts[0].trim() : undefined;
  }

  private extractCountry(displayName: string): string | undefined {
    const parts = displayName.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : undefined;
  }
}

export const geocodingService = new GeocodingService();