import { useState, useRef, useEffect } from 'react';
import { LocationData, ClimateData, YearlyClimateData, ClimateTrendData } from '../types';

interface AIEducationInterfaceProps {
  locationData: LocationData;
  currentClimate?: ClimateData;
  historicalData?: YearlyClimateData[];
  trends?: ClimateTrendData[];
}

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relatedConcepts?: string[];
  followUpSuggestions?: string[];
  confidenceLevel?: number;
  isLoading?: boolean;
}

interface AIResponse {
  explanation: string;
  relatedConcepts: string[];
  followUpSuggestions: string[];
  confidenceLevel: number;
  sources: string[];
}

type ComplexityLevel = 'beginner' | 'intermediate' | 'advanced';

const AIEducationInterface = ({ 
  locationData, 
  currentClimate, 
  historicalData, 
  trends 
}: AIEducationInterfaceProps) => {
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    // Load initial suggested questions
    if (locationData) {
      loadSuggestedQuestions();
    }
  }, [locationData]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSuggestedQuestions = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/ai/suggestions?lat=${locationData.lat}&lon=${locationData.lon}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestedQuestions(data.suggestions || []);
      }
    } catch (error) {
      console.warn('Failed to load suggested questions:', error);
      // Use fallback questions
      setSuggestedQuestions([
        'How has the climate changed in my area?',
        'What do these temperature trends mean?',
        'Is this weather pattern normal?',
        'How does my location compare to global trends?'
      ]);
    }
  };

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;

    setError(null);
    setIsLoading(true);
    
    // Add user message to conversation
    const userMessage: ConversationTurn = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };
    
    setConversation(prev => [...prev, userMessage]);

    // Add loading message
    const loadingMessage: ConversationTurn = {
      role: 'assistant',
      content: 'Analyzing your question...',
      timestamp: new Date().toISOString(),
      isLoading: true
    };
    
    setConversation(prev => [...prev, loadingMessage]);

    try {
      const context = {
        location: locationData,
        currentClimate,
        historicalData,
        trends,
        timeRange: historicalData ? `${historicalData[0]?.year}-${historicalData[historicalData.length-1]?.year}` : undefined
      };

      const response = await fetch('http://localhost:3001/api/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          context,
          complexityLevel,
          previousConversation: conversation.filter(turn => !turn.isLoading).slice(-6) // Last 6 non-loading messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI explanation');
      }

      const aiResponse: AIResponse = data.explanation || data.fallback;

      // Replace loading message with actual response
      setConversation(prev => {
        const newConversation = [...prev];
        newConversation[newConversation.length - 1] = {
          role: 'assistant',
          content: aiResponse.explanation,
          timestamp: new Date().toISOString(),
          relatedConcepts: aiResponse.relatedConcepts,
          followUpSuggestions: aiResponse.followUpSuggestions,
          confidenceLevel: aiResponse.confidenceLevel
        };
        return newConversation;
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      
      // Replace loading message with error
      setConversation(prev => {
        const newConversation = [...prev];
        newConversation[newConversation.length - 1] = {
          role: 'assistant',
          content: 'I apologize, but I\'m having trouble processing your question right now. Please try rephrasing it or try again in a moment.',
          timestamp: new Date().toISOString(),
          confidenceLevel: 50
        };
        return newConversation;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuestion.trim() && !isLoading) {
      askQuestion(currentQuestion);
      setCurrentQuestion('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setCurrentQuestion(question);
    askQuestion(question);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentQuestion(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const complexityLevelInfo = {
    beginner: { label: 'Beginner', description: 'Simple explanations, everyday language' },
    intermediate: { label: 'Intermediate', description: 'Balanced technical detail' },
    advanced: { label: 'Advanced', description: 'Detailed scientific explanations' }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            🤖 AI Climate Tutor
          </h3>
          <p className="text-gray-600 text-sm">
            Ask questions about the climate data for {locationData.address}
          </p>
        </div>
        
        {/* Complexity Level Selector */}
        <div className="flex flex-col items-end">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Explanation Level
          </label>
          <select
            value={complexityLevel}
            onChange={(e) => setComplexityLevel(e.target.value as ComplexityLevel)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(complexityLevelInfo).map(([level, info]) => (
              <option key={level} value={level}>
                {info.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1 text-right max-w-32">
            {complexityLevelInfo[complexityLevel].description}
          </p>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-96">
        {conversation.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌱</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to AI Climate Education!
            </h4>
            <p className="text-gray-600 mb-4">
              I can help you understand the climate data for your location. Ask me anything about:
            </p>
            <div className="text-left inline-block">
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Historical climate trends and changes</li>
                <li>• What the data means for your local environment</li>
                <li>• How your area compares to global patterns</li>
                <li>• Climate science concepts and explanations</li>
              </ul>
            </div>
          </div>
        ) : (
          conversation.map((turn, index) => (
            <div
              key={index}
              className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                  turn.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : turn.isLoading
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm">
                  {turn.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-400 rounded-full border-t-transparent"></div>
                      <span>{turn.content}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="whitespace-pre-wrap">{turn.content}</p>
                      
                      {/* Related Concepts */}
                      {turn.relatedConcepts && turn.relatedConcepts.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">Related concepts:</p>
                          <div className="flex flex-wrap gap-1">
                            {turn.relatedConcepts.map((concept, i) => (
                              <span
                                key={i}
                                className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Follow-up Suggestions */}
                      {turn.followUpSuggestions && turn.followUpSuggestions.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Ask me about:</p>
                          <div className="space-y-1">
                            {turn.followUpSuggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSuggestedQuestion(suggestion)}
                                className="block text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full transition-colors"
                                disabled={isLoading}
                              >
                                💬 {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Confidence Level */}
                      {turn.confidenceLevel && (
                        <div className="mt-2 pt-1 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Confidence: {turn.confidenceLevel}%</span>
                            <span>{new Date(turn.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (show only when no conversation) */}
      {conversation.length === 0 && suggestedQuestions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">💡 Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-left text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">⚠️ {error}</p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t pt-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={currentQuestion}
              onChange={handleTextareaChange}
              placeholder="Ask about the climate data... (e.g., 'How has temperature changed in my area?')"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!currentQuestion.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Ask'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
};

export default AIEducationInterface;