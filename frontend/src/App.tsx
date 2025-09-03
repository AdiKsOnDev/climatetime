import { useState } from 'react';
import { Cloud, TrendingUp, Eye, Bot, Target, Leaf } from 'lucide-react';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
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
  
  // Keyboard navigation for accessibility
  const { getTabProps } = useKeyboardNavigation({ 
    activeTab, 
    setActiveTab, 
    isEnabled: !!(climateData && locationData) 
  });

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
      {/* Skip Links for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:z-50"
      >
        Skip to main content
      </a>
      <a 
        href="#climate-tabs" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:z-50"
      >
        Skip to climate data
      </a>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-black transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12 relative" role="banner">
            <nav className="absolute top-0 right-0" aria-label="Theme settings">
              <ThemeToggle />
            </nav>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Leaf className="w-10 h-10 text-green-600 dark:text-green-400" aria-hidden="true" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                ClimateTime
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover how climate change affects your local area with AI-powered historical analysis and personalized education
            </p>
          </header>

          <main role="main" id="main-content" className="max-w-6xl mx-auto">
            <section aria-label="Location search">
              <LocationInput onLocationSubmit={handleLocationSubmit} loading={loading} />
              
              {error && (
                <div role="alert" className="mt-6 p-4 bg-red-100 dark:bg-red-900/10 border border-red-300 dark:border-red-800/50 rounded-lg text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}
            </section>
            
            {climateData && locationData && (
              <section aria-label="Climate data analysis">
                {/* Tab Navigation */}
                <nav id="climate-tabs" className="flex justify-center mb-6" role="tablist" aria-label="Climate data views">
                  <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                    <button
                      role="tab"
                      aria-selected={activeTab === 'current'}
                      aria-controls="current-panel"
                      id="current-tab"
                      onClick={() => setActiveTab('current')}
                      {...getTabProps('current')}
                      className={`px-6 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        activeTab === 'current'
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-500'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Cloud className="w-4 h-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                      Current Climate
                    </button>
                    <button
                      role="tab"
                      aria-selected={activeTab === 'historical'}
                      aria-controls="historical-panel"
                      id="historical-tab"
                      onClick={() => setActiveTab('historical')}
                      {...getTabProps('historical')}
                      className={`px-6 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        activeTab === 'historical'
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-500'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                      Historical Trends
                    </button>
                    <button
                      role="tab"
                      aria-selected={activeTab === 'future'}
                      aria-controls="future-panel"
                      id="future-tab"
                      onClick={() => setActiveTab('future')}
                      {...getTabProps('future')}
                      className={`px-6 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        activeTab === 'future'
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-500'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                      Future Projections
                    </button>
                    <button
                      role="tab"
                      aria-selected={activeTab === 'ai'}
                      aria-controls="ai-panel"
                      id="ai-tab"
                      onClick={() => setActiveTab('ai')}
                      {...getTabProps('ai')}
                      className={`px-6 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        activeTab === 'ai'
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-500'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                      AI Tutor
                    </button>
                    <button
                      role="tab"
                      aria-selected={activeTab === 'actions'}
                      aria-controls="actions-panel"
                      id="actions-tab"
                      onClick={() => setActiveTab('actions')}
                      {...getTabProps('actions')}
                      className={`px-6 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        activeTab === 'actions'
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-500'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Target className="w-4 h-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                      Take Action
                    </button>
                  </div>
                </nav>

                {/* Tab Content */}
                <div className="tab-panels">
                  {activeTab === 'current' && (
                    <div role="tabpanel" id="current-panel" aria-labelledby="current-tab">
                      <ClimateDisplay 
                        locationData={locationData} 
                        climateData={climateData} 
                      />
                    </div>
                  )}
                  {activeTab === 'historical' && (
                    <div role="tabpanel" id="historical-panel" aria-labelledby="historical-tab">
                      <HistoricalClimateDisplay 
                        locationData={locationData}
                        currentClimate={climateData}
                      />
                    </div>
                  )}
                  {activeTab === 'future' && (
                    <div role="tabpanel" id="future-panel" aria-labelledby="future-tab">
                      <FutureClimateDisplay 
                        locationData={locationData}
                      />
                    </div>
                  )}
                  {activeTab === 'actions' && (
                    <div role="tabpanel" id="actions-panel" aria-labelledby="actions-tab">
                      <ActionRecommendationsDisplay 
                        locationData={locationData}
                      />
                    </div>
                  )}
                  {activeTab === 'ai' && (
                    <div role="tabpanel" id="ai-panel" aria-labelledby="ai-tab">
                      <AIEducationInterface 
                        locationData={locationData}
                        currentClimate={climateData}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;