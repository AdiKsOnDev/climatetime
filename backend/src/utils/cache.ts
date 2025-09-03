import { logger } from './logger';

// Simple in-memory cache for development
// In production, this would use Redis or another persistent cache
export class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly defaultTTL = 3600000; // 1 hour in milliseconds

  set(key: string, data: any, ttlMs = this.defaultTTL): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { data, expiry });
    logger.info(`🔄 Cache SET: ${key} (TTL: ${ttlMs}ms)`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      logger.info(`❌ Cache MISS: ${key}`);
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      logger.info(`⏰ Cache EXPIRED: ${key}`);
      return null;
    }

    logger.info(`✅ Cache HIT: ${key}`);
    return entry.data as T;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.info(`🗑️ Cache DELETE: ${key}`);
    }
    return deleted;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`🧹 Cache CLEAR: Removed ${size} entries`);
  }

  size(): number {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info(`🧽 Cache CLEANUP: Removed ${cleaned} expired entries`);
    }
  }

  // Generate cache key for location-based queries
  generateLocationKey(lat: number, lon: number, prefix: string, suffix?: string): string {
    const roundedLat = Math.round(lat * 100) / 100; // Round to 2 decimal places
    const roundedLon = Math.round(lon * 100) / 100;
    const baseKey = `${prefix}:${roundedLat},${roundedLon}`;
    return suffix ? `${baseKey}:${suffix}` : baseKey;
  }

  // Generate cache key for historical data queries
  generateHistoricalKey(lat: number, lon: number, startYear: number, endYear: number): string {
    return this.generateLocationKey(lat, lon, 'historical', `${startYear}-${endYear}`);
  }

  // Generate cache key for future projection queries
  generateFutureProjectionsKey(lat: number, lon: number, scenario: string): string {
    return this.generateLocationKey(lat, lon, 'future-projections', scenario);
  }

  // Generate cache key for all scenarios comparison
  generateAllScenariosKey(lat: number, lon: number): string {
    return this.generateLocationKey(lat, lon, 'all-scenarios');
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cleanup expired entries every 30 minutes
setInterval(() => {
  cache.cleanup();
}, 30 * 60 * 1000);

// Cache TTL constants
export const CACHE_TTL = {
  GEOCODING: 24 * 60 * 60 * 1000,    // 24 hours - geocoding data rarely changes
  CURRENT_WEATHER: 15 * 60 * 1000,   // 15 minutes - weather updates frequently
  HISTORICAL_DAILY: 24 * 60 * 60 * 1000,  // 24 hours - daily historical data is static
  HISTORICAL_YEARLY: 7 * 24 * 60 * 60 * 1000,  // 7 days - yearly data is very stable
  CLIMATE_TRENDS: 30 * 24 * 60 * 60 * 1000,    // 30 days - trend analysis is computationally expensive
  FUTURE_PROJECTIONS: 7 * 24 * 60 * 60 * 1000  // 7 days - future projections are stable
};