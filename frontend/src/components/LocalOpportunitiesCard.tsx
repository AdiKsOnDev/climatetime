import { LocalOpportunity } from '../types';

interface LocalOpportunitiesCardProps {
  opportunities: LocalOpportunity[];
}

const LocalOpportunitiesCard = ({ opportunities }: LocalOpportunitiesCardProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'program': return 'bg-blue-100 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50';
      case 'incentive': return 'bg-green-100 dark:bg-green-900/10 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50';
      case 'event': return 'bg-purple-100 dark:bg-purple-900/10 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50';
      case 'group': return 'bg-orange-100 dark:bg-orange-900/10 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50';
      case 'service': return 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50';
      default: return 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      energy: '⚡',
      transportation: '🚌',
      consumption: '🛒',
      home: '🏠',
      community: '👥',
      investment: '💰',
      advocacy: '📢'
    };
    return icons[category] || '🌱';
  };

  if (!opportunities || opportunities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900/90 rounded-lg shadow-lg p-6 border dark:border-gray-700/50 backdrop-blur-sm">
      <div className="mb-6">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          🏘️ Local Climate Opportunities
        </h4>
        <p className="text-gray-600 dark:text-gray-300">
          Programs and services available in your area
        </p>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/70 rounded-lg p-5 hover:shadow-md transition-shadow backdrop-blur-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center flex-1">
                <span className="text-2xl mr-3">
                  {getCategoryIcon(opportunity.category)}
                </span>
                <div className="flex-1">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {opportunity.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {opportunity.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{opportunity.organization}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.type)}`}>
                      {opportunity.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            {(opportunity.estimatedSavings || opportunity.co2Reduction) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {opportunity.estimatedSavings && (
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/50">
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      ${opportunity.estimatedSavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Potential savings/year</div>
                  </div>
                )}
                
                {opportunity.co2Reduction && (
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/50">
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {opportunity.co2Reduction.toLocaleString()} kg
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">CO₂ reduction/year</div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-4">
              <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Information</h6>
              <div className="flex flex-wrap gap-3">
                {opportunity.contactInfo.website && (
                  <a
                    href={opportunity.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors border border-blue-200 dark:border-blue-800/50"
                  >
                    🌐 Website
                  </a>
                )}
                
                {opportunity.contactInfo.phone && (
                  <a
                    href={`tel:${opportunity.contactInfo.phone}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors border border-green-200 dark:border-green-800/50"
                  >
                    📞 {opportunity.contactInfo.phone}
                  </a>
                )}
                
                {opportunity.contactInfo.email && (
                  <a
                    href={`mailto:${opportunity.contactInfo.email}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors border border-purple-200 dark:border-purple-800/50"
                  >
                    📧 Email
                  </a>
                )}
              </div>
            </div>

            {/* Eligibility */}
            {opportunity.eligibility && opportunity.eligibility.length > 0 && (
              <div className="mb-4">
                <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eligibility Requirements</h6>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {opportunity.eligibility.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">ℹ️</span>
                      {requirement.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {opportunity.nextSteps && opportunity.nextSteps.length > 0 && (
              <div>
                <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How to Get Started</h6>
                <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {opportunity.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-2 mt-0.5">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/50">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <div className="font-medium mb-1">💡 Pro Tip</div>
          <p>
            Contact these organizations directly to learn about current availability, 
            application processes, and any additional programs that might benefit you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocalOpportunitiesCard;