import { ClimateData } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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

  const barData = {
    labels: ['Temperature (°C)', 'Humidity (%)', 'Wind Speed (km/h)'],
    datasets: [
      {
        label: 'Current Weather Metrics',
        data: [current.temperature, current.humidity, current.windSpeed],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(5, 150, 105, 0.8)', 
          'rgba(147, 51, 234, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(5, 150, 105)',
          'rgb(147, 51, 234)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const doughnutData = {
    labels: ['Humidity', 'Dry Air'],
    datasets: [
      {
        data: [current.humidity, 100 - current.humidity],
        backgroundColor: [
          'rgba(5, 150, 105, 0.8)',
          'rgba(229, 231, 235, 0.8)',
        ],
        borderColor: [
          'rgb(5, 150, 105)',
          'rgb(229, 231, 235)',
        ],
        borderWidth: 2,
      },
    ],
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900/90 backdrop-blur-sm border dark:border-gray-700/50 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Weather Visualization</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
            Current Conditions Overview
          </h4>
          <Bar data={barData} options={chartOptions} />
        </div>
        
        <div className="h-64">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
            Humidity Distribution
          </h4>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
};

export default WeatherChart;