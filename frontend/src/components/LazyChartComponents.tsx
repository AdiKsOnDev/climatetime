import { lazy, Suspense } from 'react';
import type { FutureClimateResponse, ClimateScenario, ScenarioComparison, YearlyClimateData, ClimateTrendData } from '../types';

// Loading component for chart components
const ChartLoadingFallback = ({ title }: { title?: string }) => (
  <div className="bg-white dark:bg-gray-900/90 backdrop-blur-sm border dark:border-gray-700/50 p-8 rounded-lg">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mx-auto"></div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    </div>
    {title && (
      <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
        Loading {title}...
      </div>
    )}
  </div>
);

// Lazy load the heavy chart components that are not immediately visible
export const LazyFutureTimelineChart = lazy(() => import('./FutureTimelineChart'));
export const LazyScenarioComparisonChart = lazy(() => import('./ScenarioComparisonChart'));
export const LazyTimelineChart = lazy(() => import('./TimelineChart'));

// Wrapper components with built-in Suspense and proper loading states
interface FutureTimelineChartProps {
  projections: FutureClimateResponse;
  scenario: ClimateScenario;
}

interface ScenarioComparisonChartProps {
  scenarios: ScenarioComparison;
}

interface TimelineChartProps {
  yearlyData: YearlyClimateData[];
  trends?: ClimateTrendData[];
}

export const SuspendedFutureTimelineChart = (props: FutureTimelineChartProps) => (
  <Suspense fallback={<ChartLoadingFallback title="Future Climate Chart" />}>
    <LazyFutureTimelineChart {...props} />
  </Suspense>
);

export const SuspendedScenarioComparisonChart = (props: ScenarioComparisonChartProps) => (
  <Suspense fallback={<ChartLoadingFallback title="Scenario Comparison Chart" />}>
    <LazyScenarioComparisonChart {...props} />
  </Suspense>
);

export const SuspendedTimelineChart = (props: TimelineChartProps) => (
  <Suspense fallback={<ChartLoadingFallback title="Historical Timeline Chart" />}>
    <LazyTimelineChart {...props} />
  </Suspense>
);

// Export the loading fallback for other uses
export { ChartLoadingFallback };