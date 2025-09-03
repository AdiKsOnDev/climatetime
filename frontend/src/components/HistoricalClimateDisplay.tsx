import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { LocationData, YearlyClimateData, DecadalClimateData, ClimateTrendData, ClimateData } from '../types';
import { SuspendedTimelineChart } from './LazyChartComponents';
import ClimateComparison from './ClimateComparison';

interface HistoricalClimateDisplayProps {
  locationData: LocationData;
  currentClimate?: ClimateData;
}

interface HistoricalDataState {
  yearlyData: YearlyClimateData[];
  decadalData: DecadalClimateData[];
  trends: ClimateTrendData[];
  loading: boolean;
  error: string | null;
}

const HistoricalClimateDisplay = ({ locationData, currentClimate }: HistoricalClimateDisplayProps) => {
  const [historicalData, setHistoricalData] = useState<HistoricalDataState>({
    yearlyData: [],
    decadalData: [],
    trends: [],
    loading: false,
    error: null
  });

  const [timeRange, setTimeRange] = useState<'30years' | '50years' | 'full'>('30years');
  const [dataType, setDataType] = useState<'yearly' | 'decades'>('yearly');

  useEffect(() => {
    if (locationData) {
      fetchHistoricalData();
    }
  }, [locationData, timeRange]);

  const getYearRange = () => {
    const currentYear = new Date().getFullYear() - 1; // -1 due to data delay
    
    switch (timeRange) {
      case '30years':
        return { startYear: currentYear - 30, endYear: currentYear };
      case '50years':
        return { startYear: currentYear - 50, endYear: currentYear };
      case 'full':
        return { startYear: 1980, endYear: currentYear }; // Start from 1980 for better data quality
      default:
        return { startYear: currentYear - 30, endYear: currentYear };
    }
  };

  const fetchHistoricalData = async () => {
    setHistoricalData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { startYear, endYear } = getYearRange();
      
      // Generate years array (limit to 20 years for demo to respect API limits)
      const maxYears = 20;
      const totalYears = endYear - startYear + 1;
      const yearStep = Math.max(1, Math.floor(totalYears / maxYears));
      
      const years: number[] = [];
      for (let year = startYear; year <= endYear; year += yearStep) {
        years.push(year);
      }

      // Ensure we include the most recent year
      if (years[years.length - 1] !== endYear) {
        years.push(endYear);
      }

      const response = await fetch(
        `http://localhost:3001/api/historical/yearly?lat=${locationData.lat}&lon=${locationData.lon}&years=${years.join(',')}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.statusText}`);
      }

      const data = await response.json();

      // Fetch trends data
      const trendsResponse = await fetch(
        `http://localhost:3001/api/historical/trends?lat=${locationData.lat}&lon=${locationData.lon}&startYear=${startYear}&endYear=${endYear}`
      );

      let trends: ClimateTrendData[] = [];
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        trends = trendsData.trends || [];
      }

      // Generate decadal data from yearly data
      const decadalData = generateDecadalSummary(data.yearlyData || []);

      setHistoricalData({
        yearlyData: data.yearlyData || [],
        decadalData,
        trends,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching historical data:', error);
      setHistoricalData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load historical data'
      }));
    }
  };

  const generateDecadalSummary = (yearlyData: YearlyClimateData[]): DecadalClimateData[] => {
    const decadesMap = new Map<number, YearlyClimateData[]>();
    
    yearlyData.forEach(yearData => {
      const decadeStart = Math.floor(yearData.year / 10) * 10;
      if (!decadesMap.has(decadeStart)) {
        decadesMap.set(decadeStart, []);
      }
      decadesMap.get(decadeStart)!.push(yearData);
    });

    const decadalData: DecadalClimateData[] = [];
    
    decadesMap.forEach((years, decadeStart) => {
      if (years.length === 0) return;
      
      const decadeEnd = decadeStart + 9;
      
      const calculateAverage = (values: number[]) => {
        const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
        return validValues.length > 0 ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length : 0;
      };

      const decadeSummary: DecadalClimateData = {
        decadeStart,
        decadeEnd,
        temperatureMaxAvg: calculateAverage(years.map(y => y.temperatureMaxAvg)),
        temperatureMinAvg: calculateAverage(years.map(y => y.temperatureMinAvg)),
        temperatureMeanAvg: calculateAverage(years.map(y => y.temperatureMeanAvg)),
        precipitationTotalAvg: calculateAverage(years.map(y => y.precipitationTotal)),
        precipitationAnnualAvg: calculateAverage(years.map(y => y.precipitationAvg)),
        humidityAvg: calculateAverage(years.map(y => y.humidityAvg)),
        windSpeedAvg: calculateAverage(years.map(y => y.windSpeedAvg)),
        pressureAvg: calculateAverage(years.map(y => y.pressureAvg)),
        yearsCount: years.length
      };
      
      decadalData.push(decadeSummary);
    });

    return decadalData.sort((a, b) => a.decadeStart - b.decadeStart);
  };

  if (historicalData.loading) {
    return (
      <div className="bg-white dark:bg-gray-900/90 rounded-xl shadow-lg p-8 border dark:border-gray-700/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-climate-blue mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Loading Historical Data</h3>
          <p className="text-gray-600 dark:text-gray-300">Fetching climate records for {locationData.city || locationData.address}...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few moments as we process multiple years of data</p>
        </div>
      </div>
    );
  }

  if (historicalData.error) {
    return (
      <div className="bg-white dark:bg-gray-900/90 rounded-xl shadow-lg p-8 border dark:border-gray-700/50 backdrop-blur-sm">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500 dark:text-yellow-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Unable to Load Historical Data</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{historicalData.error}</p>
          <button
            onClick={fetchHistoricalData}
            className="px-6 py-2 bg-climate-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (historicalData.yearlyData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900/90 rounded-xl shadow-lg p-8 border dark:border-gray-700/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Historical Data Available</h3>
          <p className="text-gray-600">
            Historical climate data is not available for this location or time period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Historical Climate Data
            </h2>
            <p className="text-gray-600">
              {locationData.city || locationData.address} • {historicalData.yearlyData.length} years of data
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Time Range Selector */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {[
                { key: '30years' as const, label: '30 Years' },
                { key: '50years' as const, label: '50 Years' },
                { key: 'full' as const, label: 'Full Record' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimeRange(key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === key
                      ? 'bg-white text-climate-blue shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Data Type Selector */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {[
                { key: 'yearly' as const, label: '📈 Yearly' },
                { key: 'decades' as const, label: '📊 Decades' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setDataType(key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    dataType === key
                      ? 'bg-white text-climate-blue shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <SuspendedTimelineChart 
        yearlyData={historicalData.yearlyData}
        trends={historicalData.trends}
      />

      {/* Climate Comparison */}
      <ClimateComparison
        yearlyData={historicalData.yearlyData}
        decadalData={historicalData.decadalData}
        currentClimate={currentClimate ? {
          temperature: currentClimate.current.temperature,
          precipitation: currentClimate.current.precipitation,
          humidity: currentClimate.current.humidity,
          windSpeed: currentClimate.current.windSpeed
        } : undefined}
      />

      {/* Data Source Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Source & Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-800 mb-1">Historical Data Source</h4>
            <p>Open-Meteo Historical Weather API</p>
            <p>• Coverage: 1940 - Present (2-day delay)</p>
            <p>• Resolution: Daily aggregated to yearly</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-1">Analysis Methods</h4>
            <p>• Linear trend analysis with R² confidence</p>
            <p>• Decadal averaging for long-term patterns</p>
            <p>• Statistical significance testing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalClimateDisplay;