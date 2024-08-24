export type Variation = {
  size?: string;
  'paper size'?: string;
  price: number;
};

export type Category = {
  id: number;
  uuid: string;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  uuid: string;
  variations: Variation[];
  created_at: Date;
  updated_at: Date;
  categories: Category[];
};