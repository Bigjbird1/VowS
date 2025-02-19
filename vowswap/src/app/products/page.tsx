'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import SearchBar from '@/components/search/SearchBar';
import FilterSidebar from '@/components/search/FilterSidebar';
import SortDropdown from '@/components/search/SortDropdown';
import { Product, ProductFilters, SortOption } from '@/types/product';

interface SearchResponse {
  products: Product[];
  pagination: {
    total: number;
    pages: number;
    current: number;
  };
  facets: {
    categories: Array<{ name: string; count: number }>;
    subcategories: Array<{ name: string; count: number }>;
    conditions: Array<{ name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams?.get('category') || undefined,
    subcategory: searchParams?.get('subcategory') || undefined,
    condition: searchParams?.get('condition') || undefined,
    minPrice: searchParams?.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams?.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    tags: searchParams?.get('tags')?.split(',') || undefined,
    freeShippingOnly: searchParams?.get('freeShippingOnly') === 'true',
    onSaleOnly: searchParams?.get('onSaleOnly') === 'true',
    minRating: searchParams?.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    availability: searchParams?.get('availability') as 'in_stock' | 'out_of_stock' | 'all' || undefined,
    sortBy: searchParams?.get('sortBy') as SortOption || undefined,
  });

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query string from filters
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              params.set(key, value.join(','));
            } else {
              params.set(key, String(value));
            }
          }
        });

        // Add search query if exists
        const query = searchParams?.get('q');
        if (query) {
          params.set('q', query);
        }

        // Add page number if exists
        const page = searchParams?.get('page');
        if (page) {
          params.set('page', page);
        }

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setSearchResponse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [filters, searchParams]);

  // If product ID is provided, show product detail view
  if (productId) {
    const product = searchResponse?.products.find((p) => p.id === productId);

    if (!product) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <Link href="/products" className="mt-4 text-blue-600 hover:text-blue-800">
            Back to products
          </Link>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl lg:max-w-7xl">
        <Link href="/products" className="inline-block mb-8 text-blue-600 hover:text-blue-800">
          ← Back to products
        </Link>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.isOnSale && product.salePrice && (
                  <span className="ml-2 text-sm text-red-600">
                    Sale: ${product.salePrice.toFixed(2)}
                  </span>
                )}
              </div>
              {product.freeShipping && (
                <span className="text-sm text-green-600">Free Shipping</span>
              )}
            </div>
            
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Category</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {product.subcategory ? `${product.category} > ${product.subcategory}` : product.category}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">Condition</h3>
                <p className="mt-1 text-sm text-gray-500">{product.condition}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <p className="mt-1 text-sm text-gray-500">{product.description}</p>
              </div>

              {product.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Tags</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              <button className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700">
                Add to Cart
              </button>
              <button className="rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show product listing view
  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Find Your Perfect Wedding Items
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Browse our curated collection of pre-loved wedding items
        </p>
        <div className="mt-8 max-w-xl mx-auto">
          <SearchBar />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters */}
        <FilterSidebar
          facets={searchResponse?.facets || {
            categories: [],
            subcategories: [],
            conditions: [],
            priceRanges: [],
            tags: [],
          }}
          onFiltersChange={setFilters}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {searchResponse
                ? `Showing ${searchResponse.products.length} of ${searchResponse.pagination.total} products`
                : 'Loading products...'}
            </p>
            <SortDropdown
              value={filters.sortBy}
              onChange={(sortBy) => setFilters({ ...filters, sortBy })}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          )}

          {/* Product Grid */}
          {!isLoading && !error && searchResponse && (
            <ProductGrid products={searchResponse.products} filters={filters} />
          )}

          {/* No Results */}
          {!isLoading && !error && searchResponse?.products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found matching your criteria.</p>
              <button
                onClick={() => setFilters({})}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
