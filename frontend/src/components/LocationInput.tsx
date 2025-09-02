import { useState } from 'react';

interface LocationInputProps {
  onLocationSubmit: (location: string) => void;
  loading: boolean;
}

const LocationInput = ({ onLocationSubmit, loading }: LocationInputProps) => {
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onLocationSubmit(location.trim());
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationSubmit(`${latitude},${longitude}`);
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to get your current location. Please enter an address manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Enter Your Location
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city, address, or coordinates"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-climate-blue focus:border-transparent outline-none transition-all"
              disabled={loading}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !location.trim()}
              className="px-6 py-3 bg-climate-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
            
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={loading}
              className="px-4 py-3 bg-climate-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Use current location"
            >
              📍
            </button>
          </div>
        </div>
      </form>
      
      <div className="mt-4 text-sm text-gray-500 text-center">
        Try: "San Francisco, CA", "London, UK", or "40.7128, -74.0060"
      </div>
    </div>
  );
};

export default LocationInput;