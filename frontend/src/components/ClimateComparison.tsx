import { DecadalClimateData, YearlyClimateData } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ClimateComparisonProps {
  yearlyData?: YearlyClimateData[];
  decadalData?: DecadalClimateData[];
  currentClimate?: {
    temperature: number;
    precipitation: number;
    humidity: number;
    windSpeed: number;
  };
}

const ClimateComparison = ({ yearlyData, decadalData, currentClimate }: ClimateComparisonProps) => {
  if (!yearlyData?.length && !decadalData?.length) {
    return (
      <div className="bg-white dark:bg-gray-900/90 backdrop-blur-sm border dark:border-gray-700/50 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Climate Comparison</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No historical data available for comparison
        </div>
      </div>
    );
  }

  const getDecadalComparison = () => {
    if (!decadalData || decadalData.length < 2) return null;

    const earliest = decadalData[0];
    const latest = decadalData[decadalData.length - 1];

    return { earliest, latest };
  };

  const getYearlyComparison = () => {
    if (!yearlyData || yearlyData.length < 2) return null;

    const sortedYears = [...yearlyData].sort((a, b) => a.year - b.year);
    const earliest = sortedYears.slice(0, 5); // First 5 years
    const latest = sortedYears.slice(-5); // Last 5 years

    if (earliest.length === 0 || latest.length === 0) return null;

    const avgEarliest = {
      temperatureMeanAvg: earliest.reduce((sum, y) => sum + y.temperatureMeanAvg, 0) / earliest.length,
      precipitationTotal: earliest.reduce((sum, y) => sum + y.precipitationTotal, 0) / earliest.length,
      humidityAvg: earliest.reduce((sum, y) => sum + y.humidityAvg, 0) / earliest.length,
      windSpeedAvg: earliest.reduce((sum, y) => sum + y.windSpeedAvg, 0) / earliest.length,
    };

    const avgLatest = {
      temperatureMeanAvg: latest.reduce((sum, y) => sum + y.temperatureMeanAvg, 0) / latest.length,
      precipitationTotal: latest.reduce((sum, y) => sum + y.precipitationTotal, 0) / latest.length,
      humidityAvg: latest.reduce((sum, y) => sum + y.humidityAvg, 0) / latest.length,
      windSpeedAvg: latest.reduce((sum, y) => sum + y.windSpeedAvg, 0) / latest.length,
    };

    return {
      earliest: {
        period: `${earliest[0].year}-${earliest[earliest.length - 1].year}`,
        data: avgEarliest,
      },
      latest: {
        period: `${latest[0].year}-${latest[latest.length - 1].year}`,
        data: avgLatest,
      },
    };
  };

  const decadalComparison = getDecadalComparison();
  const yearlyComparison = getYearlyComparison();

  const createComparisonChart = (
    label1: string,
    data1: any,
    label2: string,
    data2: any,
    includeCurrent = false
  ) => {
    const labels = ['Temperature (°C)', 'Precipitation (mm)', 'Humidity (%)', 'Wind Speed (km/h)'];
    
    const datasets = [
      {
        label: label1,
        data: [
          data1.temperatureMeanAvg || data1.temperatureMaxAvg,
          data1.precipitationTotal || data1.precipitationTotalAvg,
          data1.humidityAvg,
          data1.windSpeedAvg,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: label2,
        data: [
          data2.temperatureMeanAvg || data2.temperatureMaxAvg,
          data2.precipitationTotal || data2.precipitationTotalAvg,
          data2.humidityAvg,
          data2.windSpeedAvg,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.8)', // red
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
      },
    ];

    if (includeCurrent && currentClimate) {
      datasets.push({
        label: 'Current',
        data: [
          currentClimate.temperature,
          currentClimate.precipitation * 365, // Convert daily to annual estimate
          currentClimate.humidity,
          currentClimate.windSpeed,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // green
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      });
    }

    return {
      labels,
      datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
        },
      },
    },
  };

  const calculateChange = (oldValue: number, newValue: number) => {
    const change = ((newValue - oldValue) / oldValue) * 100;
    return {
      value: change,
      formatted: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      color: Math.abs(change) < 5 ? 'text-green-600' : 
             change > 0 ? 'text-red-600' : 'text-blue-600',
      icon: Math.abs(change) < 5 ? <ArrowRight className="w-4 h-4 inline" /> : 
            change > 0 ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />
    };
  };

  return (
    <div className="bg-white dark:bg-gray-900/90 backdrop-blur-sm border dark:border-gray-700/50 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Climate Comparison: Then vs Now</h3>

      {/* Decadal Comparison */}
      {decadalComparison && (
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
            Decadal Comparison: {decadalComparison.earliest.decadeStart}s vs {decadalComparison.latest.decadeStart}s
          </h4>
          
          <div className="h-64 mb-6">
            <Bar
              data={createComparisonChart(
                `${decadalComparison.earliest.decadeStart}s`,
                decadalComparison.earliest,
                `${decadalComparison.latest.decadeStart}s`,
                decadalComparison.latest,
                true
              )}
              options={chartOptions}
            />
          </div>

          {/* Decadal Change Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">Temperature Change</div>
              <div className={`text-lg font-bold ${
                calculateChange(
                  decadalComparison.earliest.temperatureMeanAvg,
                  decadalComparison.latest.temperatureMeanAvg
                ).color
              }`}>
                {calculateChange(
                  decadalComparison.earliest.temperatureMeanAvg,
                  decadalComparison.latest.temperatureMeanAvg
                ).icon} {calculateChange(
                  decadalComparison.earliest.temperatureMeanAvg,
                  decadalComparison.latest.temperatureMeanAvg
                ).formatted}
              </div>
            </div>

            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">Precipitation Change</div>
              <div className={`text-lg font-bold ${
                calculateChange(
                  decadalComparison.earliest.precipitationTotalAvg,
                  decadalComparison.latest.precipitationTotalAvg
                ).color
              }`}>
                {calculateChange(
                  decadalComparison.earliest.precipitationTotalAvg,
                  decadalComparison.latest.precipitationTotalAvg
                ).icon} {calculateChange(
                  decadalComparison.earliest.precipitationTotalAvg,
                  decadalComparison.latest.precipitationTotalAvg
                ).formatted}
              </div>
            </div>

            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">Humidity Change</div>
              <div className={`text-lg font-bold ${
                calculateChange(
                  decadalComparison.earliest.humidityAvg,
                  decadalComparison.latest.humidityAvg
                ).color
              }`}>
                {calculateChange(
                  decadalComparison.earliest.humidityAvg,
                  decadalComparison.latest.humidityAvg
                ).icon} {calculateChange(
                  decadalComparison.earliest.humidityAvg,
                  decadalComparison.latest.humidityAvg
                ).formatted}
              </div>
            </div>

            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">Wind Speed Change</div>
              <div className={`text-lg font-bold ${
                calculateChange(
                  decadalComparison.earliest.windSpeedAvg,
                  decadalComparison.latest.windSpeedAvg
                ).color
              }`}>
                {calculateChange(
                  decadalComparison.earliest.windSpeedAvg,
                  decadalComparison.latest.windSpeedAvg
                ).icon} {calculateChange(
                  decadalComparison.earliest.windSpeedAvg,
                  decadalComparison.latest.windSpeedAvg
                ).formatted}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yearly Comparison */}
      {yearlyComparison && !decadalComparison && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
            Period Comparison: {yearlyComparison.earliest.period} vs {yearlyComparison.latest.period}
          </h4>
          
          <div className="h-64">
            <Bar
              data={createComparisonChart(
                `Early (${yearlyComparison.earliest.period})`,
                yearlyComparison.earliest.data,
                `Recent (${yearlyComparison.latest.period})`,
                yearlyComparison.latest.data,
                true
              )}
              options={chartOptions}
            />
          </div>
        </div>
      )}

      {/* Climate Impact Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
        <h5 className="font-semibold text-gray-800 dark:text-white mb-2">Key Climate Insights</h5>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <div>📊 Data spans {yearlyData?.length || 0} years of climate records</div>
          {decadalComparison && (
            <div>🌡️ Temperature trend: {
              decadalComparison.latest.temperatureMeanAvg > decadalComparison.earliest.temperatureMeanAvg 
                ? 'Warming' : 'Cooling'
            } pattern observed</div>
          )}
          {currentClimate && <div>🔄 Current conditions compared to historical averages</div>}
          <div>⚡ Analysis based on high-quality meteorological data</div>
        </div>
      </div>
    </div>
  );
};

export default ClimateComparison;