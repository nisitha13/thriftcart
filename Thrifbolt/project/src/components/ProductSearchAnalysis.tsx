import React, { useState, FormEvent } from 'react';
import { Star, Check, Search, Loader2, AlertCircle, ExternalLink, Info, Award, X } from 'lucide-react';

// Define interfaces
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating?: number;
  image: string;
  url: string;
  platform: string;
  features: string[];
  pros?: string[];
  cons?: string[];
  summary?: string;
  category?: string;
}

export interface AnalysisFeature {
  id?: string;
  name: string;
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  category?: string;
}

export interface AnalysisResult {
  features: AnalysisFeature[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
  overallScore: number;
  summary: string;
  recommendation: string;
  pros: string[];
  cons: string[];
  name?: string;
  reason?: string;
  comparison?: {
    bestOverall: string;
    bestValue: string;
    bestPremium: string;
  };
  recommendations?: {
    bestForFeatures: { platform: string };
    bestForBudget: { platform: string };
    bestForSpeed: { platform: string };
  };
  keyConsiderations?: string[];
  finalVerdict?: string;
}

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Delivery',
    brand: 'FastShip',
    price: 1299,
    rating: 4.5,
    image: 'https://via.placeholder.com/150',
    url: 'https://fastship.example.com',
    platform: 'FastShip',
    features: ['Same day', 'Tracking', '24/7 Support'],
    pros: ['Fast', 'Reliable'],
    cons: ['Expensive'],
  },
  // Add more mock products as needed
];

const ProductSearchAnalysis: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Format price with currency
  const formatPrice = (price: number | string | undefined): string => {
    if (price === undefined) return 'N/A';
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceNum);
  };

  // Render star rating component
  const renderRating = (rating?: number): JSX.Element | null => {
    if (rating === undefined) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && (
          <div className="relative h-4 w-4">
            <Star className="h-4 w-4 text-gray-300 fill-current" />
            <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Handle search form submission
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setProducts([]);
    setSelectedProduct(null);
    setAnalysis(null);

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      
      // Auto-select the first product for demo
      if (mockProducts.length > 0) {
        setSelectedProduct(mockProducts[0]);
      }
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render product features as chips
  const renderProductFeatures = (features: string[] = []) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {features.map((feature, index) => (
        <span
          key={`feature-${index}`}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {feature}
        </span>
      ))}
    </div>
  );

  // Group features by category
  const groupFeaturesByCategory = (features: AnalysisFeature[] = []) => {
    return features.reduce<Record<string, AnalysisFeature[]>>((groups, feature) => {
      const category = feature.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(feature);
      return groups;
    }, {});
  };

  // Process features to ensure they're in the correct format
  const processFeatures = (features: any[] = []): AnalysisFeature[] => {
    return features.map((feature, index) => ({
      id: `feature-${index}`,
      name: typeof feature === 'string' ? feature : feature.name || 'Feature',
      description: typeof feature === 'string' ? '' : feature.description || '',
      sentiment: (typeof feature === 'object' && 
        ['positive', 'negative', 'neutral'].includes(feature.sentiment) 
          ? feature.sentiment 
          : 'neutral') as 'positive' | 'negative' | 'neutral',
      score: typeof feature === 'object' && typeof feature.score === 'number' ? feature.score : 0,
      category: typeof feature === 'object' ? feature.category || 'General' : 'General'
    }));
  };

  // Render features grouped by category
  const renderFeaturesByCategory = (features: AnalysisFeature[] = []) => {
    const groupedFeatures = groupFeaturesByCategory(processFeatures(features));
    
    return (
      <div className="space-y-4">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{category}</h4>
            <ul className="space-y-2 pl-4 mt-2">
              {categoryFeatures.map((feature) => (
                <li key={feature.id} className="flex items-start">
                  <span className="flex-shrink-0 mt-0.5 mr-2">
                    {feature.sentiment === 'positive' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : feature.sentiment === 'negative' ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-gray-300" />
                    )}
                  </span>
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">{feature.name}</span>
                    {feature.description && (
                      <span className="text-gray-600">: {feature.description}</span>
                    )}
                    {feature.score !== undefined && (
                      <span className="ml-1 text-xs text-gray-500">
                        (Score: {feature.score.toFixed(1)})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Delivery Service Analysis
      </h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for delivery services..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && products.length === 0 && (
        <div className="text-center py-16">
          <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600">Analyzing delivery services...</p>
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <div className="space-y-8">
          {/* Results summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h2>
            <p className="text-gray-600">
              Found {products.length} delivery services matching your search
            </p>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  selectedProduct?.id === product.id
                    ? 'ring-2 ring-blue-500 border-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-medium">
                          {product.platform.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {renderRating(product.rating)}
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-900">Features</h4>
                      {renderProductFeatures(product.features.slice(0, 3))}
                      {product.features.length > 3 && (
                        <p className="mt-1 text-xs text-gray-500">+{product.features.length - 3} more</p>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Product Details */}
          {selectedProduct && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-gray-600">{selectedProduct.brand}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Price</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {formatPrice(selectedProduct.price)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rating</p>
                      <div className="mt-1">
                        {renderRating(selectedProduct.rating)}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Platform</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.platform}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Website</p>
                      <a
                        href={selectedProduct.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
                  {renderProductFeatures(selectedProduct.features)}
                </div>
              </div>
              
              {(selectedProduct.pros?.length || selectedProduct.cons?.length) && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedProduct.pros?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Pros</h3>
                      <ul className="space-y-2">
                        {selectedProduct.pros.map((pro, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedProduct.cons?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Cons</h3>
                      <ul className="space-y-2">
                        {selectedProduct.cons.map((con, i) => (
                          <li key={i} className="flex items-start">
                            <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {selectedProduct.summary && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
                  <p className="text-gray-700">{selectedProduct.summary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {!isLoading && products.length === 0 && !error && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No delivery services found</h3>
          <p className="mt-1 text-gray-500">
            Try searching for a delivery service to see analysis results.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductSearchAnalysis;
