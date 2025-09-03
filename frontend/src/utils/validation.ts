// Input validation and sanitization utilities

// Basic HTML entity encoding to prevent XSS
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Sanitize location input
export function sanitizeLocation(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim()
    .slice(0, 200); // Limit length
}

// Validate location input format
export function validateLocation(location: string): { isValid: boolean; error?: string } {
  const sanitized = sanitizeLocation(location);
  
  if (!sanitized) {
    return { isValid: false, error: 'Location cannot be empty' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Location must be at least 2 characters long' };
  }
  
  if (sanitized.length > 200) {
    return { isValid: false, error: 'Location is too long (max 200 characters)' };
  }
  
  // Check for coordinate format (latitude, longitude)
  const coordPattern = /^-?\d{1,3}\.?\d{0,10},\s*-?\d{1,3}\.?\d{0,10}$/;
  if (coordPattern.test(sanitized)) {
    return validateCoordinates(sanitized);
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /style\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(location)) {
      return { isValid: false, error: 'Invalid characters in location' };
    }
  }
  
  return { isValid: true };
}

// Validate coordinate values
function validateCoordinates(coords: string): { isValid: boolean; error?: string } {
  const [lat, lng] = coords.split(',').map(c => parseFloat(c.trim()));
  
  if (isNaN(lat) || isNaN(lng)) {
    return { isValid: false, error: 'Invalid coordinate format' };
  }
  
  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (lng < -180 || lng > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { isValid: true };
}

// Rate limiting helper
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  getRemainingRequests(key: string): number {
    const requests = this.requests.get(key) || [];
    const now = Date.now();
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Create rate limiter instance (10 requests per minute)
export const locationRateLimiter = new RateLimiter(10, 60 * 1000);

// Sanitize API response data
export function sanitizeApiResponse(data: any): any {
  if (typeof data === 'string') {
    return escapeHtml(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeApiResponse);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeApiResponse(value);
    }
    return sanitized;
  }
  
  return data;
}

// Validate environment variables
export function validateEnvVars(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if we're in production and have necessary env vars
  if (process.env.NODE_ENV === 'production') {
    // Add environment variable checks here if needed
    // e.g., if (!process.env.REACT_APP_API_URL) errors.push('API_URL not set');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Security headers for development
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' http://localhost:3001 https:",
    "frame-ancestors 'none'"
  ].join('; ')
};

// All exports are named exports above