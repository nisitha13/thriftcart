import { Product } from '../types/product';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Available models from Groq API
const GROQ_MODELS = {
  // Latest models (2024)
  LLAMA3_70B: 'llama-3.3-70b-versatile',
  LLAMA3_8B: 'llama-3.1-8b',
  
  // Other available models
  MIXTRAL_8X7B: 'mixtral-8x7b-32768',
  GEMMA_7B: 'gemma-7b-it'
} as const;

export type GroqModel = keyof typeof GROQ_MODELS;
export { GROQ_MODELS };

if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not set. Please add it to your .env file as VITE_GROQ_API_KEY');
}

export interface AnalysisFeature {
  name: string;
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  explanation?: string;
}

export interface AnalysisResult {
  features: AnalysisFeature[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
  overallScore: number;
  summary: string;
  recommendation: string;
  explanation?: string | string[];
  pros?: string[];
  cons?: string[];
  bestFor?: string;
  alternatives?: {
    name: string;
    reason: string;
  }[];
}

// List available models from Groq API
export const listAvailableModels = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${GROQ_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      let errorMessage = `Groq API error (${response.status}): ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('Groq API error details:', errorData);
        errorMessage = `Groq API error (${response.status}): ${errorData.error?.message || response.statusText}`;
      } catch (e) {
        const errorText = await response.text();
        console.error('Failed to parse error response:', errorText);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    const models = data.data?.map((model: any) => model.id) || [];
    console.log('Available Groq models:', models);
    return models;
  } catch (error) {
    console.error('Error fetching available models:', error);
    // Return default models if API call fails
    return Object.values(GROQ_MODELS);
  }
};

export const analyzeDeliveryService = async (
  service: any,
  modelKey: GroqModel = 'LLAMA3_70B'
): Promise<AnalysisResult> => {
  const model = GROQ_MODELS[modelKey];
  
  try {
    const prompt = `Analyze the following delivery service with a focus on health impact and provide a comprehensive analysis with the exact format specified below.
    
    Service: ${service.product_name || 'Delivery Service'}
    Platform: ${service.platform || 'Unknown'}
    Delivery Time: ${service.deliveryTime || 'N/A'} minutes
    Delivery Fee: ${service.cost_inr || 0} INR
    Rating: ${service.rating || 'N/A'}/5
    Features: ${service.features?.join(', ') || 'N/A'}
    
    Please analyze the following aspects with special attention to health impact:
    1. Delivery speed and reliability
    2. Cost-effectiveness and value for money
    3. Service quality and customer satisfaction
    4. Health and safety standards
    5. Environmental impact and sustainability
    6. Worker conditions and fair labor practices
    7. Nutritional information (if applicable)
    8. Any health-related certifications or initiatives
    
    Provide a detailed analysis with the following structure:
    - Overall sentiment and score (1-100)
    - Health impact assessment (scores 1-5 for various health aspects)
    - Key features with individual scores and sentiment
    - Summary of the service with health considerations
    - Health-conscious recommendation
    - Health-related pros and cons
    - Best use cases from a health perspective
    - Healthier alternative options if applicable
    
    Format your response as a JSON object with this exact structure:
    {
      "overallSentiment": "positive|neutral|negative",
      "overallScore": 85,
      "healthScores": {
        "foodSafety": 1-5,
        "nutritionalValue": 1-5,
        "ingredientQuality": 1-5,
        "preparationMethods": 1-5,
        "environmentalImpact": 1-5,
        "workerWelfare": 1-5
      },
      "summary": "Detailed summary of the service with health considerations...",
      "recommendation": "Highly Recommended/Recommended/Not Recommended from a health perspective",
      "features": [
        {
          "name": "Feature Name",
          "description": "Description of the feature",
          "sentiment": "positive|neutral|negative",
          "score": 0-100,
          "category": "Category Name",
          "healthImpact": "Brief health impact assessment"
          "score": 85,
          "explanation": "Detailed explanation of the rating"
        },
        {
          "name": "Reliability",
          "description": "Analysis of service consistency",
          "sentiment": "positive|neutral|negative",
          "score": 88,
          "explanation": "Detailed explanation of the rating"
        }
      ],
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2"],
      "bestFor": "Ideal use cases for this service",
      "alternatives": [
        {
          "name": "Alternative Service",
          "reason": "Why consider this alternative"
        }
      ]
    }`;

    if (!GROQ_API_KEY) {
      throw new Error('Groq API key is not configured. Please set VITE_GROQ_API_KEY in your .env file');
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an expert in analyzing and comparing delivery services. Provide detailed, structured responses in JSON format with accurate analysis of delivery services.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    console.log('Sending request to Groq API with model:', model);
    console.log('Messages:', JSON.stringify(messages, null, 2));

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const text = await response.text();
        throw new Error(`Groq API error (${response.status}): ${response.statusText}\n${text}`);
      }
      console.error('Groq API error details:', errorData);
      throw new Error(`Groq API error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in Groq API response');
    }

    let result;
    try {
      // Try to parse the JSON content
      result = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Ensure all required fields have default values
      result.features = result.features || [];
      result.pros = result.pros || [];
      result.cons = result.cons || [];
      result.summary = result.summary || 'No summary available';
      result.recommendation = result.recommendation || 'No recommendation';
      result.bestFor = result.bestFor || 'General use';
      result.alternatives = result.alternatives || [];
      
      // Ensure features have all required fields
      result.features = result.features.map((feature: any) => ({
        name: feature.name || 'Unnamed Feature',
        description: feature.description || '',
        sentiment: feature.sentiment || 'neutral',
        score: Math.min(100, Math.max(0, feature.score || 50)),
        explanation: feature.explanation || 'No explanation provided'
      }));
      
    } catch (e) {
      console.error('Failed to parse Groq response as JSON:', content);
      throw new Error('Invalid JSON response from Groq API');
    }

    return result as AnalysisResult;
  } catch (error) {
    console.error('Error analyzing delivery service with Groq:', error);
    // Return a fallback analysis if the API call fails
    return {
      overallSentiment: 'neutral',
      overallScore: 50,
      summary: 'Analysis unavailable. Please try again later.',
      recommendation: 'Not Available',
      features: [
        {
          name: 'Service Availability',
          description: 'Unable to analyze service at this time',
          sentiment: 'neutral',
          score: 50,
          explanation: 'Analysis service is currently unavailable'
        }
      ],
      pros: [],
      cons: ['Analysis service unavailable'],
      bestFor: 'General use',
      alternatives: []
    };
  }
};
