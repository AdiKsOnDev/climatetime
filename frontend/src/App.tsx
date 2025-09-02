import { useState } from 'react';
import LocationInput from './components/LocationInput';
import ClimateDisplay from './components/ClimateDisplay';
import HistoricalClimateDisplay from './components/HistoricalClimateDisplay';
import { LocationData, ClimateData } from './types';

function App() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'historical'>('current');

  const handleLocationSubmit = async (location: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Geocoding API call will be implemented here
      const response = await fetch(`http://localhost:3001/api/location?address=${encodeURIComponent(location)}`);
      if (!response.ok) throw new Error('Failed to fetch location data');
      
      const locData: LocationData = await response.json();
      setLocationData(locData);
      
      // Weather API call
      const weatherResponse = await fetch(`http://localhost:3001/api/weather?lat=${locData.lat}&lon=${locData.lon}`);
      if (!weatherResponse.ok) throw new Error('Failed to fetch weather data');
      
      const weatherData: ClimateData = await weatherResponse.json();
      setClimateData(weatherData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌍 ClimateTime
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how climate change affects your local area with historical data analysis
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          <LocationInput onLocationSubmit={handleLocationSubmit} loading={loading} />
          
          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          {climateData && locationData && (
            <div className="mt-8">
              {/* Tab Navigation */}
              <div className="flex justify-center mb-6">
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setActiveTab('current')}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                      activeTab === 'current'
                        ? 'bg-white text-climate-blue shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    🌤️ Current Climate
                  </button>
                  <button
                    onClick={() => setActiveTab('historical')}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                      activeTab === 'historical'
                        ? 'bg-white text-climate-blue shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    📊 Historical Trends
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'current' ? (
                <ClimateDisplay 
                  locationData={locationData} 
                  climateData={climateData} 
                />
              ) : (
                <HistoricalClimateDisplay 
                  locationData={locationData}
                  currentClimate={climateData}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;