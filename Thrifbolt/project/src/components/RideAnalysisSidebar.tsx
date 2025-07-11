import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, Star, Zap, MapPin, Navigation, Car, Bike, Clock3 } from 'lucide-react';

// Define local types
interface RideFeature {
  name: string;
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  explanation: string;
}

interface RideAnalysisResult {
  features: RideFeature[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
  overallScore: number;
  summary: string;
  recommendation: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  alternatives?: Array<{ name: string; reason: string }>;
}

interface RideAnalysisSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ride: any; // This would be your ride data type
  isDelivery?: boolean;
}

// Helper function to generate ride analysis
const generateRideAnalysis = (ride: any): RideAnalysisResult | null => {
  if (!ride) return null;
  
  const basePrice = ride.cost_inr || 0;
  const travelTime = ride.travel_time_minutes || 0;
  const pickupTime = ride.pickup_time_minutes || 0;
  const vehicleType = ride.vehicle_type || 'ride';
  
  // Calculate price sentiment (lower is better)
  const priceSentiment = basePrice < 200 ? 'positive' : (basePrice < 400 ? 'neutral' : 'negative');
  const priceScore = Math.max(0, 100 - (basePrice / 10)); // Lower price = higher score
  
  // Calculate time sentiment and score based on distance
  // Assuming average city speed of 20-30 km/h, we'll calculate expected time for the distance
  const distance = ride.distance_km || 1; // Default to 1km if distance is not available
  const minExpectedTime = Math.max(5, Math.round((distance / 30) * 60)); // Fastest possible time (30 km/h)
  const maxExpectedTime = Math.round((distance / 10) * 60); // Slowest reasonable time (10 km/h)
  
  // Calculate time score as percentage between min and max expected times
  let timeScore;
  if (travelTime <= minExpectedTime) {
    timeScore = 100; // Best possible score
  } else if (travelTime >= maxExpectedTime) {
    timeScore = 10; // Minimum score for very slow times
  } else {
    // Scale between 100 and 10 based on position between min and max
    timeScore = Math.round(100 - (90 * (travelTime - minExpectedTime) / (maxExpectedTime - minExpectedTime)));
  }
  
  // Determine sentiment based on score
  const timeSentiment = timeScore > 70 ? 'positive' : (timeScore > 40 ? 'neutral' : 'negative');
  
  // Calculate pickup time sentiment (lower is better)
  const pickupSentiment = pickupTime < 5 ? 'positive' : (pickupTime < 15 ? 'neutral' : 'negative');
  const pickupScore = Math.max(0, 100 - (pickupTime * 5)); // Lower pickup time = higher score
  
  const features: RideFeature[] = [
    {
      name: 'Price',
      description: `₹${basePrice.toLocaleString()}`,
      sentiment: priceSentiment,
      score: Math.min(100, Math.max(0, priceScore)),
      explanation: priceSentiment === 'positive' 
        ? 'Great price for this route' 
        : (priceSentiment === 'neutral' ? 'Average pricing' : 'Higher than typical pricing'),
    },
    {
      name: 'Travel Time',
      description: `${travelTime} minutes`,
      sentiment: timeSentiment,
      score: Math.min(100, Math.max(0, timeScore)),
      explanation: timeSentiment === 'positive' 
        ? 'Faster than average for this distance' 
        : (timeSentiment === 'neutral' ? 'Average travel time' : 'Longer than typical for this distance'),
    },
    {
      name: 'Pickup Time',
      description: `${pickupTime} min wait`,
      sentiment: pickupSentiment,
      score: Math.min(100, Math.max(0, pickupScore)),
      explanation: pickupSentiment === 'positive' 
        ? 'Quick pickup time' 
        : (pickupSentiment === 'neutral' ? 'Average wait time' : 'Longer than typical wait'),
    },
  ];

  const overallScore = Math.round((features.reduce((sum, f) => sum + f.score, 0) / features.length) * 10) / 10;
  const isGoodOption = overallScore > 70;
  
  return {
    features,
    overallSentiment: isGoodOption ? 'positive' : (overallScore > 40 ? 'neutral' : 'negative'),
    overallScore,
    summary: `${ride.platform}'s ${vehicleType} service from ${ride.pickup_location} to ${ride.destination} is ${isGoodOption ? 'a good option' : 'available'} with an estimated ${travelTime} minute travel time.`,
    recommendation: isGoodOption ? 'Recommended' : 'Consider alternatives',
    pros: [
      `₹${basePrice} for ${ride.distance_km}km`,
      `${travelTime} minute estimated travel time`,
      `${pickupTime} minute estimated pickup time`,
    ],
    cons: [
      priceSentiment === 'negative' ? 'Higher than average price' : 'Standard pricing',
      timeSentiment === 'negative' ? 'Longer than average travel time' : 'Standard travel time',
    ],
    bestFor: isGoodOption 
      ? `Quick ${vehicleType.toLowerCase()} trips in ${ride.pickup_location.split(',')[0]}` 
      : `When other options aren't available`,
    alternatives: [
      {
        name: 'Other Vehicle Types',
        reason: 'Consider different vehicle classes for better pricing or availability',
      },
      {
        name: 'Alternative Times',
        reason: 'Prices and availability may vary at different times',
      },
    ],
  };
};

const RideAnalysisSidebar: React.FC<RideAnalysisSidebarProps> = ({
  isOpen,
  onClose,
  ride,
  isDelivery = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RideAnalysisResult | null>(null);

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      case 'neutral':
      default: return 'text-yellow-400';
    }
  };

  const getSentimentBgColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      case 'neutral':
      default: return 'bg-yellow-500';
    }
  };

  const fetchAnalysis = useCallback(async () => {
    if (!ride) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would call your API here
      // For now, we'll use the mock data generator
      const analysisData = generateRideAnalysis(ride);
      
      if (!analysisData) {
        throw new Error('Could not generate ride analysis');
      }
      
      setAnalysis(analysisData);
    } catch (err) {
      console.error('Error analyzing ride:', err);
      setError('Failed to analyze ride. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [ride]);

  useEffect(() => {
    if (isOpen && ride) {
      fetchAnalysis();
    }
  }, [isOpen, ride, fetchAnalysis]);

  if (!isOpen) return null;

  const renderFeature = (feature: RideFeature, index: number) => (
    <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-white">{feature.name}</h4>
        <span className={`text-sm ${getSentimentColor(feature.sentiment)}`}>
          {feature.score}%
        </span>
      </div>
      <p className="text-sm text-gray-300 mt-1">{feature.description}</p>
      <div className="mt-2 h-2 w-full bg-gray-600 rounded-full overflow-hidden">
        <div
          className={`h-full ${getSentimentBgColor(feature.sentiment)}`}
          style={{ width: `${feature.score}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{feature.explanation}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-scroll bg-gray-800 shadow-xl">
              <div className="px-4 py-6 sm:px-6 bg-gray-900">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-white">
                    {isLoading ? 'Analyzing...' : 'Ride Analysis'}
                  </h2>
                  <button
                    type="button"
                    className="rounded-md bg-gray-900 text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                {ride && !isLoading && !error && (
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-400">
                      <MapPin className="h-4 w-4 text-green-400 mr-1" />
                      <span>{ride.pickup_location}</span>
                      <Navigation className="h-4 w-4 mx-2 text-gray-500" />
                      <MapPin className="h-4 w-4 text-red-400 mr-1" />
                      <span>{ride.destination}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-400 flex items-center">
                      {ride.vehicle_type === 'Car' ? (
                        <Car className="h-4 w-4 mr-1" />
                      ) : (
                        <Bike className="h-4 w-4 mr-1" />
                      )}
                      {ride.vehicle_type}
                      <span className="mx-2">•</span>
                      <Clock3 className="h-4 w-4 mr-1" />
                      {ride.travel_time_minutes} min
                      <span className="mx-2">•</span>
                      <span className="font-medium text-white">₹{ride.cost_inr}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-300">Analyzing ride options...</p>
                  </div>
                ) : error ? (
                  <div className="text-center p-6">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                      onClick={fetchAnalysis}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Retry Analysis
                    </button>
                  </div>
                ) : analysis ? (
                  <>
                    {/* Overall Analysis */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white mb-3">Analysis</h3>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300">Overall Rating</span>
                          <span className={`text-lg font-bold ${getSentimentColor(analysis.overallSentiment)}`}>
                            {analysis.overallScore}/100
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{analysis.summary}</p>
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSentimentBgColor(analysis.overallSentiment)} text-white`}>
                            {analysis.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white mb-3">Key Metrics</h3>
                      <div className="space-y-4">
                        {analysis.features.map(renderFeature)}
                      </div>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2">Pros</h4>
                        <ul className="space-y-2">
                          {analysis.pros.map((pro, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-400 mr-2">✓</span>
                              <span className="text-sm text-gray-300">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2">Considerations</h4>
                        <ul className="space-y-2">
                          {analysis.cons.map((con, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-red-400 mr-2">!</span>
                              <span className="text-sm text-gray-300">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Best For */}
                    {analysis.bestFor && (
                      <div className="mb-6 bg-blue-900/30 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-1">Best For</h4>
                        <p className="text-sm text-blue-200">{analysis.bestFor}</p>
                      </div>
                    )}

                    {/* Alternatives */}
                    {analysis.alternatives && analysis.alternatives.length > 0 && (
                      <div>
                        <h4 className="font-medium text-white mb-2">Alternatives</h4>
                        <div className="space-y-2">
                          {analysis.alternatives.map((alt, i) => (
                            <div key={i} className="bg-gray-700/50 rounded-lg p-3">
                              <div className="font-medium text-white">{alt.name}</div>
                              <p className="text-sm text-gray-300">{alt.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6 text-gray-400">
                    No analysis available for this ride.
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 p-4">
                <button
                  type="button"
                  className="w-full bg-lavender-500 hover:bg-lavender-600 text-white py-2 px-4 rounded-md"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideAnalysisSidebar;
