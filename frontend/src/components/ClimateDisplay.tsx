import { LocationData, ClimateData } from '../types';
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Climate Data for {locationData.city || locationData.address}
        </h2>
        <p className="text-gray-600">
          📍 Coordinates: {locationData.lat.toFixed(4)}, {locationData.lon.toFixed(4)}
        </p>
      </div>

      {/* Current Weather Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Conditions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🌡️</div>
            <div className="text-2xl font-bold text-climate-blue">
              {Math.round(current.temperature)}°C
            </div>
            <div className="text-sm text-gray-600">Temperature</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">💧</div>
            <div className="text-2xl font-bold text-climate-green">
              {current.humidity}%
            </div>
            <div className="text-sm text-gray-600">Humidity</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🌧️</div>
            <div className="text-2xl font-bold text-climate-orange">
              {current.precipitation}mm
            </div>
            <div className="text-sm text-gray-600">Precipitation</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">💨</div>
            <div className="text-2xl font-bold text-purple-600">
              {current.windSpeed} km/h
            </div>
            <div className="text-sm text-gray-600">Wind Speed</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{current.icon}</span>
            <span className="text-lg font-medium text-gray-700">
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