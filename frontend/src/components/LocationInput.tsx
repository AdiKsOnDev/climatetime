import { useState, memo, useCallback } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { validateLocation, sanitizeLocation, locationRateLimiter } from '../utils/validation';

interface LocationInputProps {
  onLocationSubmit: (location: string) => void;
  loading: boolean;
}

const LocationInput = memo(({ onLocationSubmit, loading }: LocationInputProps) => {
  const [location, setLocation] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    if (!location.trim()) {
      setValidationError('Please enter a location');
      return;
    }

    // Check rate limiting
    if (!locationRateLimiter.isAllowed('location-search')) {
      setValidationError('Too many requests. Please wait before searching again.');
      return;
    }

    // Validate and sanitize input
    const validation = validateLocation(location);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid location format');
      return;
    }

    const sanitizedLocation = sanitizeLocation(location);
    onLocationSubmit(sanitizedLocation);
  }, [location, onLocationSubmit]);

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser. Please enter your location manually.');
      return;
    }

    setGeoLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeoLoading(false);
        onLocationSubmit(`${latitude},${longitude}`);
      },
      (error) => {
        setGeoLoading(false);
        console.error('Geolocation error:', error);
        
        let errorMessage = 'Unable to get your current location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied. Please allow location access in your browser settings or enter your location manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please check your device\'s location settings or enter your location manually.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or enter your location manually.';
            break;
          default:
            errorMessage += 'An unknown error occurred. Please enter your location manually.';
            break;
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 second timeout
        maximumAge: 300000 // 5 minutes cache
      }
    );
  }, [onLocationSubmit]);

  return (
    <div className="bg-white dark:bg-gray-900/90 rounded-xl shadow-lg p-8 mb-8 border dark:border-gray-700/50 backdrop-blur-sm">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
        Enter Your Location
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Enter city, address, or coordinates"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600/70 bg-white dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={loading || geoLoading}
              aria-label="Enter your location"
              aria-describedby="location-help"
              autoComplete="address-level2"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !location.trim()}
              className="px-6 py-3 bg-climate-blue dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
            
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={loading || geoLoading}
              className="px-4 py-3 bg-climate-green dark:bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              title={geoLoading ? "Getting your location..." : "Use current location"}
              aria-label={geoLoading ? "Getting your location..." : "Use current location"}
            >
              {geoLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MapPin className="w-5 h-5 text-white" aria-hidden="true" />
              )}
              {geoLoading && <span className="text-sm hidden sm:inline">Getting location...</span>}
            </button>
          </div>
        </div>
        
        {/* Validation Error */}
        {validationError && (
          <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span role="alert">{validationError}</span>
          </div>
        )}
      </form>
      
      <div id="location-help" className="mt-4 space-y-2">
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Try: "San Francisco, CA", "London, UK", or "40.7128, -74.0060"
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
          💡 Click the <MapPin className="inline w-3 h-3 mx-1" aria-hidden="true" /> button to use your current location (requires permission)
        </div>
      </div>
    </div>
  );
});

LocationInput.displayName = 'LocationInput';

export default LocationInput;