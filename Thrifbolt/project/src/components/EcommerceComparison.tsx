import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Search, ShoppingBag, Sparkles } from 'lucide-react';
import ProductAnalysisSidebar from './ProductAnalysisSidebar';
import ecommerceDataRaw from '../data/ecomdata.json';
import { Product } from '../types/product';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  CartesianGrid,
} from 'recharts';

// Define the structure of our raw data
interface RawProduct {
  product_name: string;
  platform: string;
  cost_inr: number;
  in_stock: boolean;
  description: string;
  brand_name: string;
  model_number: string;
  sizes_available?: string[];
  color_options?: string[];
  material: string;
  estimated_delivery: string;
  category: string;
  sub_category: string;
  image_url?: string;
  rating?: number;
  review_count?: number;
  discount?: number;
  original_price?: number;
  url: string;
}

// Convert raw product data to our Product type
const products: Product[] = (ecommerceDataRaw.products as unknown as RawProduct[]).map(item => ({
  ...item,
  in_stock: item.in_stock ?? true,
  sizes_available: item.sizes_available ?? [],
  color_options: item.color_options ?? [],
}));

interface GroupedProduct {
  productName: string;
  platforms: Product[];
}

function groupProductsByName(products: Product[]): GroupedProduct[] {
  const map = new Map<string, Product[]>();
  products.forEach((item) => {
    const key = item.product_name.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(item);
  });
  return Array.from(map.entries()).map(([productName, platforms]) => ({
    productName,
    platforms,
  }));
}

const EcommerceComparison: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedForAnalysis, setSelectedForAnalysis] = useState<Product | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedForAnalysis(product);
    setShowAnalysis(true);
  }, []);

  const closeAnalysis = useCallback(() => {
    setShowAnalysis(false);
    // Small delay to allow the sidebar to close before clearing the product
    setTimeout(() => setSelectedForAnalysis(null), 300);
  }, []);

  const uniqueProductNames = useMemo(() => 
    Array.from(new Set(products.map((p) => p.product_name))),
    []
  );

  const filteredNames = useMemo(() => 
    searchQuery && showDropdown
      ? uniqueProductNames.filter((name) =>
          name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [],
    [searchQuery, showDropdown, uniqueProductNames]
  );

  const filteredProducts = useMemo(() => 
    searched && selectedProduct
      ? groupProductsByName(
          products.filter((item) =>
            item.product_name.toLowerCase().includes(selectedProduct.toLowerCase())
          )
        )
      : [],
    [searched, selectedProduct]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSearched(false);
    setShowDropdown(true);
  }, []);

  const handleDropdownSelect = useCallback((name: string) => {
    setSearchQuery(name);
    setSelectedProduct(name);
    setSearched(false);
    setShowDropdown(false);
    inputRef.current?.focus();
  }, []);

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSelectedProduct(searchQuery);
    setShowDropdown(false);
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
    }, 500);
  }, [searchQuery]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Prepare chart data
  type ChartDataPoint = { name: string; price: number };
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!searched || filteredProducts.length === 0) return [];
    
    return filteredProducts.flatMap(group =>
      group.platforms.map(p => ({
        name: p.platform,
        price: p.cost_inr,
      }))
    );
  }, [searched, filteredProducts]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">E-commerce Price Comparison</h1>
          <p className="text-gray-300">Compare prices across multiple platforms</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowDropdown(true)}
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-4 flex items-center bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Search Suggestions Dropdown */}
          {showDropdown && filteredNames.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredNames.map((name) => (
                <div
                  key={name}
                  className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleDropdownSelect(name)}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : searched && filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-white">No products found</h3>
            <p className="mt-1 text-gray-400">Try a different search term</p>
          </div>
        ) : (
          <>
            {searched && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Price Comparison</h2>
                <div className="bg-gray-800 rounded-lg p-4 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis dataKey="name" tick={{ fill: 'white' }} />
                      <YAxis tick={{ fill: 'white' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="price" fill="#8884d8" name="Price (INR)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((group) => (
                <div key={group.productName} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{group.productName}</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      {group.platforms.length} platform{group.platforms.length !== 1 ? 's' : ''} available
                    </p>
                    
                    <div className="space-y-4">
                      {group.platforms.map((product) => (
                        <div 
                          key={`${product.platform}-${product.product_name}`}
                          className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => handleProductClick(product)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-white">{product.platform}</h4>
                              <p className="text-sm text-gray-300">₹{product.cost_inr.toLocaleString()}</p>
                              {product.in_stock ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                                  In Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductClick(product);
                                }}
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Analyze
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* AI Analysis Sidebar */}
      <ProductAnalysisSidebar
        isOpen={showAnalysis && selectedForAnalysis !== null}
        onClose={closeAnalysis}
        product={selectedForAnalysis}
      />
    </div>
  );
};

export default EcommerceComparison;
