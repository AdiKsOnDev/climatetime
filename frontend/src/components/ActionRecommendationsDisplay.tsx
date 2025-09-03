import { useState } from 'react';
import { 
  Zap, Bus, ShoppingCart, Home, Users, DollarSign, Megaphone,
  Car, Train, Bike, User, Building, Target
} from 'lucide-react';
import { LocationData, RecommendationResponse, PersonalProfile, ActionCategory, CurrentFootprint } from '../types';
import PersonalFootprintCard from './PersonalFootprintCard';
import RecommendationCard from './RecommendationCard';
import LocalOpportunitiesCard from './LocalOpportunitiesCard';

interface ActionRecommendationsDisplayProps {
  locationData: LocationData;
}

interface ProfileFormData {
  householdSize: number;
  dwellingType: 'apartment' | 'house' | 'condo' | 'other';
  ownsHome: boolean;
  annualIncome: 'under_30k' | '30k_60k' | '60k_100k' | '100k_plus' | 'prefer_not_to_say';
  currentTransportModes: ('car' | 'public_transit' | 'bike' | 'walk' | 'remote_work')[];
  energySource: 'grid' | 'renewable' | 'mixed' | 'unknown';
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian';
  preferredActionTypes: ActionCategory[];
  maxInvestmentAmount: number;
  timeAvailabilityHours: number;
}

