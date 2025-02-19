"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProductFilters, SortOption } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

interface FilterSidebarProps {
  facets: {
    categories: Array<{ name: string; count: number }>;
    subcategories: Array<{ name: string; count: number }>;
    conditions: Array<{ name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
  onFiltersChange: (filters: ProductFilters) => void;
}

interface CustomPriceRange {
  min: string | number;
  max: string | number;
}

export default function FilterSidebar({ facets, onFiltersChange }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const [customPriceRange, setCustomPriceRange] = useState<CustomPriceRange>({
    min: filters.minPrice || '',
    max: filters.maxPrice || '',
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    onFiltersChange(filters);
    updateURL();
  }, [filters]);

  const updateURL = () => {
    const params = new URLSearchParams(searchParams?.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? undefined : category,
      subcategory: undefined, // Reset subcategory when category changes
    }));
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setFilters(prev => ({
      ...prev,
      subcategory: prev.subcategory === subcategory ? undefined : subcategory,
    }));
  };

  const handleConditionChange = (condition: string) => {
    setFilters(prev => ({
      ...prev,
      condition: prev.condition === condition ? undefined : condition,
    }));
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };

  const handleCustomPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      minPrice: customPriceRange.min ? Number(customPriceRange.min) : undefined,
      maxPrice: customPriceRange.max ? Number(customPriceRange.max) : undefined,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag],
    }));
  };

  const clearAllFilters = () => {
    setFilters({});
    setCustomPriceRange({ min: '', max: '' });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  return (
    <>
      {/* Mobile filter dialog */}
      <div className="lg:hidden">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          onClick={() => setIsMobileFiltersOpen(true)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {getActiveFiltersCount() > 0 && (
            <span className="ml-1 text-blue-600">
              ({getActiveFiltersCount()})
            </span>
          )}
        </button>

        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileFiltersOpen(false)} />
            <div className="fixed inset-0 z-40 flex">
              <div className="relative flex flex-col w-full max-w-xs ml-auto h-full bg-white shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h2 className="text-lg font-medium">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={() => setIsMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Mobile filters */}
                <div className="flex-1 px-4 py-6 overflow-y-auto">
                  {/* Filter sections */}
                  <FilterContent
                    facets={facets}
                    filters={filters}
                    customPriceRange={customPriceRange}
                    setCustomPriceRange={setCustomPriceRange}
                    onCategoryChange={handleCategoryChange}
                    onSubcategoryChange={handleSubcategoryChange}
                    onConditionChange={handleConditionChange}
                    onPriceRangeChange={handlePriceRangeChange}
                    onCustomPriceSubmit={handleCustomPriceSubmit}
                    onTagToggle={handleTagToggle}
                    onFilterChange={setFilters}
                  />
                </div>

                {/* Mobile filter actions */}
                <div className="border-t border-gray-200 px-4 py-4">
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    onClick={() => setIsMobileFiltersOpen(false)}
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    className="w-full mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop filter sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-6">
          <div className="space-y-6">
            <FilterContent
              facets={facets}
              filters={filters}
              customPriceRange={customPriceRange}
              setCustomPriceRange={setCustomPriceRange}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={handleSubcategoryChange}
              onConditionChange={handleConditionChange}
              onPriceRangeChange={handlePriceRangeChange}
              onCustomPriceSubmit={handleCustomPriceSubmit}
              onTagToggle={handleTagToggle}
              onFilterChange={setFilters}
            />
            {getActiveFiltersCount() > 0 && (
              <button
                type="button"
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

interface FilterContentProps {
  facets: FilterSidebarProps['facets'];
  filters: ProductFilters;
  customPriceRange: CustomPriceRange;
  setCustomPriceRange: (range: CustomPriceRange) => void;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  onConditionChange: (condition: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onCustomPriceSubmit: (e: React.FormEvent) => void;
  onTagToggle: (tag: string) => void;
  onFilterChange: (filters: ProductFilters) => void;
}

function FilterContent({
  facets,
  filters,
  customPriceRange,
  setCustomPriceRange,
  onCategoryChange,
  onSubcategoryChange,
  onConditionChange,
  onPriceRangeChange,
  onCustomPriceSubmit,
  onTagToggle,
  onFilterChange,
}: FilterContentProps) {
  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-900">Categories</h3>
        <div className="mt-2 space-y-2">
          {facets.categories.map(({ name, count }) => (
            <label key={name} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.category === name}
                onChange={() => onCategoryChange(name)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {name} ({count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Subcategories (only show if category is selected) */}
      {filters.category && (
        <div>
          <h3 className="text-sm font-medium text-gray-900">Subcategories</h3>
          <div className="mt-2 space-y-2">
            {facets.subcategories
              .filter(sub => sub.count > 0)
              .map(({ name, count }) => (
                <label key={name} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.subcategory === name}
                    onChange={() => onSubcategoryChange(name)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {name} ({count})
                  </span>
                </label>
              ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
        <div className="mt-2 space-y-4">
          {facets.priceRanges.map(({ min, max, count }) => (
            <label key={`${min}-${max}`} className="flex items-center">
              <input
                type="radio"
                checked={filters.minPrice === min && filters.maxPrice === max}
                onChange={() => onPriceRangeChange(min, max)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {max === Infinity
                  ? `${formatCurrency(min)}+`
                  : `${formatCurrency(min)} - ${formatCurrency(max)}`}{' '}
                ({count})
              </span>
            </label>
          ))}
          <form onSubmit={onCustomPriceSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={customPriceRange.min}
                onChange={e => setCustomPriceRange({ ...customPriceRange, min: e.target.value })}
                placeholder="Min"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              />
              <input
                type="number"
                value={customPriceRange.max}
                onChange={e => setCustomPriceRange({ ...customPriceRange, max: e.target.value })}
                placeholder="Max"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Apply Custom Range
            </button>
          </form>
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 className="text-sm font-medium text-gray-900">Condition</h3>
        <div className="mt-2 space-y-2">
          {facets.conditions.map(({ name, count }) => (
            <label key={name} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.condition === name}
                onChange={() => onConditionChange(name)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {name} ({count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-sm font-medium text-gray-900">Tags</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {facets.tags.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => onTagToggle(name)}
              className={`px-3 py-1 text-sm rounded-full ${
                filters.tags?.includes(name)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {name} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Additional Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-900">Additional Filters</h3>
        <div className="mt-2 space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.freeShippingOnly}
              onChange={e =>
                onFilterChange({ ...filters, freeShippingOnly: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Free Shipping Only</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.onSaleOnly}
              onChange={e =>
                onFilterChange({ ...filters, onSaleOnly: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">On Sale Only</span>
          </label>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-medium text-gray-900">Availability</h3>
        <div className="mt-2 space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              checked={filters.availability === 'in_stock'}
              onChange={() =>
                onFilterChange({ ...filters, availability: 'in_stock' })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">In Stock</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={filters.availability === 'out_of_stock'}
              onChange={() =>
                onFilterChange({ ...filters, availability: 'out_of_stock' })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Out of Stock</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={filters.availability === 'all' || !filters.availability}
              onChange={() => onFilterChange({ ...filters, availability: 'all' })}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show All</span>
          </label>
        </div>
      </div>
    </div>
  );
}
