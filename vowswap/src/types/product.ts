export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'best_selling'
  | 'rating'
  | 'recently_added';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  freeShippingOnly?: boolean;
  onSaleOnly?: boolean;
  minRating?: number;
  availability?: 'in_stock' | 'out_of_stock' | 'all';
  sortBy?: SortOption;
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'tag';
  text: string;
  count: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  isOnSale: boolean;
  images: string[];
  category: string;
  subcategory: string | null;
  condition: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  inventory: number;
  freeShipping: boolean;
  sellerId: string;
  status: ProductStatus;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
  isVisible?: boolean;
  viewCount?: number;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  isOnSale?: boolean;
  images: string[];
  category: string;
  subcategory?: string;  // Changed from string | null to just string
  condition: string;
  tags?: string[];
  inventory: number;
  freeShipping?: boolean;
  status: ProductStatus;
  isVisible?: boolean;
}

export interface ProductUpdateInput {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  isOnSale?: boolean;
  images?: string[];
  category?: string;
  subcategory?: string;  // Changed from string | null to just string
  condition?: string;
  tags?: string[];
  inventory?: number;
  freeShipping?: boolean;
  status?: ProductStatus;
  isVisible?: boolean;
}

export interface SearchAnalytics {
  query: string;
  filters?: ProductFilters;
  sorting?: SortOption;
  resultCount: number;
  clickedProductId?: string;
}

export interface ProductStats {
  viewCount: number;
  salesCount: number;
  rating: number;
  reviewCount: number;
}
