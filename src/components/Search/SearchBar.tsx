import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Command } from 'lucide-react';
import { SearchSuggestion } from '../../types/Search';
import SearchSuggestions from './SearchSuggestions';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  suggestions: SearchSuggestion[];
  isSearching: boolean;
  placeholder?: string;
  selectedCount?: number;
  onFocus?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  clearSearch,
  suggestions,
  isSearching,
  placeholder = "Search assets... Try 'pumps in Plant A' or 'maintenance due'",
  selectedCount = 0,
  onFocus
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setFocusedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Expose focus method for keyboard shortcuts
  useEffect(() => {
    if (inputRef.current) {
      (inputRef.current as any).focusSearch = () => {
        inputRef.current?.focus();
        inputRef.current?.select();
      };
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    setFocusedSuggestionIndex(-1);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
    onFocus?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[focusedSuggestionIndex]);
        } else if (searchTerm.trim()) {
          setShowSuggestions(false);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.searchTerm);
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    clearSearch();
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 transition-colors duration-200 ${
            isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'
          }`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-12 pr-20 py-4 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
          autoComplete="off"
          spellCheck="false"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-4">
          {selectedCount > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
              <span>{selectedCount} selected</span>
            </div>
          )}
          
          {searchTerm && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-400">
            <Command className="h-3 w-3" />
            <span>F</span>
          </div>
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <SearchSuggestions
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          focusedIndex={focusedSuggestionIndex}
        />
      )}
    </div>
  );
};

export default SearchBar;