import { Calculator, Zap, Car, Utensils, ShoppingCart, Package } from 'lucide-react';
import { CurrentFootprint } from '../types';

interface PersonalFootprintCardProps {
  footprint: CurrentFootprint;
}

const PersonalFootprintCard = ({ footprint }: PersonalFootprintCardProps) => {
  const formatNumber = (num: number) => Math.round(num).toLocaleString();
  
  const categories = [
    { key: 'energy', label: 'Energy', icon: Zap, color: 'bg-yellow-500' },
    { key: 'transportation', label: 'Transportation', icon: Car, color: 'bg-blue-500' },
    { key: 'food', label: 'Food', icon: Utensils, color: 'bg-green-500' },
    { key: 'consumption', label: 'Consumption', icon: ShoppingCart, color: 'bg-purple-500' },
    { key: 'other', label: 'Other', icon: Package, color: 'bg-gray-500' }
  ];

  const getComparisonText = (percentage: number) => {
    if (percentage > 20) return { text: `${percentage}% above average`, color: 'text-red-600' };
    if (percentage > 0) return { text: `${percentage}% above average`, color: 'text-orange-600' };
    if (percentage > -20) return { text: `${Math.abs(percentage)}% below average`, color: 'text-green-600' };
    return { text: `${Math.abs(percentage)}% below average`, color: 'text-green-700' };
  };

  const totalEmissions = footprint.totalCO2PerYear;
  const maxCategory = Math.max(...Object.values(footprint.breakdown));

  return (
    <div className="bg-white dark:bg-gray-900/90 rounded-lg shadow-lg p-6 border dark:border-gray-700/50 backdrop-blur-sm">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
            Your Carbon Footprint
          </h4>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Your estimated annual carbon emissions based on your lifestyle
        </p>
      </div>

      {/* Total Footprint */}
      <div className="text-center mb-6 p-6 bg-gray-50 dark:bg-gray-800/70 rounded-lg border dark:border-gray-700/50">
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {formatNumber(totalEmissions)} kg
        </div>
        <div className="text-lg text-gray-600 dark:text-gray-300 mb-4">CO₂ equivalent per year</div>
        
        {/* Comparisons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-700 dark:text-gray-300">vs Local Average</div>
            <div className={getComparisonText(footprint.comparisonToAverage.local).color}>
              {getComparisonText(footprint.comparisonToAverage.local).text}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-700 dark:text-gray-300">vs National Average</div>
            <div className={getComparisonText(footprint.comparisonToAverage.national).color}>
              {getComparisonText(footprint.comparisonToAverage.national).text}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-700 dark:text-gray-300">vs Global Average</div>
            <div className={getComparisonText(footprint.comparisonToAverage.global).color}>
              {getComparisonText(footprint.comparisonToAverage.global).text}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="mb-6">
        <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Breakdown by Category</h5>
        <div className="space-y-3">
          {categories.map((category) => {
            const value = footprint.breakdown[category.key as keyof typeof footprint.breakdown];
            const percentage = totalEmissions > 0 ? (value / totalEmissions) * 100 : 0;
            const barWidth = maxCategory > 0 ? (value / maxCategory) * 100 : 0;
            
            return (
              <div key={category.key} className="flex items-center">
                <div className="flex items-center w-32 mr-4">
                  <category.icon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.label}</span>
                </div>
                
                <div className="flex-1 mr-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-3 relative border dark:border-gray-600/30">
                    <div 
                      className={`h-3 rounded-full ${category.color} transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-right w-20">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(value)} kg
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equivalencies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/50">
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {Math.round(totalEmissions / 21)}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Trees needed to offset annually</div>
        </div>
        
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/50">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {Math.round(totalEmissions * 2.5).toLocaleString()}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Miles driven equivalent</div>
        </div>
        
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800/50">
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {Math.round(totalEmissions * 2.2).toLocaleString()}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Pounds of coal equivalent</div>
        </div>
      </div>

      {/* Methodology Note */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Calculated using {footprint.calculationMethod} • 
        Confidence: {footprint.confidenceLevel}% • 
        Last updated: {new Date(footprint.lastCalculated).toLocaleDateString()}
      </div>
    </div>
  );
};

export default PersonalFootprintCard;