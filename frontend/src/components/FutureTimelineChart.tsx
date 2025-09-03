import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { FutureClimateResponse, ClimateScenario } from '../types';
import { TrendingUp, Info } from 'lucide-react';

interface FutureTimelineChartProps {
  projections: FutureClimateResponse;
  scenario: ClimateScenario;
}

const FutureTimelineChart = ({ projections, scenario }: FutureTimelineChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !projections) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Prepare data
    const periods = projections.projectionPeriods;
    const labels = periods.map(p => {
      const labelMap = {
        '2020s': '2025',
        '2030s': '2035', 
        '2040s': '2045',
        '2050s': '2055'
      };
      return labelMap[p.period];
    });

    // Add baseline point
    const baselineYear = '2010';
    const allLabels = [baselineYear, ...labels];
    
    // Color scheme based on scenario
    const scenarioColors = {
      optimistic: {
        temp: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgb(34, 197, 94)' },
        precip: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgb(59, 130, 246)' }
      },
      moderate: {
        temp: { bg: 'rgba(249, 115, 22, 0.2)', border: 'rgb(249, 115, 22)' },
        precip: { bg: 'rgba(14, 165, 233, 0.2)', border: 'rgb(14, 165, 233)' }
      },
      pessimistic: {
        temp: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgb(239, 68, 68)' },
        precip: { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgb(16, 185, 129)' }
      }
    };

    const colors = scenarioColors[scenario];

    // Temperature data (relative to baseline)
    const temperatureData = [
      0, // baseline
      ...periods.map(p => p.changeFromBaseline.temperature)
    ];

    // Temperature uncertainty ranges
    const tempUncertaintyLow = [
      0, // baseline
      ...periods.map(p => p.uncertaintyRange.temperatureLow - (projections.baseline.temperatureMean + p.changeFromBaseline.temperature))
    ];

    const tempUncertaintyHigh = [
      0, // baseline  
      ...periods.map(p => p.uncertaintyRange.temperatureHigh - (projections.baseline.temperatureMean + p.changeFromBaseline.temperature))
    ];

    // Precipitation data (percentage change)
    const precipitationData = [
      0, // baseline
      ...periods.map(p => p.changeFromBaseline.precipitation)
    ];

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: 'Temperature Change (°C)',
            data: temperatureData,
            backgroundColor: colors.temp.bg,
            borderColor: colors.temp.border,
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: false,
            tension: 0.3,
            yAxisID: 'temp'
          },
          {
            label: 'Temperature Uncertainty (Low)',
            data: tempUncertaintyLow,
            backgroundColor: 'transparent',
            borderColor: colors.temp.border,
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            yAxisID: 'temp'
          },
          {
            label: 'Temperature Uncertainty (High)',
            data: tempUncertaintyHigh,
            backgroundColor: 'transparent',
            borderColor: colors.temp.border,
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: '-1', // Fill between this and previous dataset
            yAxisID: 'temp'
          },
          {
            label: 'Precipitation Change (%)',
            data: precipitationData,
            backgroundColor: colors.precip.bg,
            borderColor: colors.precip.border,
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
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
            text: `Future Climate Projections - ${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario`,
            font: { size: 16, weight: 'bold' },
            color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937'
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              filter: (legendItem) => !legendItem.text?.includes('Uncertainty'), // Hide uncertainty lines from legend
              usePointStyle: true,
              padding: 15,
              color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
            }
          },
          tooltip: {
            callbacks: {
              title: (context) => `Projection for ${context[0].label}`,
              label: (context) => {
                const label = context.dataset.label || '';
                const change = typeof context.parsed.y === 'number' ? context.parsed.y : 0;
                
                if (label.includes('Temperature')) {
                  const direction = change > 0 ? 'warmer' : change < 0 ? 'cooler' : 'same';
                  return `${label}: ${change > 0 ? '+' : ''}${change.toFixed(1)}°C ${direction} than baseline`;
                } else if (label.includes('Precipitation')) {
                  const direction = change > 0 ? 'wetter' : change < 0 ? 'drier' : 'same';
                  return `${label}: ${change > 0 ? '+' : ''}${change.toFixed(1)}% ${direction} than baseline`;
                }
                return `${label}: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Year (Projection Period Center)',
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
              color: colors.temp.border
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
              color: colors.precip.border
            },
            grid: {
              display: false // Don't show grid for secondary axis
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
              callback: (value) => {
                const numValue = typeof value === 'number' ? value : 0;
                return `${numValue > 0 ? '+' : ''}${numValue}%`;
              }
            }
          }
        },
        elements: {
          line: {
            capBezierPoints: false
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
  }, [projections, scenario]);

  return (
    <div className="bg-white dark:bg-gray-900/90 backdrop-blur-sm border dark:border-gray-700/50 p-4 rounded-lg">
      <div className="relative h-96">
        <canvas ref={chartRef}></canvas>
      </div>
      
      {/* Key Insights */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-500" />
          <h4 className="font-medium text-gray-800 dark:text-white">Key Insights:</h4>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          {projections.projectionPeriods.length > 0 && (
            <>
              <div>
                • By 2050s, temperatures are projected to be{' '}
                <span className={`font-medium ${
                  projections.projectionPeriods[projections.projectionPeriods.length - 1]?.changeFromBaseline.temperature > 0 
                    ? 'text-red-600' 
                    : 'text-blue-600'
                }`}>
                  {projections.projectionPeriods[projections.projectionPeriods.length - 1]?.changeFromBaseline.temperature > 0 ? '+' : ''}
                  {projections.projectionPeriods[projections.projectionPeriods.length - 1]?.changeFromBaseline.temperature.toFixed(1)}°C
                </span>{' '}
                compared to {projections.baseline.period}
              </div>
              <div>
                • Precipitation is expected to{' '}
                <span className={`font-medium ${
                  projections.projectionPeriods[projections.projectionPeriods.length - 1]?.changeFromBaseline.precipitation > 0 
                    ? 'text-blue-600' 
                    : 'text-orange-600'
                }`}>
                  {projections.projectionPeriods[projections.projectionPeriods.length - 1]?.changeFromBaseline.precipitation > 0 ? 'increase' : 'decrease'} by{' '}
                  {Math.abs(projections.projectionPeriods[projections.projectionPeriods.length - 1]?.changeFromBaseline.precipitation || 0).toFixed(1)}%
                </span>{' '}
                by the 2050s
              </div>
              <div>
                • Confidence level: {projections.metadata.confidenceLevel}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FutureTimelineChart;