"use client";

import { useSearch } from '@/contexts/search';
import { SortOption } from '@/types/product';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'recently_added', label: 'Recently Added' },
];

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilters } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const currentSort = filters.sortBy || 'relevance';
  const currentLabel = SORT_OPTIONS.find(option => option.value === currentSort)?.label || 'Sort By';

  const handleSort = (sortOption: SortOption) => {
    const updatedFilters = { ...filters, sortBy: sortOption };
    setFilters(updatedFilters);

    // Update URL
    const params = new URLSearchParams(searchParams?.toString());
    params.set('filters', JSON.stringify(updatedFilters));
    router.push(`?${params.toString()}`);

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span>{currentLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
          <ul className="py-1">
            {SORT_OPTIONS.map(({ value, label }) => (
              <li key={value}>
                <button
                  onClick={() => handleSort(value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    currentSort === value ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
