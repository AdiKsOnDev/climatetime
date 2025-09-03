import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PersonalizedRecommendation, ActionDifficulty, ActionTimeframe, ActionCostLevel } from '../types';

interface RecommendationCardProps {
  recommendation: PersonalizedRecommendation;
}

const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const { action, personalizationScore, reasoning, estimatedPersonalImpact } = recommendation;

  const getDifficultyColor = (difficulty: ActionDifficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 dark:bg-green-900/10 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50';
      case 'moderate': return 'bg-yellow-100 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50';
      case 'challenging': return 'bg-red-100 dark:bg-red-900/10 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50';
    }
  };

  const getTimeframeColor = (timeframe: ActionTimeframe) => {
    switch (timeframe) {
      case 'immediate': return 'bg-blue-100 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50';
      case 'short_term': return 'bg-purple-100 dark:bg-purple-900/10 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50';
      case 'long_term': return 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50';
    }
  };

  const getCostColor = (cost: ActionCostLevel) => {
    switch (cost) {
      case 'free': return 'bg-green-100 dark:bg-green-900/10 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50';
      case 'low': return 'bg-yellow-100 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50';
      case 'medium': return 'bg-orange-100 dark:bg-orange-900/10 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50';
      case 'high': return 'bg-red-100 dark:bg-red-900/10 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50';
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

  const formatImpact = (value?: number) => {
    if (!value) return 'N/A';
    return Math.round(value).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-900/90 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-shadow backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getCategoryIcon(action.category)}</span>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{action.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
            </div>
          </div>
          <div className="flex items-center ml-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Match Score</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{personalizationScore}%</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(action.difficulty)}`}>
            {action.difficulty}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimeframeColor(action.timeframe)}`}>
            {action.timeframe.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCostColor(action.costLevel)}`}>
            {action.costLevel} cost
          </span>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border dark:border-green-800/50">
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {formatImpact(estimatedPersonalImpact.co2ReductionKgPerYear)} kg
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">CO₂ saved/year</div>
          </div>
          
          {estimatedPersonalImpact.costSavingsPerYear && (
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border dark:border-blue-800/50">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                ${formatImpact(estimatedPersonalImpact.costSavingsPerYear)}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Saved/year</div>
            </div>
          )}
          
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border dark:border-purple-800/50">
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {Math.round(estimatedPersonalImpact.co2ReductionKgPerYear / 21)}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Trees equivalent</div>
          </div>
        </div>

        {/* Why Recommended */}
        {reasoning && reasoning.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Why this is recommended for you:</h5>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              {reasoning.map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <div className="p-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
        >
          <span>{expanded ? 'Hide' : 'Show'} Implementation Details</span>
          <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expanded && (
          <div className="mt-6 space-y-6">
            {/* Detailed Description */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">About This Action</h5>
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300">
                <ReactMarkdown>{action.detailedDescription}</ReactMarkdown>
              </div>
            </div>

            {/* Steps */}
            {action.steps && action.steps.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Implementation Steps</h5>
                <div className="space-y-3">
                  {action.steps.map((step) => (
                    <div key={step.order} className="flex items-start p-3 bg-gray-50 dark:bg-gray-800/70 rounded-lg border dark:border-gray-700/50">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 dark:bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mr-3">
                        {step.order}
                      </div>
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900 dark:text-white mb-1">{step.title}</h6>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{step.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {step.estimatedTimeMinutes && (
                            <span>⏱️ {step.estimatedTimeMinutes} min</span>
                          )}
                          {step.cost && (
                            <span>💰 ~${step.cost}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {action.resources && action.resources.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Helpful Resources</h5>
                <div className="space-y-2">
                  {action.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border dark:border-blue-800/50">
                      <span className="text-blue-600 mr-3">
                        {resource.type === 'website' && '🌐'}
                        {resource.type === 'phone' && '📞'}
                        {resource.type === 'calculator' && '🧮'}
                        {resource.type === 'rebate' && '💰'}
                        {resource.type === 'document' && '📄'}
                        {resource.type === 'video' && '🎥'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-blue-900 dark:text-blue-300">{resource.title}</div>
                        {resource.description && (
                          <div className="text-sm text-blue-700 dark:text-blue-400">{resource.description}</div>
                        )}
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                          >
                            Visit Resource →
                          </a>
                        )}
                        {resource.phoneNumber && (
                          <div className="text-sm text-blue-700 dark:text-blue-400">📞 {resource.phoneNumber}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites & Barriers */}
            {(action.prerequisites.length > 0 || action.barriers.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {action.prerequisites.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prerequisites</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {action.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">ℹ️</span>
                          {prereq.replace(/_/g, ' ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {action.barriers.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Common Barriers</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {action.barriers.map((barrier, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-500 mr-2">⚠️</span>
                          {barrier.replace(/_/g, ' ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Confidence & Sources */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div>
                  Confidence: {estimatedPersonalImpact.confidenceLevel}% • 
                  Last updated: {new Date(action.lastUpdated).toLocaleDateString()}
                </div>
                <div>
                  {action.verified && <span className="text-green-600">✅ Verified</span>}
                </div>
              </div>
              {action.sources && action.sources.length > 0 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Sources: {action.sources.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;