import { Product } from '../types/product';
import { analyzeProductWithGroq } from './groqService';

const ECOMMERCE_APIS = {
  amazon: 'https://api.rainforestapi.com/request',
  flipkart: 'https://flipkart-api.vercel.app/api/search',
  snapdeal: 'https://public.rapidapi.com/snapdeal/search'
};

interface ProductSource {
  name: string;
  price: number;
  url: string;
  rating?: number;
  image?: string;
}

export const searchAndAnalyzeProduct = async (query: string) => {
  try {
    // 1. Search for products across multiple sources
    const searchPromises = [
      searchAmazon(query),
      searchFlipkart(query),
      searchSnapdeal(query)
    ];

    const results = await Promise.allSettled(searchPromises);
    const products = results
      .filter((result): result is PromiseFulfilledResult<ProductSource[]> => result.status === 'fulfilled')
      .flatMap(result => result.value)
      .filter((product, index, self) => 
        index === self.findIndex(p => 
          p.name.toLowerCase() === product.name.toLowerCase()
        )
      )
      .slice(0, 3); // Get top 3 unique products

    // 2. Get analysis for each product using Groq
    const analysisPromises = products.map(product => 
      analyzeProductWithGroq({
        product_name: product.name,
        brand_name: '',
        description: '',
        cost_inr: product.price,
        category: '',
        platform: product.name,
        product_url: product.url,
        image_url: product.image || ''
      } as Product)
    );

    const analyses = await Promise.all(analysisPromises);

    // 3. Combine products with their analyses
    return products.map((product, index) => ({
      ...product,
      analysis: analyses[index]
    }));
  } catch (error) {
    console.error('Error in product search and analysis:', error);
    throw new Error('Failed to search and analyze products');
  }
};

// Mock implementations of e-commerce APIs
async function searchAmazon(query: string): Promise<ProductSource[]> {
  // In a real implementation, you would call the actual API
  return [{
    name: `${query} (Amazon)`,
    price: Math.floor(Math.random() * 5000) + 500,
    url: `https://amazon.in/s?k=${encodeURIComponent(query)}`,
    rating: Math.random() * 2 + 3,
    image: 'https://via.placeholder.com/150'
  }];
}

async function searchFlipkart(query: string): Promise<ProductSource[]> {
  // In a real implementation, you would call the actual API
  return [{
    name: `${query} (Flipkart)`,
    price: Math.floor(Math.random() * 5000) + 500,
    url: `https://flipkart.com/search?q=${encodeURIComponent(query)}`,
    rating: Math.random() * 2 + 3,
    image: 'https://via.placeholder.com/150'
  }];
}

async function searchSnapdeal(query: string): Promise<ProductSource[]> {
  // In a real implementation, you would call the actual API
  return [{
    name: `${query} (Snapdeal)`,
    price: Math.floor(Math.random() * 5000) + 500,
    url: `https://snapdeal.com/search?keyword=${encodeURIComponent(query)}`,
    rating: Math.random() * 2 + 3,
    image: 'https://via.placeholder.com/150'
  }];
}
