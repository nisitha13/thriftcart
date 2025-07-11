export interface Product {
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

export interface GroupedProduct {
  productName: string;
  platforms: Product[];
}

export interface ProductAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}
