"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ProductFilters } from '@/types/product';

interface SearchContextType {
  query: string;
  filters: ProductFilters;
  setQuery: (query: string) => void;
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  searchHistory: string[];
  setSearchHistory: (history: string[]) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const addToSearchHistory = useCallback((newQuery: string) => {
    setSearchHistory(prev => {
      // Remove the query if it already exists
      const filtered = prev.filter(q => q !== newQuery);
      // Add the new query to the beginning and limit to 10 items
      return [newQuery, ...filtered].slice(0, 10);
    });

    // Save to API
    fetch('/api/search/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: newQuery }),
    }).catch(console.error);
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    // Clear from API
    fetch('/api/search/history', {
      method: 'DELETE',
    }).catch(console.error);
  }, []);

  // Load search history on mount
  useEffect(() => {
    fetch('/api/search/history')
      .then(res => res.json())
      .then(data => setSearchHistory(data.searches))
      .catch(console.error);
  }, []); // Empty dependency array means this runs once on mount

  const value = {
    query,
    filters,
    setQuery,
    setFilters,
    clearFilters,
    isLoading,
    setIsLoading,
    error,
    setError,
    searchHistory,
    setSearchHistory,
    addToSearchHistory,
    clearSearchHistory,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
