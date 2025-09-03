import { useState } from 'react';
import { Cloud, TrendingUp, Eye, Bot, Target, Leaf } from 'lucide-react';
import LocationInput from './components/LocationInput';
import ClimateDisplay from './components/ClimateDisplay';
import HistoricalClimateDisplay from './components/HistoricalClimateDisplay';
import AIEducationInterface from './components/AIEducationInterface';
import FutureClimateDisplay from './components/FutureClimateDisplay';
import ActionRecommendationsDisplay from './components/ActionRecommendationsDisplay';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocationData, ClimateData } from './types';

function App() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'historical' | 'future' | 'ai' | 'actions'>('current');

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
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-black transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12 relative">
            <div className="absolute top-0 right-0">
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Leaf className="w-10 h-10 text-green-600 dark:text-green-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                ClimateTime
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover how climate change affects your local area with AI-powered historical analysis and personalized education
            </p>
          </header>

        <div className="max-w-6xl mx-auto">
          <LocationInput onLocationSubmit={handleLocationSubmit} loading={loading} />
          
          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/10 border border-red-300 dark:border-red-800/50 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          
          {climateData && locationData && (
            <div className="mt-8">
              {/* Tab Navigation */}
              <div className="flex justify-center mb-6">
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab('current')}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'current'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Cloud className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    Current Climate
                  </button>
                  <button
                    onClick={() => setActiveTab('historical')}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'historical'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    Historical Trends
                  </button>
                  <button
                    onClick={() => setActiveTab('future')}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'future'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    Future Projections
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'ai'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    AI Tutor
                  </button>
                  <button
                    onClick={() => setActiveTab('actions')}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'actions'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Target className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    Take Action
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'current' ? (
                <ClimateDisplay 
                  locationData={locationData} 
                  climateData={climateData} 
                />
              ) : activeTab === 'historical' ? (
                <HistoricalClimateDisplay 
                  locationData={locationData}
                  currentClimate={climateData}
                />
              ) : activeTab === 'future' ? (
                <FutureClimateDisplay 
                  locationData={locationData}
                />
              ) : activeTab === 'actions' ? (
                <ActionRecommendationsDisplay 
                  locationData={locationData}
                />
              ) : (
                <AIEducationInterface 
                  locationData={locationData}
                  currentClimate={climateData}
                />
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;