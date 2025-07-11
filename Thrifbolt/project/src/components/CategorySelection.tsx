import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Car, ShoppingBag, Clock, Zap, Star, Search } from 'lucide-react';

const CategorySelection: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'delivery',
      title: 'Quick Delivery',
      description: 'Compare food delivery apps and find the best deals',
      icon: Truck,
      color: 'from-green-500 to-emerald-600',
      features: ['Real-time delivery times', 'Compare delivery fees', 'Best offers & deals'],
      stats: '15+ Apps',
    },
    {
      id: 'rides',
      title: 'Ride Sharing',
      description: 'Compare ride prices and find the cheapest option',
      icon: Car,
      color: 'from-blue-500 to-cyan-600',
      features: ['Live fare comparison', 'Estimated arrival times', 'Multiple vehicle types'],
      stats: '4+ Services',
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce',
      description: 'Find the best prices across major shopping platforms',
      icon: ShoppingBag,
      color: 'from-purple-500 to-pink-600',
      features: ['Price comparison', 'Stock availability', 'Delivery estimates'],
      stats: '5+ Platforms',
    }
  ];

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/${categoryId}`);
  };

  return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-lavender-400 to-lavender-600 bg-clip-text text-transparent">
                Comparison
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Select a category to start comparing and find the best deals across multiple platforms
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 hover:border-lavender-500/50 transition-all duration-300 h-full">
                    <div className="mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow duration-300`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-white group-hover:text-lavender-400 transition-colors duration-300">
                          {category.title}
                        </h3>
                        <span className="px-3 py-1 bg-lavender-500/20 text-lavender-400 rounded-full text-sm font-medium">
                          {category.stats}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-lg mb-6">
                        {category.description}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {category.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-lavender-400 rounded-full"></div>
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-400 text-sm">Highly rated</span>
                      </div>
                      <div className="flex items-center space-x-1 text-lavender-400 group-hover:text-lavender-300 transition-colors duration-300">
                        <span className="text-sm font-medium">Compare now</span>
                        <Zap className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-lavender-500/10 to-purple-500/10 rounded-2xl p-8 border border-lavender-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">
                Why Choose ThrifCart?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="flex flex-col items-center">
                  <Clock className="h-8 w-8 text-lavender-400 mb-3" />
                  <h4 className="text-white font-semibold mb-2">Real-Time Data</h4>
                  <p className="text-gray-400 text-sm">Live pricing and availability updates</p>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="h-8 w-8 text-lavender-400 mb-3" />
                  <h4 className="text-white font-semibold mb-2">Lightning Fast</h4>
                  <p className="text-gray-400 text-sm">Instant comparisons across platforms</p>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="h-8 w-8 text-lavender-400 mb-3" />
                  <h4 className="text-white font-semibold mb-2">Best Deals</h4>
                  <p className="text-gray-400 text-sm">Always find the lowest prices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CategorySelection;