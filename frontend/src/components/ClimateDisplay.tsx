import { LocationData, ClimateData } from '../types';
import { MapPin, Thermometer, Droplets, CloudRain, Wind } from 'lucide-react';
import WeatherChart from './WeatherChart';

interface ClimateDisplayProps {
  locationData: LocationData;
  climateData: ClimateData;
}

const ClimateDisplay = ({ locationData, climateData }: ClimateDisplayProps) => {
  const { current } = climateData;

  return (
    <div className="space-y-6">
      {/* Location Header */}
      <div className="bg-white dark:bg-gray-900/90 rounded-xl shadow-lg p-6 border dark:border-gray-700/50 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Climate Data for {locationData.city || locationData.address}
        </h2>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <MapPin className="w-4 h-4" />
          <span>Coordinates: {locationData.lat.toFixed(4)}, {locationData.lon.toFixed(4)}</span>
        </div>
      </div>

      {/* Current Weather Overview */}
      <div className="bg-white dark:bg-gray-900/90 rounded-xl shadow-lg p-6 border dark:border-gray-700/50 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Current Conditions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 text-center border dark:border-blue-800/50">
            <Thermometer className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <div className="text-2xl font-bold text-climate-blue dark:text-blue-400">
              {Math.round(current.temperature)}°C
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Temperature</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 text-center border dark:border-green-800/50">
            <Droplets className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <div className="text-2xl font-bold text-climate-green dark:text-green-400">
              {current.humidity}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Humidity</div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 text-center border dark:border-orange-800/50">
            <CloudRain className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
            <div className="text-2xl font-bold text-climate-orange dark:text-orange-400">
              {current.precipitation}mm
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Precipitation</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 text-center border dark:border-purple-800/50">
            <Wind className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {current.windSpeed} km/h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-600/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{current.icon}</span>
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {current.description}
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <WeatherChart climateData={climateData} />
    </div>
  );
};

export default ClimateDisplay;