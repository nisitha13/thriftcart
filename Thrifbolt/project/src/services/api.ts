import axios from 'axios';

const API_BASE_URL = 'https://api.thrifcart.com'; // Mock API endpoint

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for development
const mockData = {
  deliveryApps: [
    {
      id: '1',
      name: 'Swiggy Instamart',
      logo: '🛒',
      deliveryTime: '10-15 min',
      deliveryFee: 25,
      rating: 4.4,
      offers: ['Free delivery on ₹199+', '20% off up to ₹100'],
      isAvailable: true,
    },
    {
      id: '2',
      name: 'Zomato',
      logo: '🥘',
      deliveryTime: '15-20 min',
      deliveryFee: 30,
      rating: 4.2,
      offers: ['30% off up to ₹150', 'Free delivery'],
      isAvailable: true,
    },
    {
      id: '3',
      name: 'Dunzo',
      logo: '📦',
      deliveryTime: '20-25 min',
      deliveryFee: 20,
      rating: 4.1,
      offers: ['₹50 off on ₹300', 'Express delivery'],
      isAvailable: true,
    },
    {
      id: '4',
      name: 'Zepto',
      logo: '⚡',
      deliveryTime: '8-12 min',
      deliveryFee: 15,
      rating: 4.5,
      offers: ['10-minute delivery', '₹75 off on ₹500'],
      isAvailable: true,
    },
    {
      id: '5',
      name: 'Blinkit',
      logo: '🟡',
      deliveryTime: '12-18 min',
      deliveryFee: 25,
      rating: 4.3,
      offers: ['Free delivery on ₹299+', '25% off'],
      isAvailable: true,
    },
    {
      id: '6',
      name: 'BigBasket',
      logo: '🥬',
      deliveryTime: '30-45 min',
      deliveryFee: 35,
      rating: 4.0,
      offers: ['₹100 off on ₹600', 'Fresh guarantee'],
      isAvailable: true,
    },
    {
      id: '7',
      name: 'JioMart',
      logo: '🛍️',
      deliveryTime: '2-4 hours',
      deliveryFee: 0,
      rating: 3.9,
      offers: ['Free delivery', '₹200 off on ₹1000'],
      isAvailable: true,
    },
    {
      id: '8',
      name: 'More',
      logo: '🏪',
      deliveryTime: '45-60 min',
      deliveryFee: 40,
      rating: 3.8,
      offers: ['Buy 2 Get 1 Free', '15% off'],
      isAvailable: false,
    },
  ],
  
  productSuggestions: [
    'Milk', 'Bread', 'Eggs', 'Rice', 'Dal', 'Oil', 'Sugar', 'Tea', 'Coffee', 'Biscuits',
    'Fruits', 'Vegetables', 'Chicken', 'Fish', 'Paneer', 'Yogurt', 'Butter', 'Cheese',
    'Onions', 'Tomatoes', 'Potatoes', 'Bananas', 'Apples', 'Oranges', 'Mangoes',
    'Detergent', 'Soap', 'Shampoo', 'Toothpaste', 'Tissue', 'Noodles', 'Pasta'
  ],

  rideApps: [
    {
      id: '1',
      name: 'Uber',
      logo: '🚗',
      estimatedTime: '5-8 min',
      estimatedFare: 150,
      rating: 4.5,
      vehicleType: 'UberGo',
      isAvailable: true,
    },
    {
      id: '2',
      name: 'Ola',
      logo: '🚕',
      estimatedTime: '7-10 min',
      estimatedFare: 140,
      rating: 4.2,
      vehicleType: 'Mini',
      isAvailable: true,
    },
    {
      id: '3',
      name: 'Rapido',
      logo: '🏍️',
      estimatedTime: '3-5 min',
      estimatedFare: 80,
      rating: 4.1,
      vehicleType: 'Bike',
      isAvailable: true,
    },
    {
      id: '4',
      name: 'Namma Yatri',
      logo: '🚙',
      estimatedTime: '6-9 min',
      estimatedFare: 120,
      rating: 4.3,
      vehicleType: 'Auto',
      isAvailable: true,
    },
  ],

  ecommerceApps: [
    {
      id: '1',
      name: 'Amazon',
      logo: '📦',
      price: 1299,
      originalPrice: 1599,
      discount: 19,
      deliveryTime: '1-2 days',
      inStock: true,
      rating: 4.3,
      offers: ['Prime delivery', '10% cashback'],
    },
    {
      id: '2',
      name: 'Flipkart',
      logo: '🛒',
      price: 1249,
      originalPrice: 1599,
      discount: 22,
      deliveryTime: '2-3 days',
      inStock: true,
      rating: 4.1,
      offers: ['Super Coin rewards', 'Exchange offer'],
    },
    {
      id: '3',
      name: 'Myntra',
      logo: '👕',
      price: 1350,
      originalPrice: 1599,
      discount: 16,
      deliveryTime: '3-4 days',
      inStock: true,
      rating: 4.2,
      offers: ['Free returns', 'Try before buy'],
    },
    {
      id: '4',
      name: 'Ajio',
      logo: '👗',
      price: 1199,
      originalPrice: 1599,
      discount: 25,
      deliveryTime: '4-5 days',
      inStock: false,
      rating: 4.0,
      offers: ['Fashion rewards', '₹200 off on ₹1000'],
    },
    {
      id: '5',
      name: 'Meesho',
      logo: '🏪',
      price: 999,
      originalPrice: 1299,
      discount: 23,
      deliveryTime: '5-7 days',
      inStock: true,
      rating: 3.8,
      offers: ['Free delivery', 'Cash on delivery'],
    },
  ],
};

// API functions
export const deliveryAPI = {
  searchProducts: async (query: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.deliveryApps;
  },
  
  getProductSuggestions: async (query: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockData.productSuggestions.filter(product => 
      product.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
  },
};

export const rideAPI = {
  compareRides: async (pickup: string, destination: string) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    // Add some randomization to simulate real API
    return mockData.rideApps.map(app => ({
      ...app,
      estimatedFare: app.estimatedFare + Math.floor(Math.random() * 50) - 25,
      estimatedTime: app.estimatedTime,
    }));
  },
  
  calculateDistance: async (pickup: string, destination: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Math.random() * 15 + 2; // Random distance between 2-17 km
  },
};

export const ecommerceAPI = {
  searchProducts: async (query: string, category: string = 'all') => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockData.ecommerceApps.map(app => ({
      ...app,
      price: app.price + Math.floor(Math.random() * 200) - 100,
    }));
  },
};

export const authAPI = {
  loginWithGoogle: async () => {
    // This would integrate with Google OAuth in production
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'google-' + Date.now(),
          name: 'Google User',
          email: 'user@gmail.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google-user',
        });
      }, 1000);
    });
  },
};