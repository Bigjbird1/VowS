export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  inventory: number;
  status: ProductStatus;
  isVisible: boolean;
  viewCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProductFilters {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  inventory: number;
  status: ProductStatus;
}

export interface ProductUpdateInput {
  title?: string;
  description?: string;
  price?: number;
  images?: string[];
  category?: string;
  condition?: string;
  inventory?: number;
  status?: ProductStatus;
  isVisible?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    total: number;
    pages: number;
    current: number;
  };
}

export interface ProductFilterParams {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  page?: number;
  limit?: number;
  search?: string;
}
