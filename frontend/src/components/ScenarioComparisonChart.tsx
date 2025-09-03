import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { ScenarioComparison } from '../types';
import { Sprout, Scale, Flame, BarChart3 } from 'lucide-react';

interface ScenarioComparisonChartProps {
  scenarios: ScenarioComparison;
}

const ScenarioComparisonChart = ({ scenarios }: ScenarioComparisonChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !scenarios) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Extract data for comparison
    const periods = ['2030s', '2040s', '2050s'];
    const labels = periods.map(p => {
      const labelMap: { [key: string]: string } = {
        '2030s': '2030-2039',
        '2040s': '2040-2049', 
        '2050s': '2050-2059'
      };
      return labelMap[p];
    });

    // Get temperature changes for each scenario
    const optimisticTemps = periods.map(period => {
      const p = scenarios.optimistic.projectionPeriods.find(proj => proj.period === period);
      return p?.changeFromBaseline.temperature || 0;
    });

    const moderateTemps = periods.map(period => {
      const p = scenarios.moderate.projectionPeriods.find(proj => proj.period === period);
      return p?.changeFromBaseline.temperature || 0;
    });

    const pessimisticTemps = periods.map(period => {
      const p = scenarios.pessimistic.projectionPeriods.find(proj => proj.period === period);
      return p?.changeFromBaseline.temperature || 0;
    });

    // Get precipitation changes for each scenario
    const optimisticPrecip = periods.map(period => {
      const p = scenarios.optimistic.projectionPeriods.find(proj => proj.period === period);
      return p?.changeFromBaseline.precipitation || 0;
    });

    const moderatePrecip = periods.map(period => {
      const p = scenarios.moderate.projectionPeriods.find(proj => proj.period === period);
      return p?.changeFromBaseline.precipitation || 0;
    });

    const pessimisticPrecip = periods.map(period => {
      const p = scenarios.pessimistic.projectionPeriods.find(proj => proj.period === period);
      return p?.changeFromBaseline.precipitation || 0;
    });

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          // Temperature datasets
          {
            label: 'Optimistic - Temperature (°C)',
            data: optimisticTemps,
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: false,
            tension: 0.3,
            yAxisID: 'temp'
          },
          {
            label: 'Moderate - Temperature (°C)',
            data: moderateTemps,
            backgroundColor: 'rgba(249, 115, 22, 0.2)',
            borderColor: 'rgb(249, 115, 22)',
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: false,
            tension: 0.3,
            yAxisID: 'temp'
          },
          {
            label: 'Pessimistic - Temperature (°C)',
            data: pessimisticTemps,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: false,
            tension: 0.3,
            yAxisID: 'temp'
          },
          // Precipitation datasets
          {
            label: 'Optimistic - Precipitation (%)',
            data: optimisticPrecip,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.3,
            yAxisID: 'precip'
          },
          {
            label: 'Moderate - Precipitation (%)',
            data: moderatePrecip,
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderColor: 'rgb(249, 115, 22)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.3,
            yAxisID: 'precip'
          },
          {
            label: 'Pessimistic - Precipitation (%)',
            data: pessimisticPrecip,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.3,
            yAxisID: 'precip'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          title: {
            display: true,
            text: 'Climate Scenario Comparison',
            font: { size: 16, weight: 'bold' },
            color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937'
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
              generateLabels: (chart) => {
                const labels = Chart.defaults.plugins.legend.labels.generateLabels?.(chart) || [];
                // Group labels by variable type
                const tempLabels = labels.filter(label => label.text?.includes('Temperature'));
                const precipLabels = labels.filter(label => label.text?.includes('Precipitation'));
                
                return [
                  ...tempLabels.map(label => ({
                    ...label,
                    text: label.text?.replace(' - Temperature (°C)', '') || ''
                  })),
                  { text: '─────────────────', fillStyle: 'transparent', strokeStyle: 'transparent' },
                  ...precipLabels.map(label => ({
                    ...label,
                    text: (label.text?.replace(' - Precipitation (%)', '') + ' (Precip)') || ''
                  }))
                ];
              }
            }
          },
          tooltip: {
            callbacks: {
              title: (context) => `Projections for ${context[0].label}`,
              label: (context) => {
                const label = context.dataset.label || '';
                const value = typeof context.parsed.y === 'number' ? context.parsed.y : 0;
                
                if (label.includes('Temperature')) {
                  const scenario = label.split(' - ')[0];
                  const direction = value > 0 ? 'warmer' : value < 0 ? 'cooler' : 'same';
                  return `${scenario}: ${value > 0 ? '+' : ''}${value.toFixed(1)}°C ${direction}`;
                } else if (label.includes('Precipitation')) {
                  const scenario = label.split(' - ')[0];
                  const direction = value > 0 ? 'wetter' : value < 0 ? 'drier' : 'same';
                  return `${scenario}: ${value > 0 ? '+' : ''}${value.toFixed(1)}% ${direction}`;
                }
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Projection Period',
              font: { size: 14, weight: 'bold' },
              color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
            },
            grid: {
              color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280'
            }
          },
          temp: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Temperature Change (°C)',
              font: { size: 14, weight: 'bold' },
              color: '#dc2626'
            },
            grid: {
              color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
              callback: (value) => {
                const numValue = typeof value === 'number' ? value : 0;
                return `${numValue > 0 ? '+' : ''}${numValue}°C`;
              }
            },
          },
          precip: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Precipitation Change (%)',
              font: { size: 14, weight: 'bold' },
              color: '#2563eb'
            },
            grid: {
              display: false
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
              callback: (value) => {
                const numValue = typeof value === 'number' ? value : 0;
                return `${numValue > 0 ? '+' : ''}${numValue}%`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [scenarios]);

  // Calculate key differences for summary
  const get2050sChange = (scenarioName: keyof ScenarioComparison, metric: 'temperature' | 'precipitation') => {
    const scenario = scenarios[scenarioName];
    const period2050s = scenario.projectionPeriods.find(p => p.period === '2050s');
    return period2050s?.changeFromBaseline[metric] || 0;
  };

  return (
    <div className="bg-white dark:bg-gray-900/90 backdrop-blur-sm border dark:border-gray-700/50 p-4 rounded-lg">
      <div className="relative h-96 mb-6">
        <canvas ref={chartRef}></canvas>
      </div>

      {/* Scenario Summary Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Sprout className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800 dark:text-green-400">Optimistic Scenario</h4>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div>Strong climate action</div>
            <div className="font-medium">
              By 2050s: +{get2050sChange('optimistic', 'temperature').toFixed(1)}°C,{' '}
              {get2050sChange('optimistic', 'precipitation') > 0 ? '+' : ''}
              {get2050sChange('optimistic', 'precipitation').toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-orange-800 dark:text-orange-400">Moderate Scenario</h4>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div>Current policies + improvements</div>
            <div className="font-medium">
              By 2050s: +{get2050sChange('moderate', 'temperature').toFixed(1)}°C,{' '}
              {get2050sChange('moderate', 'precipitation') > 0 ? '+' : ''}
              {get2050sChange('moderate', 'precipitation').toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-800 dark:text-red-400">Pessimistic Scenario</h4>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div>Limited climate action</div>
            <div className="font-medium">
              By 2050s: +{get2050sChange('pessimistic', 'temperature').toFixed(1)}°C,{' '}
              {get2050sChange('pessimistic', 'precipitation') > 0 ? '+' : ''}
              {get2050sChange('pessimistic', 'precipitation').toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Key Differences */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-800 dark:text-blue-400">Key Differences by 2050s</h4>
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>
            • Temperature range:{' '}
            <span className="font-medium">
              +{get2050sChange('optimistic', 'temperature').toFixed(1)}°C to +{get2050sChange('pessimistic', 'temperature').toFixed(1)}°C
            </span>
            {' '}(difference of {(get2050sChange('pessimistic', 'temperature') - get2050sChange('optimistic', 'temperature')).toFixed(1)}°C)
          </div>
          <div>
            • Precipitation range:{' '}
            <span className="font-medium">
              {get2050sChange('optimistic', 'precipitation') > 0 ? '+' : ''}
              {get2050sChange('optimistic', 'precipitation').toFixed(1)}% to{' '}
              {get2050sChange('pessimistic', 'precipitation') > 0 ? '+' : ''}
              {get2050sChange('pessimistic', 'precipitation').toFixed(1)}%
            </span>
          </div>
          <div>
            • The choice of climate actions today significantly impacts future outcomes
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparisonChart;