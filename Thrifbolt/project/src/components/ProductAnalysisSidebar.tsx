import React, { useEffect, useState, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';

// Define local types to avoid external dependencies
type Sentiment = 'positive' | 'neutral' | 'negative';

interface AnalysisFeature {
  name: string;
  description: string;
  sentiment: Sentiment;
  score: number;
  explanation: string;
}

interface AnalysisResult {
  features: AnalysisFeature[];
  overallSentiment: Sentiment;
  overallScore: number;
  summary: string;
  recommendation: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  alternatives: Array<{ name: string; reason: string }>;
}

interface ProductAnalysisSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  isDelivery?: boolean;
  analysis?: AnalysisResult;
  propAnalysis?: AnalysisResult;
}



// Helper function to generate mock delivery analysis
const generateMockDeliveryAnalysis = (product: any): AnalysisResult | null => {
  if (!product) return null;
  
  return {
    features: [
      {
        name: 'Delivery Speed',
        description: 'Estimated delivery time',
        sentiment: 'positive' as const,
        score: 85,
        explanation: 'Faster than average delivery time',
      },
      {
        name: 'Pricing',
        description: 'Cost of delivery',
        sentiment: 'neutral' as const,
        score: 65,
        explanation: 'Average pricing compared to competitors',
      },
      {
        name: 'Reliability',
        description: 'On-time delivery rate',
        sentiment: 'positive' as const,
        score: 90,
        explanation: 'Highly reliable with 95% on-time delivery',
      },
    ],
    overallSentiment: 'positive' as const,
    overallScore: 80,
    summary: 'This delivery service offers fast and reliable shipping with competitive pricing.',
    recommendation: 'Recommended',
    pros: [
      'Fast delivery times',
      'High reliability',
      'Good customer service',
    ],
    cons: [
      'Slightly higher cost for express shipping',
      'Limited delivery areas',
    ],
    bestFor: 'Time-sensitive deliveries and important packages',
    alternatives: [
      {
        name: 'Standard Shipping',
        reason: 'More economical for non-urgent deliveries',
      },
      {
        name: 'Premium Delivery',
        reason: 'Faster delivery with additional tracking',
      },
    ],
  };
};

// Helper function to generate mock e-commerce product analysis
const generateMockProductAnalysis = (product: any): AnalysisResult | null => {
  if (!product) return null;
  
  const basePrice = product.cost_inr || 0;
  const discount = product.discount || 0;
  const originalPrice = product.original_price || basePrice / (1 - (discount / 100));
  const isGoodDeal = discount >= 20 || basePrice < originalPrice * 0.8;
  const rating = product.rating || 4.0 + (Math.random() * 1.0); // Random rating between 4.0 and 5.0
  
  const features: AnalysisFeature[] = [
    {
      name: 'Price Value',
      description: `Current price: ₹${basePrice.toLocaleString()}${discount > 0 ? ` (${discount}% off)` : ''}`,
      sentiment: isGoodDeal ? 'positive' : (discount > 0 ? 'neutral' : 'negative'),
      score: isGoodDeal ? 90 : (discount > 0 ? 70 : 40),
      explanation: isGoodDeal 
        ? 'Great deal compared to market price' 
        : (discount > 0 ? 'Standard pricing' : 'Could find better deals'),
    },
    {
      name: 'Product Rating',
      description: `Rated ${rating.toFixed(1)}/5.0`,
      sentiment: rating >= 4.5 ? 'positive' : (rating >= 3.5 ? 'neutral' : 'negative'),
      score: (rating / 5) * 100,
      explanation: rating >= 4.5 
        ? 'Excellent customer feedback' 
        : (rating >= 3.5 ? 'Average customer satisfaction' : 'Below average reviews'),
    },
    {
      name: 'Availability',
      description: product.in_stock ? 'In Stock' : 'Out of Stock',
      sentiment: product.in_stock ? 'positive' : 'negative',
      score: product.in_stock ? 95 : 30,
      explanation: product.in_stock ? 'Ready to ship' : 'Currently unavailable',
    },
  ];

  return {
    features,
    overallSentiment: isGoodDeal && rating >= 4.0 ? 'positive' : (rating >= 3.0 ? 'neutral' : 'negative'),
    overallScore: Math.round((features.reduce((sum, f) => sum + f.score, 0) / features.length) * 10) / 10,
    summary: `${product.product_name} is ${isGoodDeal ? 'a good deal at the current price' : 'priced at market rate'} with ${rating >= 4.0 ? 'excellent' : rating >= 3.0 ? 'decent' : 'mixed'} customer reviews.`,
    recommendation: isGoodDeal ? 'Recommended' : 'Consider alternatives',
    pros: [
      isGoodDeal ? 'Good discount available' : 'Competitive pricing',
      rating >= 4.0 ? 'Highly rated by customers' : 'Decent customer feedback',
      product.in_stock ? 'Available for immediate purchase' : 'Check back soon for restock',
    ],
    cons: [
      !isGoodDeal ? 'Limited time offers available' : 'Limited stock remaining',
      rating < 3.5 ? 'Some customers reported issues' : 'Check product reviews for details',
    ],
    bestFor: 'Shoppers looking for ' + (isGoodDeal ? 'a great deal' : 'this specific product'),
    alternatives: [
      {
        name: 'Similar Products',
        reason: 'Compare with similar items for better value',
      },
    ],
  };
};

const ProductAnalysisSidebar: React.FC<ProductAnalysisSidebarProps> = ({
  isOpen,
  onClose,
  product,
  isDelivery = false,
  analysis: propAnalysis,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayAnalysis, setDisplayAnalysis] = useState<AnalysisResult | undefined>(undefined);

  const getSentimentColor = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      case 'neutral':
      default:
        return 'text-yellow-400';
    }
  };

  const getSentimentBgColor = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500';
      case 'negative':
        return 'bg-red-500';
      case 'neutral':
      default:
        return 'bg-yellow-500';
    }
  };

  const renderFeatureItem = (feature: AnalysisFeature, index: number) => (
    <div key={index} className="rounded-lg bg-gray-700 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white">{feature.name || 'Feature'}</h4>
        <span className={`text-sm font-medium ${getSentimentColor(feature.sentiment)}`}>
          {Math.round(feature.score)}%
        </span>
      </div>
      {feature.description && (
        <p className="mt-1 text-sm text-gray-300">{feature.description}</p>
      )}
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-600">
        <div
          className={`h-full ${getSentimentBgColor(feature.sentiment)}`}
          style={{ width: `${Math.min(100, Math.max(0, feature.score))}%` }}
        />
      </div>
    </div>
  );



  const fetchAnalysis = useCallback(async () => {
    if (!product) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use prop analysis if available, otherwise generate mock data
      let analysisData = propAnalysis;
      
      if (!analysisData) {
        // Generate appropriate analysis based on the type
        analysisData = isDelivery 
          ? generateMockDeliveryAnalysis(product)
          : generateMockProductAnalysis(product);
      }
      
      if (!analysisData) {
        throw new Error('Could not generate analysis');
      }
      setDisplayAnalysis(analysisData);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to analyze the product. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [product, propAnalysis, isDelivery]);

  useEffect(() => {
    if (isOpen && product) {
      fetchAnalysis();
    }
  }, [isOpen, product, fetchAnalysis]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-scroll bg-gray-800 shadow-xl">
              <div className="px-4 py-6 sm:px-6 bg-gray-900">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-white">
                    {isLoading ? 'Analyzing...' : 'Analysis Results'}
                  </h2>
                  <div className="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      className="rounded-md bg-gray-900 text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
              {isLoading ? (
                <div className="flex flex-1 flex-col items-center justify-center p-6">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                  <p className="mt-4 text-gray-300">Analyzing product data...</p>
                </div>
              ) : error ? (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-red-400">
                  <p className="text-center">{error}</p>
                  <button
                    onClick={fetchAnalysis}
                    className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Retry Analysis
                  </button>
                </div>
              ) : !displayAnalysis ? (
                <div className="flex flex-1 items-center justify-center p-6">
                  <p className="text-center text-gray-400">No analysis data available.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Overall Sentiment */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white">Overall Analysis</h3>
                    <div className="mt-2 flex items-center">
                      <div className={`h-12 w-1 ${getSentimentColor(displayAnalysis.overallSentiment)} rounded-full`}></div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-300">
                          {displayAnalysis.summary}
                        </p>
                        <div className="mt-2 flex items-center">
                          <span className={`text-sm font-medium ${getSentimentColor(displayAnalysis.overallSentiment)}`}>
                            {displayAnalysis.overallSentiment.charAt(0).toUpperCase() + displayAnalysis.overallSentiment.slice(1)}
                          </span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-sm text-gray-400">
                            Score: {Math.round(displayAnalysis.overallScore)}/100
                          </span>
                        </div>
                        {isDelivery && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor('positive')} bg-opacity-20`}>
                              {displayAnalysis.recommendation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Feature Analysis */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white">Key Metrics</h3>
                    <div className="mt-4 space-y-4">
                      {displayAnalysis.features.map((feature, index) => renderFeatureItem(feature, index))}
                    </div>
                  </div>

                  {/* Additional Delivery Insights */}
                  {isDelivery && displayAnalysis.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white">Delivery Insights</h3>
                      <div className="mt-4">
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          {displayAnalysis.features.map((feature, index) => (
                            <div 
                              key={index}
                              className={`h-full ${getSentimentColor(feature.sentiment)}`}
                              style={{ width: `${100 / displayAnalysis.features.length}%`, display: 'inline-block' }}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-gray-400">
                          {displayAnalysis.features.map((feature, index) => (
                            <div key={index} className="flex items-center">
                              <div 
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: getSentimentColor(feature.sentiment).replace('bg-', '') }}
                              />
                              {feature.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pros & Cons */}
                  {(displayAnalysis.pros?.length > 0 || displayAnalysis.cons?.length > 0) && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white">Quick Overview</h3>
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {displayAnalysis.pros?.length > 0 && (
                          <div className="rounded-lg bg-gray-700 p-4">
                            <h4 className="font-medium text-white">Pros</h4>
                            <ul className="mt-2 text-sm text-gray-300">
                              {displayAnalysis.pros.map((pro, index) => (
                                <li key={index} className="mb-1">{pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {displayAnalysis.cons?.length > 0 && (
                          <div className="rounded-lg bg-gray-700 p-4">
                            <h4 className="font-medium text-white">Cons</h4>
                            <ul className="mt-2 text-sm text-gray-300">
                              {displayAnalysis.cons.map((con, index) => (
                                <li key={index} className="mb-1">{con}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Best For */}
                  {displayAnalysis.bestFor && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white">Best For</h3>
                      <div className="mt-2 rounded-lg bg-blue-900 bg-opacity-30 p-4">
                        <p className="text-sm text-gray-300">{displayAnalysis.bestFor}</p>
                      </div>
                    </div>
                  )}

                  {/* Alternatives */}
                  {displayAnalysis.alternatives?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-white">Alternatives</h3>
                      <div className="mt-4 space-y-3">
                        {displayAnalysis.alternatives.map((alt, i) => (
                          <div key={i} className="rounded-lg bg-gray-700 p-4">
                            <h4 className="font-medium text-white">{alt.name}</h4>
                            <p className="mt-1 text-sm text-gray-300">{alt.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalysisSidebar;
