import { useState, useEffect } from 'react';
import { Gem, TrendingUp, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import { LocationData, ClimateScenario, FutureClimateResponse, ScenarioComparison } from '../types';
import { SuspendedFutureTimelineChart, SuspendedScenarioComparisonChart } from './LazyChartComponents';

interface FutureClimateDisplayProps {
  locationData: LocationData;
}

interface FutureDataState {
  projections: FutureClimateResponse | null;
  scenarios: ScenarioComparison | null;
  loading: boolean;
  error: string | null;
}

const FutureClimateDisplay = ({ locationData }: FutureClimateDisplayProps) => {
  const [futureData, setFutureData] = useState<FutureDataState>({
    projections: null,
    scenarios: null,
    loading: false,
    error: null
  });

  const [selectedScenario, setSelectedScenario] = useState<ClimateScenario>('moderate');
  const [viewType, setViewType] = useState<'timeline' | 'scenarios'>('timeline');

  useEffect(() => {
    if (locationData) {
      fetchFutureData();
    }
  }, [locationData, selectedScenario]);

  const fetchFutureData = async () => {
    setFutureData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch specific scenario projections
      const projectionsResponse = await fetch(
        `http://localhost:3001/api/future/projections?lat=${locationData.lat}&lon=${locationData.lon}&scenario=${selectedScenario}`
      );

      if (!projectionsResponse.ok) {
        throw new Error(`Failed to fetch projections: ${projectionsResponse.statusText}`);
      }

      const projections: FutureClimateResponse = await projectionsResponse.json();

      // Fetch all scenarios for comparison if needed
      let scenarios = null;
      if (viewType === 'scenarios') {
        const scenariosResponse = await fetch(
          `http://localhost:3001/api/future/scenarios?lat=${locationData.lat}&lon=${locationData.lon}`
        );

        if (scenariosResponse.ok) {
          scenarios = await scenariosResponse.json();
        }
      }

      setFutureData({
        projections,
        scenarios,
        loading: false,
        error: null
      });

    } catch (error) {
      setFutureData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch future climate data'
      }));
    }
  };

  const fetchAllScenarios = async () => {
    if (futureData.scenarios) return; // Already loaded

    setFutureData(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(
        `http://localhost:3001/api/future/scenarios?lat=${locationData.lat}&lon=${locationData.lon}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
      }

      const scenarios = await response.json();
      setFutureData(prev => ({
        ...prev,
        scenarios,
        loading: false
      }));

    } catch (error) {
      setFutureData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scenario comparison'
      }));
    }
  };

  const handleViewTypeChange = (type: 'timeline' | 'scenarios') => {
    setViewType(type);
    if (type === 'scenarios') {
      fetchAllScenarios();
    }
  };

  const scenarioInfo = {
    optimistic: {
      label: 'Optimistic',
      description: 'Strong climate action, rapid decarbonization',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    moderate: {
      label: 'Moderate',
      description: 'Current policies with moderate improvements',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    pessimistic: {
      label: 'Pessimistic',
      description: 'Limited climate action, business as usual',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  };

  const getPeriodLabel = (period: '2020s' | '2030s' | '2040s' | '2050s') => {
    const labels = {
      '2020s': '2020-2029',
      '2030s': '2030-2039',
      '2040s': '2040-2049',
      '2050s': '2050-2059'
    };
    return labels[period];
  };

  return (
    <div className="bg-white dark:bg-gray-900/90 backdrop-blur-sm border dark:border-gray-700/50 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Gem className="text-blue-600 dark:text-blue-400" size={28} />
            Future Climate Projections
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Explore how climate might change in {locationData.address} through 2050
          </p>
        </div>

        {/* View Type Toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => handleViewTypeChange('timeline')}
            className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
              viewType === 'timeline'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={16} />
            Timeline
          </button>
          <button
            onClick={() => handleViewTypeChange('scenarios')}
            className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
              viewType === 'scenarios'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <RotateCcw size={16} />
            Compare Scenarios
          </button>
        </div>
      </div>

      {/* Error Display */}
      {futureData.error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="text-red-600 dark:text-red-400 mr-3" size={20} />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-300">Error Loading Future Data</h4>
              <p className="text-red-600 dark:text-red-400">{futureData.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {futureData.loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading future climate projections...</p>
        </div>
      )}

      {/* Main Content */}
      {!futureData.loading && futureData.projections && (
        <>
          {viewType === 'timeline' ? (
            <div>
              {/* Scenario Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Climate Scenario:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(Object.keys(scenarioInfo) as ClimateScenario[]).map((scenario) => {
                    const info = scenarioInfo[scenario];
                    return (
                      <button
                        key={scenario}
                        onClick={() => setSelectedScenario(scenario)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedScenario === scenario
                            ? `${info.bgColor} dark:${info.bgColor.replace('bg-', 'bg-').replace('-50', '-900/10')} ${info.borderColor} dark:${info.borderColor.replace('border-', 'border-').replace('-200', '-800/50')} ${info.color} dark:${info.color.replace('text-', 'text-').replace('-600', '-400')}`
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="font-medium mb-1">{info.label}</div>
                        <div className="text-sm">{info.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Visualization */}
              <SuspendedFutureTimelineChart
                projections={futureData.projections}
                scenario={selectedScenario}
              />

              {/* Key Changes Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {futureData.projections.projectionPeriods.map((period) => (
                  <div
                    key={period.period}
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                  >
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {getPeriodLabel(period.period)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Temperature:</span>
                        <span className={`text-sm font-medium ${
                          period.changeFromBaseline.temperature > 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : period.changeFromBaseline.temperature < 0 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {period.changeFromBaseline.temperature > 0 ? '+' : ''}
                          {period.changeFromBaseline.temperature.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Precipitation:</span>
                        <span className={`text-sm font-medium ${
                          period.changeFromBaseline.precipitation > 0 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : period.changeFromBaseline.precipitation < 0 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {period.changeFromBaseline.precipitation > 0 ? '+' : ''}
                          {period.changeFromBaseline.precipitation.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Scenario Comparison View
            futureData.scenarios && (
              <SuspendedScenarioComparisonChart scenarios={futureData.scenarios} />
            )
          )}

          {/* Data Source Information */}
          {futureData.projections.metadata && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-lg">
              <div className="flex items-start">
                <Info className="text-blue-600 dark:text-blue-400 mr-3" size={20} />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Data Source</h4>
                  <p className="text-blue-700 dark:text-blue-400 text-sm mb-2">
                    {futureData.projections.metadata.dataSource}
                  </p>
                  <div className="text-blue-600 dark:text-blue-400 text-xs space-y-1">
                    <div>Model: {futureData.projections.model}</div>
                    <div>Confidence: {futureData.projections.metadata.confidenceLevel}</div>
                    <div>Updated: {new Date(futureData.projections.metadata.lastUpdated).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FutureClimateDisplay;