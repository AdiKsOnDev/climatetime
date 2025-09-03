// Import web-vitals dynamically to avoid conflicts with reportWebVitals.js

// Performance thresholds based on Google's recommendations
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }  // Time to First Byte
};

// Performance metric types
type MetricName = 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB';

interface PerformanceMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

// Store metrics for analysis
const performanceMetrics: PerformanceMetric[] = [];

// Rate a metric based on thresholds
function rateMetric(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Generic metric handler
function handleMetric(metric: any) {
  const performanceMetric: PerformanceMetric = {
    name: metric.name as MetricName,
    value: metric.value,
    rating: rateMetric(metric.name as MetricName, metric.value),
    timestamp: Date.now()
  };

  performanceMetrics.push(performanceMetric);

  // Log performance metrics in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 Web Vital: ${metric.name}`);
    console.log(`Value: ${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'}`);
    console.log(`Rating: ${performanceMetric.rating}`);
    console.log(`ID: ${metric.id}`);
    console.groupEnd();
  }

  // In production, you would send this to your analytics service
  // Example: sendToAnalytics(performanceMetric);
}

// Initialize Web Vitals monitoring with dynamic imports
export async function initPerformanceMonitoring() {
  try {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
    
    // Measure Core Web Vitals
    getCLS(handleMetric);
    getFID(handleMetric);
    getFCP(handleMetric);
    getLCP(handleMetric);
    getTTFB(handleMetric);

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Performance monitoring initialized');
    }
  } catch (error) {
    console.warn('Failed to initialize performance monitoring:', error);
  }
}

// Get current performance summary
export function getPerformanceSummary() {
  const summary = performanceMetrics.reduce((acc, metric) => {
    acc[metric.name] = metric;
    return acc;
  }, {} as Record<MetricName, PerformanceMetric>);

  return {
    metrics: summary,
    overallScore: calculatePerformanceScore(performanceMetrics),
    recommendations: generateRecommendations(performanceMetrics)
  };
}

// Calculate overall performance score (0-100)
function calculatePerformanceScore(metrics: PerformanceMetric[]): number {
  if (metrics.length === 0) return 0;

  const scores = metrics.map(metric => {
    switch (metric.rating) {
      case 'good': return 100;
      case 'needs-improvement': return 65;
      case 'poor': return 25;
      default: return 0;
    }
  });

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Generate performance recommendations
function generateRecommendations(metrics: PerformanceMetric[]): string[] {
  const recommendations: string[] = [];
  
  metrics.forEach(metric => {
    if (metric.rating === 'poor') {
      switch (metric.name) {
        case 'LCP':
          recommendations.push('Optimize largest contentful paint by reducing image sizes and improving server response times');
          break;
        case 'FID':
          recommendations.push('Reduce first input delay by minimizing JavaScript execution time and using code splitting');
          break;
        case 'CLS':
          recommendations.push('Improve layout stability by setting dimensions for images and ads');
          break;
        case 'FCP':
          recommendations.push('Improve first contentful paint by optimizing critical rendering path');
          break;
        case 'TTFB':
          recommendations.push('Reduce server response time by optimizing backend performance');
          break;
      }
    }
  });

  return recommendations;
}

// Performance debugging helper
export function debugPerformance() {
  const summary = getPerformanceSummary();
  
  console.group('🎯 Performance Summary');
  console.log(`Overall Score: ${summary.overallScore}/100`);
  
  Object.entries(summary.metrics).forEach(([name, metric]) => {
    console.log(`${name}: ${metric.value.toFixed(2)}${name === 'CLS' ? '' : 'ms'} (${metric.rating})`);
  });
  
  if (summary.recommendations.length > 0) {
    console.group('💡 Recommendations:');
    summary.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

// Export metrics for external analytics
export { performanceMetrics };