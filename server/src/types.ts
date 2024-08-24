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

//https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
export enum Language {
  en = 'en',
  fi = 'fi',
  sv = 'sv'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR'
}