import { YearlyClimateData, ClimateTrendData } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimelineChartProps {
  yearlyData: YearlyClimateData[];
  trends?: ClimateTrendData[];
}

type MetricType = 'temperature' | 'precipitation' | 'humidity' | 'windSpeed';

const TimelineChart = ({ yearlyData, trends }: TimelineChartProps) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature');
  const [showTrend, setShowTrend] = useState(true);

  const sortedData = [...yearlyData].sort((a, b) => a.year - b.year);
  const years = sortedData.map(d => d.year);

  const getMetricData = (metric: MetricType) => {
    switch (metric) {
      case 'temperature':
        return sortedData.map(d => d.temperatureMeanAvg);
      case 'precipitation':
        return sortedData.map(d => d.precipitationTotal);
      case 'humidity':
        return sortedData.map(d => d.humidityAvg);
      case 'windSpeed':
        return sortedData.map(d => d.windSpeedAvg);
      default:
        return sortedData.map(d => d.temperatureMeanAvg);
    }
  };

  const getMetricLabel = (metric: MetricType) => {
    switch (metric) {
      case 'temperature':
        return 'Temperature (°C)';
      case 'precipitation':
        return 'Annual Precipitation (mm)';
      case 'humidity':
        return 'Humidity (%)';
      case 'windSpeed':
        return 'Wind Speed (km/h)';
      default:
        return 'Temperature (°C)';
    }
  };

  const getMetricColor = (metric: MetricType) => {
    switch (metric) {
      case 'temperature':
        return 'rgb(239, 68, 68)'; // red-500
      case 'precipitation':
        return 'rgb(59, 130, 246)'; // blue-500
      case 'humidity':
        return 'rgb(34, 197, 94)'; // green-500
      case 'windSpeed':
        return 'rgb(147, 51, 234)'; // purple-500
      default:
        return 'rgb(239, 68, 68)';
    }
  };

  const getMetricTrend = (metric: MetricType) => {
    if (!trends) return null;
    
    const metricKey = metric === 'temperature' ? 'temperature_mean' : 
                     metric === 'precipitation' ? 'precipitation_annual' : null;
    
    return trends.find(t => t.metric === metricKey);
  };

  const generateTrendLine = () => {
    if (!showTrend || !trends) return [];
    
    const trend = getMetricTrend(selectedMetric);
    if (!trend) return [];

    const startYear = Math.min(...years);
    const endYear = Math.max(...years);
    const yearRange = endYear - startYear;
    
    return years.map(year => {
      const yearsFromStart = year - startYear;
      return trend.baselineValue + (trend.trendSlope * yearsFromStart);
    });
  };

  const metricData = getMetricData(selectedMetric);
  const trendData = generateTrendLine();

  const chartData = {
    labels: years,
    datasets: [
      {
        label: getMetricLabel(selectedMetric),
        data: metricData,
        borderColor: getMetricColor(selectedMetric),
        backgroundColor: getMetricColor(selectedMetric).replace('rgb', 'rgba').replace(')', ', 0.1)'),
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
      },
      ...(showTrend && trendData.length > 0 ? [{
        label: 'Trend Line',
        data: trendData,
        borderColor: 'rgb(107, 114, 128)', // gray-500
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        tension: 0,
        fill: false,
      }] : [])
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Climate Timeline: ${getMetricLabel(selectedMetric)}`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const trend = getMetricTrend(selectedMetric);
            if (trend && context.datasetIndex === 0) {
              return [
                `Trend: ${trend.trendDirection}`,
                `Change: ${trend.percentChange.toFixed(1)}%`,
                `Confidence: ${trend.confidenceLevel.toFixed(0)}%`
              ];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year'
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: getMetricLabel(selectedMetric)
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const currentTrend = getMetricTrend(selectedMetric);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Historical Climate Timeline</h3>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showTrend}
                onChange={(e) => setShowTrend(e.target.checked)}
                className="rounded"
              />
              Show trend line
            </label>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2">
          {(['temperature', 'precipitation', 'humidity', 'windSpeed'] as MetricType[]).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === metric
                  ? 'bg-climate-blue text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getMetricLabel(metric).split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Trend Analysis */}
      {currentTrend && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">
            Trend Analysis ({currentTrend.periodStart} - {currentTrend.periodEnd})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                currentTrend.trendDirection === 'increasing' ? 'text-red-600' :
                currentTrend.trendDirection === 'decreasing' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {currentTrend.trendDirection === 'increasing' ? '📈' :
                 currentTrend.trendDirection === 'decreasing' ? '📉' : '➡️'}
              </div>
              <div className="font-medium capitalize">{currentTrend.trendDirection}</div>
              <div className="text-gray-600">Direction</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                Math.abs(currentTrend.percentChange) > 10 ? 'text-red-600' :
                Math.abs(currentTrend.percentChange) > 5 ? 'text-orange-500' : 'text-green-600'
              }`}>
                {currentTrend.percentChange > 0 ? '+' : ''}{currentTrend.percentChange.toFixed(1)}%
              </div>
              <div className="font-medium">Total Change</div>
              <div className="text-gray-600">
                {currentTrend.baselineValue.toFixed(1)} → {currentTrend.currentValue.toFixed(1)}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                currentTrend.confidenceLevel > 80 ? 'text-green-600' :
                currentTrend.confidenceLevel > 60 ? 'text-yellow-500' : 'text-red-600'
              }`}>
                {currentTrend.confidenceLevel.toFixed(0)}%
              </div>
              <div className="font-medium">Confidence</div>
              <div className="text-gray-600">Statistical</div>
            </div>
          </div>
        </div>
      )}

      {/* Data Summary */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Displaying {sortedData.length} years of data ({Math.min(...years)} - {Math.max(...years)})
        {trends && ` • Trend analysis based on ${sortedData.length} data points`}
      </div>
    </div>
  );
};

export default TimelineChart;