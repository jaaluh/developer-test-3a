export interface ProductData {
  name: string;
  categories: ProductApiCategory[];
  variations: ProductApiVariation[];
  id?: string;
  description?: string;
}

export interface ProductApiCategory {
  id?: string;
  name: string;
}

export interface ProductApiVariation {
  size?: string; 
  'paper size'?: string;
  price: number;
}

export interface ProductApiResponse {
  products: ProductData[];
  results: number;
}
