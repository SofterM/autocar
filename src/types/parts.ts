// src/types/parts.ts
export interface Part {
  id: number;
  code: string;
  name: string;
  category_id: number;
  category_name?: string;
  description?: string;
  price: number;
  cost: number;
  stock_quantity: number;
  minimum_quantity: number;
  location?: string;
  brand?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface PartsCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}