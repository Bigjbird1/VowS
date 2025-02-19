"use client";

import { useSearch } from '@/contexts/search';
import { ProductFilters } from '@/types/product';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type PriceRange = {
  min: number | undefined;
  max: number | undefined;
  label: string;
};

type AvailabilityOption = {
  value: 'all' | 'in_stock' | 'out_of_stock';
  label: string;
};

const PRICE_RANGES: PriceRange[] = [
  { min: 0, max: 50, label: 'Under $50' },
  { min: 50, max: 100, label: '$50 - $100' },
  { min: 100, max: 250, label: '$100 - $250' },
  { min: 250, max: 500, label: '$250 - $500' },
  { min: 500, max: 1000, label: '$500 - $1000' },
  { min: 1000, max: undefined, label: 'Over $1000' },
];

const RATING_OPTIONS = [
  { value: 4, label: '4+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 2, label: '2+ Stars' },
];

const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  { value: 'all', label: 'All Items' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

type CustomPriceRange = {
  min: string | number;
  max: string | number;
};

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilters } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [customPriceRange, setCustomPriceRange] = useState<CustomPriceRange>({
    min: filters.minPrice || '',
    max: filters.maxPrice || '',
  });

  // Load filters from URL on mount
  useEffect(() => {
    const filtersParam = searchParams?.get('filters');
    if (filtersParam) {
      try {
        const parsedFilters = JSON.parse(filtersParam) as ProductFilters;
        setFilters(parsedFilters);
        if (parsedFilters.minPrice || parsedFilters.maxPrice) {
          setCustomPriceRange({
            min: parsedFilters.minPrice || '',
            max: parsedFilters.maxPrice || '',
          });
        }
      } catch (error) {
        console.error('Error parsing filters from URL:', error);
      }
    }
  }, [searchParams, setFilters]);

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL
    const params = new URLSearchParams(searchParams?.toString());
    params.set('filters', JSON.stringify(updatedFilters));
    router.push(`?${params.toString()}`);
  };

  const handlePriceRangeSelect = (min: number | undefined, max: number | undefined) => {
    updateFilters({
      minPrice: min,
      maxPrice: max,
    });
    setCustomPriceRange({ min: min || '', max: max || '' });
  };

  const handleCustomPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const min = customPriceRange.min ? Number(customPriceRange.min) : undefined;
    const max = customPriceRange.max ? Number(customPriceRange.max) : undefined;
    handlePriceRangeSelect(min, max);
  };

  const clearAllFilters = () => {
    setFilters({});
    setCustomPriceRange({ min: '', max: '' });
    const params = new URLSearchParams(searchParams?.toString());
    params.delete('filters');
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        className="md:hidden fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <svg className="w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Filters
      </button>

      {/* Filter Sidebar */}
      <div className={`
        fixed md:sticky top-0 right-0 md:right-auto h-full md:h-auto w-full md:w-64
        bg-white md:bg-transparent transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        overflow-y-auto md:overflow-visible z-50 md:z-0
      `}>
        <div className="p-4 md:p-0">
          {/* Mobile Header */}
          <div className="flex justify-between items-center mb-4 md:hidden">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Clear Filters */}
          {Object.keys(filters).length > 0 && (
            <button
              onClick={clearAllFilters}
              className="mb-4 text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          )}

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Price Range</h3>
            <div className="space-y-2">
              {PRICE_RANGES.map(({ min, max, label }) => (
                <label key={label} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.minPrice === min && filters.maxPrice === max}
                    onChange={() => handlePriceRangeSelect(min, max)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>

            {/* Custom Price Range */}
            <form onSubmit={handleCustomPriceSubmit} className="mt-2 space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customPriceRange.min}
                  onChange={(e) => setCustomPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  placeholder="Min"
                  className="w-full px-2 py-1 text-sm border rounded"
                />
                <input
                  type="number"
                  value={customPriceRange.max}
                  onChange={(e) => setCustomPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  placeholder="Max"
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <button
                type="submit"
                className="w-full px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Apply Price Range
              </button>
            </form>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Rating</h3>
            <div className="space-y-2">
              {RATING_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === value}
                    onChange={() => updateFilters({ minRating: value })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Availability</h3>
            <div className="space-y-2">
              {AVAILABILITY_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    name="availability"
                    checked={filters.availability === value}
                    onChange={() => updateFilters({ availability: value })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.freeShippingOnly}
                onChange={(e) => updateFilters({ freeShippingOnly: e.target.checked })}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Free Shipping</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.onSaleOnly}
                onChange={(e) => updateFilters({ onSaleOnly: e.target.checked })}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">On Sale</span>
            </label>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