const ActionRecommendationsDisplay = ({ locationData }: ActionRecommendationsDisplayProps) => {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [personalFootprint, setPersonalFootprint] = useState<CurrentFootprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    householdSize: 1,
    dwellingType: 'apartment',
    ownsHome: false,
    annualIncome: 'prefer_not_to_say',
    currentTransportModes: ['car'],
    energySource: 'grid',
    dietType: 'omnivore',
    preferredActionTypes: [],
    maxInvestmentAmount: 1000,
    timeAvailabilityHours: 5
  });

  const categoryOptions = [
    { id: 'energy', label: 'Energy', icon: Zap, description: 'Home efficiency & renewable energy' },
    { id: 'transportation', label: 'Transportation', icon: Bus, description: 'Public transit, cycling, EVs' },
    { id: 'consumption', label: 'Consumption', icon: ShoppingCart, description: 'Food choices & waste reduction' },
    { id: 'home', label: 'Home', icon: Home, description: 'Insulation, appliances, HVAC' },
    { id: 'community', label: 'Community', icon: Users, description: 'Local programs & volunteering' },
    { id: 'investment', label: 'Investment', icon: DollarSign, description: 'Green banking & investing' },
    { id: 'advocacy', label: 'Advocacy', icon: Megaphone, description: 'Political action & awareness' }
  ];

  const transportModeOptions = [
    { id: 'car', label: 'Car', icon: Car },
    { id: 'public_transit', label: 'Public Transit', icon: Train },
    { id: 'bike', label: 'Bicycle', icon: Bike },
    { id: 'walk', label: 'Walking', icon: User },
    { id: 'remote_work', label: 'Work from Home', icon: Building }
  ];

  const handleProfileSubmit = async () => {
    if (profileData.preferredActionTypes.length === 0) {
      setError('Please select at least one area of interest');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, get personal footprint calculation
      const footprintParams = new URLSearchParams({
        lat: locationData.lat.toString(),
        lon: locationData.lon.toString(),
        address: locationData.address,
        householdSize: profileData.householdSize.toString(),
        dwellingType: profileData.dwellingType,
        dietType: profileData.dietType,
        transportModes: profileData.currentTransportModes.join(','),
        energySource: profileData.energySource
      });

      const footprintResponse = await fetch(`http://localhost:3001/api/actions/personal-footprint?${footprintParams}`);
      if (footprintResponse.ok) {
        const footprintData = await footprintResponse.json();
        setPersonalFootprint(footprintData.data);
      }

      // Get personalized recommendations
      const profile: PersonalProfile = {
        location: locationData,
        ...profileData
      };

      const response = await fetch('http://localhost:3001/api/actions/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          preferences: {
            maxRecommendations: 6,
            focusAreas: profileData.preferredActionTypes,
            budgetConstraint: profileData.maxInvestmentAmount
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      setRecommendations(data.data);
      setShowProfileForm(false);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (value: string, checked: boolean, field: 'currentTransportModes' | 'preferredActionTypes') => {
    setProfileData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  if (showProfileForm) {
    return (
      <div className="bg-white dark:bg-gray-900/90 rounded-lg shadow-lg p-6 border dark:border-gray-700/50 backdrop-blur-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Get Personalized Climate Actions
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Tell us about yourself to get climate actions tailored to your situation in {locationData.address}
          </p>
        </div>

        <div className="space-y-6">
          {/* Household Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Household Size
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={profileData.householdSize}
                onChange={(e) => setProfileData(prev => ({ ...prev, householdSize: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 bg-white dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Housing Type
              </label>
              <select
                value={profileData.dwellingType}
                onChange={(e) => setProfileData(prev => ({ ...prev, dwellingType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 bg-white dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Home Ownership & Investment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profileData.ownsHome}
                  onChange={(e) => setProfileData(prev => ({ ...prev, ownsHome: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">I own my home</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Investment Budget: ${profileData.maxInvestmentAmount}
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={profileData.maxInvestmentAmount}
                onChange={(e) => setProfileData(prev => ({ ...prev, maxInvestmentAmount: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>$0</span>
                <span>$5,000+</span>
              </div>
            </div>
          </div>

          {/* Lifestyle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diet Type
              </label>
              <select
                value={profileData.dietType}
                onChange={(e) => setProfileData(prev => ({ ...prev, dietType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 bg-white dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="omnivore">Omnivore (eat everything)</option>
                <option value="pescatarian">Pescatarian (no meat, eat fish)</option>
                <option value="vegetarian">Vegetarian (no meat or fish)</option>
                <option value="vegan">Vegan (no animal products)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Energy Source
              </label>
              <select
                value={profileData.energySource}
                onChange={(e) => setProfileData(prev => ({ ...prev, energySource: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600/70 bg-white dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="grid">Standard electricity grid</option>
                <option value="renewable">Renewable energy plan</option>
                <option value="mixed">Mix of sources</option>
                <option value="unknown">Not sure</option>
              </select>
            </div>
          </div>

          {/* Transportation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How do you currently get around? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {transportModeOptions.map((mode) => (
                <label key={mode.id} className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600/70 bg-white dark:bg-gray-800/70 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={profileData.currentTransportModes.includes(mode.id as any)}
                    onChange={(e) => handleCheckboxChange(mode.id, e.target.checked, 'currentTransportModes')}
                    className="mb-2"
                  />
                  <mode.icon className="w-6 h-6 mb-1 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm text-center text-gray-900 dark:text-white">{mode.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Areas of Interest */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Which areas interest you most? (Select at least one)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryOptions.map((category) => (
                <label key={category.id} className="flex items-start p-4 border border-gray-200 dark:border-gray-600/70 bg-white dark:bg-gray-800/70 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={profileData.preferredActionTypes.includes(category.id as ActionCategory)}
                    onChange={(e) => handleCheckboxChange(category.id, e.target.checked, 'preferredActionTypes')}
                    className="mt-0.5 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <category.icon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                      <span className="font-medium text-gray-900 dark:text-white">{category.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{category.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Time Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time available for climate actions: {profileData.timeAvailabilityHours} hours/week
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={profileData.timeAvailabilityHours}
              onChange={(e) => setProfileData(prev => ({ ...prev, timeAvailabilityHours: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 hours</span>
              <span>20+ hours</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8">
          <button
            onClick={handleProfileSubmit}
            disabled={loading || profileData.preferredActionTypes.length === 0}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating Recommendations...' : 'Get My Personalized Climate Actions'}
          </button>
        </div>
      </div>
    );
  }

  // Show recommendations
  if (recommendations) {
    return (
      <div className="space-y-6">
        {/* Header with Edit Profile Option */}
        <div className="bg-white dark:bg-gray-900/90 rounded-lg shadow-lg p-6 border dark:border-gray-700/50 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Personalized Climate Actions
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Based on your profile, here are {recommendations.recommendations.length} actions tailored for {locationData.address}
              </p>
            </div>
            <button
              onClick={() => setShowProfileForm(true)}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Edit Profile
            </button>
          </div>

          {/* Total Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800/50">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {Math.round(recommendations.totalPotentialImpact.co2ReductionKgPerYear).toLocaleString()} kg
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">CO₂ reduction per year</div>
            </div>
            {recommendations.totalPotentialImpact.costSavingsPerYear && (
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800/50">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  ${Math.round(recommendations.totalPotentialImpact.costSavingsPerYear).toLocaleString()}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Potential savings per year</div>
              </div>
            )}
            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-200 dark:border-purple-800/50">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {Math.round(recommendations.totalPotentialImpact.co2ReductionKgPerYear / 21)}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Trees equivalent per year</div>
            </div>
          </div>
        </div>

        {/* Personal Footprint */}
        {personalFootprint && (
          <PersonalFootprintCard footprint={personalFootprint} />
        )}

        {/* Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.recommendations.map((rec) => (
            <RecommendationCard 
              key={rec.action.id} 
              recommendation={rec}
            />
          ))}
        </div>

        {/* Local Opportunities */}
        {recommendations.localOpportunities && recommendations.localOpportunities.length > 0 && (
          <LocalOpportunitiesCard opportunities={recommendations.localOpportunities} />
        )}

        {/* Next Steps */}
        {recommendations.nextSteps && recommendations.nextSteps.length > 0 && (
          <div className="bg-white dark:bg-gray-900/90 rounded-lg shadow-lg p-6 border dark:border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Recommended Next Steps</h4>
            </div>
            <ol className="space-y-2">
              {recommendations.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 dark:bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900/90 rounded-lg shadow-lg p-6 border dark:border-gray-700/50 backdrop-blur-sm">
      <div className="text-center py-8">
        <Target className="w-16 h-16 mb-4 text-blue-600 dark:text-blue-300 mx-auto" />
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Ready for Personalized Climate Actions?
        </h4>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Complete your profile to get actions tailored to your situation
        </p>
        <button
          onClick={() => setShowProfileForm(true)}
          className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default ActionRecommendationsDisplay;