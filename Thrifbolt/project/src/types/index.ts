export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface DeliveryApp {
  id: string;
  name: string;
  logo: string;
  deliveryTime: string;
  deliveryFee: number;
  rating: number;
  offers: string[];
  isAvailable: boolean;
}

export interface RideApp {
  id: string;
  name: string;
  logo: string;
  estimatedTime: string;
  estimatedFare: number;
  rating: number;
  vehicleType: string;
  isAvailable: boolean;
}

export interface EcommerceApp {
  id: string;
  name: string;
  logo: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  deliveryTime: string;
  inStock: boolean;
  rating: number;
  offers: string[];
  category: string; // <-- Add this line here
  products: string[]; // List of product IDs or names
}

export interface LocationData {
  pickup: string;
  destination: string;
  distance: number;
}