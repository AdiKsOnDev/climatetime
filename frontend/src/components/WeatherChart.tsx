import { ClimateData } from '../types';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';
import { Activity, Gauge } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherChartProps {
  climateData: ClimateData;
}

const WeatherChart = ({ climateData }: WeatherChartProps) => {
  const { current } = climateData;
  const { isDark } = useTheme();

  // Convert temperature to comfort scale (0-100 where 20°C = comfortable)
  const getTemperatureComfort = (temp: number) => {
    if (temp < -10) return 0;
    if (temp > 40) return 100;
    // Scale from -10°C to 40°C -> 0 to 100
    return Math.max(0, Math.min(100, ((temp + 10) / 50) * 100));
  };

  // Convert wind speed to intensity scale
  const getWindIntensity = (windSpeed: number) => {
    if (windSpeed <= 5) return 20; // Calm
    if (windSpeed <= 15) return 40; // Light breeze  
    if (windSpeed <= 25) return 60; // Moderate
    if (windSpeed <= 35) return 80; // Strong
    return 100; // Very strong
  };

  // Weather comfort index visualization
  const comfortData = {
    labels: ['Temperature Feel', 'Humidity Comfort', 'Wind Intensity'],
    datasets: [
      {
        label: 'Weather Comfort Index',
        data: [
          getTemperatureComfort(current.temperature),
          current.humidity,
          getWindIntensity(current.windSpeed),
        ],
        backgroundColor: [
          current.temperature < 10 ? 'rgba(59, 130, 246, 0.7)' : 
          current.temperature < 25 ? 'rgba(34, 197, 94, 0.7)' :
          'rgba(239, 68, 68, 0.7)',
          current.humidity < 30 ? 'rgba(245, 101, 101, 0.7)' :
          current.humidity < 70 ? 'rgba(34, 197, 94, 0.7)' :
          'rgba(59, 130, 246, 0.7)',
          current.windSpeed < 15 ? 'rgba(34, 197, 94, 0.7)' :
          current.windSpeed < 30 ? 'rgba(251, 191, 36, 0.7)' :
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          current.temperature < 10 ? 'rgb(59, 130, 246)' : 
          current.temperature < 25 ? 'rgb(34, 197, 94)' :
          'rgb(239, 68, 68)',
          current.humidity < 30 ? 'rgb(245, 101, 101)' :
          current.humidity < 70 ? 'rgb(34, 197, 94)' :
          'rgb(59, 130, 246)',
          current.windSpeed < 15 ? 'rgb(34, 197, 94)' :
          current.windSpeed < 30 ? 'rgb(251, 191, 36)' :
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions: ChartOptions<'polarArea'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label;
            
            if (label === 'Temperature Feel') {
              return `${current.temperature}°C (${current.temperature < 10 ? 'Cold' : current.temperature < 25 ? 'Comfortable' : 'Hot'})`;
            }
            if (label === 'Humidity Comfort') {
              return `${current.humidity}% (${current.humidity < 30 ? 'Dry' : current.humidity < 70 ? 'Comfortable' : 'Humid'})`;
            }
            if (label === 'Wind Intensity') {
              return `${current.windSpeed} km/h (${current.windSpeed < 15 ? 'Calm' : current.windSpeed < 30 ? 'Breezy' : 'Windy'})`;
            }
            return `${context.parsed}`;
          }
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          display: false,
          stepSize: 20,
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: isDark ? '#d1d5db' : '#6b7280',
          font: {
            size: 12,
          },
        },
        angleLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  // Create weather comfort indicators
  const getComfortLevel = () => {
    const tempComfort = current.temperature >= 18 && current.temperature <= 26 ? 1 : 0;
    const humidityComfort = current.humidity >= 40 && current.humidity <= 60 ? 1 : 0;
    const windComfort = current.windSpeed <= 20 ? 1 : 0;
    const total = tempComfort + humidityComfort + windComfort;
    
    if (total === 3) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' };
    if (total === 2) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
    if (total === 1) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { level: 'Challenging', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' };
  };

  const comfort = getComfortLevel();

  return (
    <div className="bg-white dark:bg-gray-900/90 backdrop-blur-sm border dark:border-gray-700/50 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Weather Analysis</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Comfort Radar Chart */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 text-center">
            Weather Comfort Index
          </h4>
          <div className="h-64">
            <PolarArea data={comfortData} options={chartOptions} />
          </div>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Radar shows comfort levels: Temperature feel, Humidity comfort, and Wind intensity
          </div>
        </div>
        
        {/* Weather Insights */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 text-center">
            Comfort Assessment
          </h4>
          
          {/* Overall Comfort Score */}
          <div className={`p-4 rounded-lg ${comfort.bgColor} border-l-4 ${comfort.color.replace('text-', 'border-')}`}>
            <div className="flex items-center gap-2">
              <Gauge className={`w-5 h-5 ${comfort.color}`} />
              <span className="font-semibold text-gray-800 dark:text-white">
                Overall Comfort: <span className={comfort.color}>{comfort.level}</span>
              </span>
            </div>
          </div>

          {/* Individual Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Temperature</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900 dark:text-white">{current.temperature}°C</span>
                <span className={`ml-2 text-sm ${
                  current.temperature < 10 ? 'text-blue-600' : 
                  current.temperature < 25 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {current.temperature < 10 ? 'Cold' : current.temperature < 25 ? 'Comfortable' : 'Hot'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Humidity</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900 dark:text-white">{current.humidity}%</span>
                <span className={`ml-2 text-sm ${
                  current.humidity < 30 ? 'text-red-600' : 
                  current.humidity < 70 ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {current.humidity < 30 ? 'Dry' : current.humidity < 70 ? 'Comfortable' : 'Humid'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Wind Speed</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900 dark:text-white">{current.windSpeed} km/h</span>
                <span className={`ml-2 text-sm ${
                  current.windSpeed < 15 ? 'text-green-600' : 
                  current.windSpeed < 30 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {current.windSpeed < 15 ? 'Calm' : current.windSpeed < 30 ? 'Breezy' : 'Windy'}
                </span>
              </div>
            </div>
          </div>

          {/* Weather Tips */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Weather Tip</h5>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {current.temperature < 10 && 'Bundle up! Temperatures are quite cold today.' ||
               current.temperature > 30 && 'Stay hydrated and seek shade when possible.' ||
               current.humidity > 70 && 'High humidity may make it feel warmer than it is.' ||
               current.windSpeed > 25 && 'Strong winds today - secure outdoor items.' ||
               'Enjoy the pleasant weather conditions!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherChart;