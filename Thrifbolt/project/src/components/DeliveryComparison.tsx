import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, ShoppingCart, X, Check, ExternalLink } from 'lucide-react';
import ProductAnalysisSidebar from './ProductAnalysisSidebar';
import { analyzeDeliveryService } from '../services/groqService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Health impact score display component
const HealthScoreMeter = ({ score, label }: { score: number; label: string }) => (
  <div className="mb-2">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-300">{label}</span>
      <span className="font-medium">{score}/5</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div 
        className={`h-full rounded-full ${
          score >= 4 ? 'bg-green-500' : score >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
        }`} 
        style={{ width: `${(score / 5) * 100}%` }}
      />
    </div>
  </div>
);

interface DeliveryApp {
  id: string;
  name: string;
  logo: string;
  deliveryTime: string;
  deliveryFee: number;
  rating: number;
  offers: string[];
  isAvailable: boolean;
}

const DeliveryComparison: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryApps, setDeliveryApps] = useState<DeliveryApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<DeliveryApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'rating'>('time');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{
    id?: string;
    name?: string;
    platform?: string;
    deliveryTime?: string;
    cost_inr?: number;
    rating?: number;
    features?: string[];
    analysis?: any;
  } | null>(null);
  const [isAnalysisSidebarOpen, setIsAnalysisSidebarOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [cart, setCart] = useState<{item: DeliveryApp, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Platform links for redirection
  const platformLinks: { [key: string]: string } = {
    'zepto': 'https://www.zeptonow.com/',
    'blinkit': 'https://blinkit.com/',
    'zomato': 'https://www.zomato.com/order-food-online',
    'swiggy instamart': 'https://www.swiggy.com/instamart',
    'dunzo': 'https://www.dunzo.com/',
    'jiomart': 'https://www.jiomart.com/',
    'bigbasket': 'https://www.bigbasket.com/',
    'amazon fresh': 'https://www.amazon.in/amazonfresh',
    'flipkart grocery': 'https://www.flipkart.com/grocery-supermart-store',
    'grofers': 'https://grofers.com/'
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(new URL('../data/quickdelivery.json', import.meta.url).href);
        const data = await response.json();

        let platforms: DeliveryApp[] = [];
        if (data.platforms) {
          platforms = data.platforms.flatMap((platform: any, index: number) => {
            const products = platform.categories.flatMap((cat: any) => cat.products);
            return products.map((product: any, i: number) => {
              const name = product.product_name;
              return {
                id: `${platform.platform_name}-${i}`,
                name,
                logo: platform.platform_name.toLowerCase(), // lowercase for consistency
                deliveryTime: product.delivery_time.replace(' minutes', ''),
                deliveryFee: parseInt(product.cost.replace('Rs ', '')),
                rating: Math.floor(Math.random() * 5) + 1,
                offers: [product.weight],
                isAvailable: true,
              };
            });
          });
        }
        setDeliveryApps(platforms);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    const keywords = searchQuery.toLowerCase().split(' ').filter(Boolean);
    let result = deliveryApps.filter(app =>
      keywords.every(kw => app.name.toLowerCase().includes(kw))
    );
    if (maxPrice !== null) {
      result = result.filter(app => app.deliveryFee <= maxPrice);
    }
    setFilteredApps(result);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 1) {
      const uniqueSuggestions = [...new Set(
        deliveryApps.map(app => app.name).filter(name =>
          value.toLowerCase().split(' ').every(kw => name.toLowerCase().includes(kw))
        )
      )];
      setSuggestions(uniqueSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
      setShowSuggestions(false);
    }
  };

  const sortedApps = [...filteredApps].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.deliveryFee - b.deliveryFee;
      case 'rating':
        return b.rating - a.rating;
      case 'time':
      default:
        return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
    }
  });

  const chartData = sortedApps.map(app => ({
    name: app.name,
    DeliveryFee: app.deliveryFee,
    DeliveryTime: parseInt(app.deliveryTime)
  }));

  // Add item to cart
  const addToCart = (app: DeliveryApp) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.item.id === app.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.item.id === app.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { item: app, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (appId: string) => {
    setCart(prevCart => prevCart.filter(item => item.item.id !== appId));
  };

  // Update item quantity in cart
  const updateQuantity = (appId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.item.id === appId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, { item, quantity }) => total + item.deliveryFee * quantity,
    0
  );

  // Place order
  const placeOrder = () => {
    // In a real app, you would send the order to your backend here
    setOrderPlaced(true);
    setTimeout(() => {
      setCart([]);
      setIsCartOpen(false);
      setOrderPlaced(false);
    }, 3000);
  };

  const handleAnalyzeProduct = useCallback(async (product: any) => {
    setSelectedProduct(product);
    setAnalysisLoading(true);
    setAnalysisError(null);
    
    try {
      // Fetch analysis from Groq
      const analysis = await analyzeDeliveryService({
        ...product,
        deliveryTime: product.description?.match(/(\d+)\s*min/)?.[1] || '30',
        features: product.features || [],
        platform: product.platform || 'Unknown',
        cost_inr: product.cost_inr || 0,
        rating: product.rating || 0
      });
      
      setSelectedProduct(prev => ({
        ...prev,
        analysis // Attach analysis to the product
      }));
      
      setIsAnalysisSidebarOpen(true);
    } catch (error) {
      console.error('Error analyzing product:', error);
      setAnalysisError('Failed to analyze the delivery service. Please try again.');
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-white relative">
      <ProductAnalysisSidebar
        isOpen={isAnalysisSidebarOpen}
        onClose={() => {
          setIsAnalysisSidebarOpen(false);
          // Clear selected product after a delay to avoid UI flicker
          setTimeout(() => setSelectedProduct(null), 300);
        }}
        product={selectedProduct}
        analysis={selectedProduct?.analysis}
      >
        {selectedProduct?.analysis?.healthScores && (
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-white">Health Impact Analysis</h3>
            <div className="space-y-3">
              <HealthScoreMeter 
                score={selectedProduct.analysis.healthScores.foodSafety} 
                label="Food Safety" 
              />
              <HealthScoreMeter 
                score={selectedProduct.analysis.healthScores.nutritionalValue} 
                label="Nutritional Value" 
              />
              <HealthScoreMeter 
                score={selectedProduct.analysis.healthScores.ingredientQuality} 
                label="Ingredient Quality" 
              />
              <HealthScoreMeter 
                score={selectedProduct.analysis.healthScores.preparationMethods} 
                label="Preparation Methods" 
              />
              <HealthScoreMeter 
                score={selectedProduct.analysis.healthScores.environmentalImpact} 
                label="Environmental Impact" 
              />
              <HealthScoreMeter 
                score={selectedProduct.analysis.healthScores.workerWelfare} 
                label="Worker Welfare" 
              />
            </div>
            
            {selectedProduct.analysis.healthTips?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="font-medium text-white mb-2">Health Tips</h4>
                <ul className="space-y-2">
                  {selectedProduct.analysis.healthTips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedProduct.analysis.certifications?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="font-medium text-white mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.analysis.certifications.map((cert: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ProductAnalysisSidebar>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">Quick Delivery Comparison</h1>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-white hover:bg-gray-700 rounded-full"
          >
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-lavender-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
        <p className="text-center text-lavender-300 mb-4 italic">Compare prices & speed across all platforms 🚀</p>

        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products (e.g., milk, eggs, chips)..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
              {showSuggestions && (
                <ul className="absolute z-50 bg-gray-800 border border-gray-600 mt-1 rounded-lg max-h-64 overflow-y-auto w-full">
                  {suggestions.map((sug, i) => (
                    <li
                      key={i}
                      onMouseDown={() => handleSuggestionClick(sug)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              type="number"
              placeholder="Max Price (₹)"
              value={maxPrice ?? ''}
              onChange={e => setMaxPrice(Number(e.target.value) || null)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'time' | 'price' | 'rating')}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
            >
              <option value="time">Sort by Time</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-lavender-500 text-white rounded-lg hover:bg-lavender-600"
            >
              <Search className="h-4 w-4 inline mr-2" />Search
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-300">Loading...</p>
        ) : (
          <>
            {sortedApps.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-max">
                  {sortedApps.map((app) => (
                    <div key={app.id} className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 hover:border-lavender-400/50 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">{app.name.charAt(0)}</span>
                          </div>
                          <h3 className="font-medium">{app.name}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-lavender-300">{app.deliveryTime} min</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnalyzeProduct({
                                product_name: app.name,
                                brand_name: app.logo,
                                description: `Delivery service from ${app.logo} with ${app.deliveryTime} minute delivery time`,
                                cost_inr: app.deliveryFee,
                                category: 'Delivery Service',
                                platform: app.logo,
                                product_url: platformLinks[app.logo] || '#',
                                rating: app.rating,
                                features: app.offers || []
                              });
                            }}
                            className="p-1.5 rounded-full bg-gray-700/50 text-gray-300 hover:bg-lavender-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            title="AI Analysis"
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        {app.deliveryTime} min | ₹{app.deliveryFee}
                      </p>
                      <p className="text-yellow-400 text-sm">⭐ {app.rating}</p>
                      <p className="text-sm text-gray-300 italic">{app.logo} Platform</p>
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={() => addToCart(app)}
                          className="w-full px-4 py-2 bg-lavender-500 rounded text-white hover:bg-lavender-600 text-center"
                        >
                          Add to Cart
                        </button>
                        <a
                          href={platformLinks[app.logo.toLowerCase()] || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-sm text-lavender-300 hover:text-lavender-200 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>View on {app.logo}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12">
                  <h2 className="text-2xl font-semibold mb-4 text-center">Comparison Chart</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fill: 'white', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="DeliveryFee" fill="#8884d8" name="Delivery Fee" />
                      <Bar dataKey="DeliveryTime" fill="#82ca9d" name="Delivery Time" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500 border-t border-gray-700 pt-4">
          © {new Date().getFullYear()} ThrifCart. All rights reserved.
        </footer>
      </div>
      
      {analysisError && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <span>{analysisError}</span>
          <button 
            onClick={() => setAnalysisError(null)}
            className="text-white hover:text-gray-200"
          >
            &times;
          </button>
        </div>
      )}
      
      {analysisLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Preparing analysis...</span>
        </div>
      )}
      
      {/* Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-800 shadow-xl transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Your Cart</h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some items to get started</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-4 py-2 bg-lavender-500 text-white rounded-md hover:bg-lavender-600"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.map(({ item, quantity }) => (
                  <div key={item.id} className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      <span className="text-lg font-medium text-white">{item.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-sm text-gray-300">
                        {item.deliveryTime} min • ₹{item.deliveryFee}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                        className="px-2 py-1 bg-gray-600 rounded-l-md text-white hover:bg-gray-500"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 bg-gray-700 text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                        className="px-2 py-1 bg-gray-600 rounded-r-md text-white hover:bg-gray-500"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 text-gray-400 hover:text-red-400"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <div className="flex justify-between mb-4 text-lg font-medium">
                  <span>Total:</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={placeOrder}
                  disabled={orderPlaced}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                    orderPlaced
                      ? 'bg-green-500 cursor-not-allowed'
                      : 'bg-lavender-500 hover:bg-lavender-600'
                  }`}
                >
                  {orderPlaced ? (
                    <span className="flex items-center justify-center">
                      <Check className="h-5 w-5 mr-2" />
                      Order Placed!
                    </span>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
};

export default DeliveryComparison;
