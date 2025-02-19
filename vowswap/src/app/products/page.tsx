"use client";

import { useEffect, useState } from 'react';
import { useSearch } from '@/contexts/search';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types/product';
import ProductGrid from '@/components/ProductGrid';
import SearchBar from '@/components/search/SearchBar';
import FilterSidebar from '@/components/search/FilterSidebar';
import SortDropdown from '@/components/search/SortDropdown';

interface SearchResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
  };
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { filters, query } = useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);

  // Fetch search results when filters or query change
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (filters) params.set('filters', JSON.stringify(filters));
        
        const page = searchParams?.get('page') || '1';
        params.set('page', page);

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch search results');

        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [filters, query, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-xl">
              <SearchBar />
            </div>
            <div className="flex items-center gap-4">
              <SortDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                {query ? `Search results for "${query}"` : 'All Products'}
              </h1>
              {searchResults && (
                <p className="mt-1 text-sm text-gray-500">
                  {searchResults.pagination.totalItems} items found
                </p>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && !error && searchResults && (
              <>
                <ProductGrid products={searchResults.products} />

                {/* Pagination */}
                {searchResults.pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center gap-2">
                      {searchResults.pagination.hasPreviousPage && (
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(searchParams?.toString());
                            params.set('page', String(searchResults.pagination.currentPage - 1));
                            window.history.pushState({}, '', `?${params.toString()}`);
                          }}
                          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Previous
                        </button>
                      )}
                      <span className="text-sm text-gray-700">
                        Page {searchResults.pagination.currentPage} of {searchResults.pagination.totalPages}
                      </span>
                      {searchResults.pagination.hasNextPage && (
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(searchParams?.toString());
                            params.set('page', String(searchResults.pagination.currentPage + 1));
                            window.history.pushState({}, '', `?${params.toString()}`);
                          }}
                          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Next
                        </button>
                      )}
                    </nav>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!isLoading && !error && searchResults?.products.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
