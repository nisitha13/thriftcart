import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Send, Bot, X } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  parts: string;
}

const MODEL_NAME = 'gemini-1.5-pro-latest';
const API_KEY = 'AIzaSyDIk9YKmkEn6t59E2ZsgQwNiPKUG_X0juo';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: 'Hello! I\'m your ThrifCart assistant. I can help you with product comparisons, price trends, and shopping recommendations. What would you like to know? '
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = { role: 'user', parts: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      // Configure safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      // Create a system message to guide the AI's responses
      const systemMessage = {
        role: 'user',
        parts: [{
          text: `You are a helpful assistant for ThrifCart, a product comparison platform aswell as quick delivery comparison platform and ride sharing platform. 
          Only answer questions related to:
          - Product comparisons across different platforms (e.g., Amazon, Flipkart, Myntra)
          - Price trends and predictions
          - Shopping recommendations
          - Features of ThrifCart
          
          When asked about product prices, ALWAYS provide the current market price in Indian Rupees (₹) with the exact amount without asking for additional details.
          Example responses:
          - "The current price of iPhone 15 is ₹79,900 on average across major retailers."
          - "Samsung Galaxy S23 is priced around ₹84,999."
          - "You can find the latest MacBook Air for approximately ₹99,900."
          
          Never ask for more details - if the product isn't clear, make your best estimate based on available information.
          
          If a question is not related to ThrifCart or shopping, simply respond: "I can only assist with shopping and product-related queries. How can I help you with your shopping needs today?"
          
          User's question: ${input}`
        }]
      };

      // Generate content with safety settings
      const result = await model.generateContent({
        contents: [systemMessage],
        safetySettings
      });
      
      const response = await result.response;
      const text = response.text();
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'model', parts: text }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-lavender-600 hover:bg-lavender-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
        aria-label="Open chat"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-gray-800 rounded-xl shadow-xl flex flex-col" style={{ height: '600px' }}>
      <div className="bg-lavender-600 text-white p-4 rounded-t-xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <h3 className="font-semibold">ThrifCart Assistant</h3>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-lavender-600 text-white rounded-br-none' 
                  : 'bg-gray-700 text-gray-100 rounded-bl-none'
              }`}
            >
              {message.parts}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 p-3 rounded-lg rounded-bl-none max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lavender-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-lavender-600 hover:bg-lavender-700 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;
