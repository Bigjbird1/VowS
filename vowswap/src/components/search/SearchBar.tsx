"use client";

import { useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearch } from '@/contexts/search';
import { useDebounce } from '@/hooks/useDebounce';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { SearchSuggestion } from '@/types/product';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    query,
    setQuery,
    isLoading,
    setIsLoading,
    error,
    setError,
    searchHistory,
    addToSearchHistory,
  } = useSearch();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useOnClickOutside(searchRef, () => setShowSuggestions(false));

  // Initialize search query from URL
  useEffect(() => {
    const urlQuery = searchParams?.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, [searchParams, setQuery]);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data = await response.json();
        setSuggestions(data.suggestions);
        setError(null);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, setError, setIsLoading]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Update URL with search query
    const params = new URLSearchParams(searchParams?.toString());
    params.set('q', searchQuery.trim());
    router.push(`/products?${params.toString()}`);

    // Add to search history
    addToSearchHistory(searchQuery.trim());
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const renderSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
      case 'category':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      case 'tag':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for wedding items..."
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => handleSearch(query)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length > 1 || searchHistory.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <ul className="max-h-96 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  onClick={() => handleSearch(suggestion.text)}
                >
                  {renderSuggestionIcon(suggestion.type)}
                  <span className="flex-1">{suggestion.text}</span>
                  <span className="text-sm text-gray-400">({suggestion.count})</span>
                </li>
              ))}
              {suggestions.length === 0 && searchHistory.length > 0 && (
                <>
                  <li className="px-4 py-2 text-sm text-gray-500">Recent Searches</li>
                  {searchHistory.map((historyItem, index) => (
                    <li
                      key={`history-${index}`}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      onClick={() => handleSearch(historyItem)}
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{historyItem}</span>
                    </li>
                  ))}
                </>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
