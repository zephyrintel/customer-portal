import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Asset } from '../types/Asset';
import { SearchSuggestion, SearchFilters, ParsedSearch } from '../types/Search';
import { getMockOrders } from '../data/mockData';
import { hasMaintenanceDue } from '../utils/maintenanceUtils';

const RECENT_SEARCHES_KEY = 'asset-search-recent';
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 300;

export const useAssetSearch = (assets: Asset[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTermState] = useState(searchParams.get('search') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  // Handle special filter parameter for no parts activity
  const filterParam = searchParams.get('filter');

  // Debounce search term
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update URL when search term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }
    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, searchParams, setSearchParams]);

  // Recent searches management
  const getRecentSearches = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const addRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    
    try {
      const recent = getRecentSearches();
      const updated = [term, ...recent.filter(s => s !== term)].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  }, [getRecentSearches]);

  // Parse natural language search
  const parseSearchTerm = useCallback((term: string): ParsedSearch => {
    const lowerTerm = term.toLowerCase().trim();
    const filters: SearchFilters = {};
    let cleanedTerm = term;
    let hasNaturalLanguage = false;

    // Equipment type patterns
    const equipmentPatterns = [
      { pattern: /\b(pumps?)\b/i, type: 'Pump' },
      { pattern: /\b(compressors?)\b/i, type: 'Compressor' },
      { pattern: /\b(valves?)\b/i, type: 'Valve' },
      { pattern: /\b(motors?)\b/i, type: 'Motor' },
      { pattern: /\b(heat\s+exchangers?)\b/i, type: 'Heat Exchanger' },
      { pattern: /\b(tanks?)\b/i, type: 'Tank' }
    ];

    for (const { pattern, type } of equipmentPatterns) {
      if (pattern.test(lowerTerm)) {
        filters.equipmentType = type;
        cleanedTerm = cleanedTerm.replace(pattern, '').trim();
        hasNaturalLanguage = true;
      }
    }

    // Location patterns
    const locationPatterns = [
      /\bin\s+(plant\s+[a-z]|building\s+[a-z]|facility\s+[a-z])/i,
      /\bat\s+(plant\s+[a-z]|building\s+[a-z]|facility\s+[a-z])/i,
      /\b(plant\s+[a-z]|building\s+[a-z]|facility\s+[a-z])\b/i
    ];

    for (const pattern of locationPatterns) {
      const match = lowerTerm.match(pattern);
      if (match) {
        filters.location = match[1] || match[0];
        cleanedTerm = cleanedTerm.replace(pattern, '').trim();
        hasNaturalLanguage = true;
      }
    }

    // Maintenance patterns
    if (/\b(maintenance\s+due|due\s+for\s+maintenance|overdue)\b/i.test(lowerTerm)) {
      filters.maintenanceDue = true;
      cleanedTerm = cleanedTerm.replace(/\b(maintenance\s+due|due\s+for\s+maintenance|overdue)\b/i, '').trim();
      hasNaturalLanguage = true;
    }

    // Critical assets pattern
    if (/\b(critical\s+assets?|high\s+priority)\b/i.test(lowerTerm)) {
      filters.critical = true;
      cleanedTerm = cleanedTerm.replace(/\b(critical\s+assets?|high\s+priority)\b/i, '').trim();
      hasNaturalLanguage = true;
    }

    // Installation year pattern
    const yearMatch = lowerTerm.match(/\b(installed\s+)?(\d{4})\b/);
    if (yearMatch && parseInt(yearMatch[2]) >= 2000 && parseInt(yearMatch[2]) <= new Date().getFullYear()) {
      filters.installYear = parseInt(yearMatch[2]);
      cleanedTerm = cleanedTerm.replace(/\b(installed\s+)?\d{4}\b/i, '').trim();
      hasNaturalLanguage = true;
    }

    // Enhanced OR logic for status searches - handle multiple OR conditions
    const orKeywordPattern = /\bor\b/i;
    if (orKeywordPattern.test(lowerTerm)) {
      // Split by OR and extract status terms
      const orParts = lowerTerm.split(/\s+or\s+/i);
      const statusTerms = [];
      
      for (const part of orParts) {
        const trimmedPart = part.trim();
        
        // Map search terms to actual status values
        if (/\b(not\s+in\s+use|offline|shutdown)\b/i.test(trimmedPart)) {
          statusTerms.push('Not In Use');
        } else if (/\b(not\s+commissioned|new)\b/i.test(trimmedPart)) {
          statusTerms.push('Not Commissioned');
        } else if (/\b(unknown\s+status|status\s+unknown|unknown)\b/i.test(trimmedPart)) {
          statusTerms.push('Unknown');
        } else if (/\b(in\s+operation|operating|running)\b/i.test(trimmedPart)) {
          statusTerms.push('In Operation');
        } else if (/\b(intermittent|partial)\b/i.test(trimmedPart)) {
          statusTerms.push('Intermittent Operation');
        }
      }
      
      if (statusTerms.length > 0) {
        // Remove duplicates
        filters.statusOr = [...new Set(statusTerms)];
        // Remove the entire OR expression from cleaned term
        cleanedTerm = cleanedTerm.replace(/\b(not\s+in\s+use|not\s+commissioned|unknown|in\s+operation|intermittent|operating|running|offline|shutdown|new)\s*(or\s*(not\s+in\s+use|not\s+commissioned|unknown|in\s+operation|intermittent|operating|running|offline|shutdown|new)\s*)*/gi, '').trim();
        hasNaturalLanguage = true;
      }
    } else {
      // Single status patterns (fallback for non-OR searches)
      const statusPatterns = [
        { pattern: /\b(in\s+operation|operating|running)\b/i, status: 'In Operation' },
        { pattern: /\b(not\s+in\s+use|offline|shutdown)\b/i, status: 'Not In Use' },
        { pattern: /\b(not\s+commissioned|new)\b/i, status: 'Not Commissioned' },
        { pattern: /\b(intermittent|partial)\b/i, status: 'Intermittent Operation' },
        { pattern: /\b(unknown\s+status|status\s+unknown|unknown)\b/i, status: 'Unknown' }
      ];

      for (const { pattern, status } of statusPatterns) {
        if (pattern.test(lowerTerm)) {
          filters.status = status;
          cleanedTerm = cleanedTerm.replace(pattern, '').trim();
          hasNaturalLanguage = true;
          break; // Only match first status pattern
        }
      }
    }

    // Clean up extra whitespace
    cleanedTerm = cleanedTerm.replace(/\s+/g, ' ').trim();

    return {
      originalTerm: term,
      cleanedTerm,
      filters,
      hasNaturalLanguage
    };
  }, []);

  // Check if asset has maintenance due
  const hasAssetMaintenanceDue = useCallback((asset: Asset): boolean => {
    return hasMaintenanceDue(asset);
  }, []);

  // Check if asset has absolutely no parts activity (reverted to original logic)
  const hasNoPartsActivity = useCallback((asset: Asset): boolean => {
    const mockOrders = getMockOrders();
    // Must have wear components to be considered for parts activity
    const hasWearComponents = asset.wearComponents.length > 0;
    if (!hasWearComponents) return false;
    
    // Check if any wear components have been replaced
    const hasReplacements = asset.wearComponents.some(component => component.lastReplaced);
    
    // Check if asset has any orders
    const hasOrders = mockOrders.some(order => order.assetId === asset.id);
    
    // Asset has no parts activity if it has wear components but no replacements or orders
    return !hasReplacements && !hasOrders;
  }, []);

  // Filter assets based on parsed search and special filters
  const filteredAssets = useMemo(() => {
    let result = assets;

    // Apply special filter parameter first
    if (filterParam === 'no-parts-activity') {
      result = result.filter(hasNoPartsActivity);
    }

    // If no search term, return filtered result
    if (!debouncedSearchTerm) return result;

    const parsed = parseSearchTerm(debouncedSearchTerm);
    
    return result.filter(asset => {
      // Apply natural language filters
      if (parsed.filters.equipmentType && asset.equipmentType !== parsed.filters.equipmentType) {
        return false;
      }
      
      if (parsed.filters.location) {
        const locationMatch = 
          asset.location.facility.toLowerCase().includes(parsed.filters.location.toLowerCase()) ||
          asset.location.area.toLowerCase().includes(parsed.filters.location.toLowerCase());
        if (!locationMatch) return false;
      }
      
      if (parsed.filters.maintenanceDue && !hasMaintenanceDue(asset)) {
        return false;
      }
      
      if (parsed.filters.critical && !['Critical', 'High'].includes(asset.criticalityLevel)) {
        return false;
      }
      
      if (parsed.filters.installYear && asset.installDate) {
        const installYear = new Date(asset.installDate).getFullYear();
        if (installYear !== parsed.filters.installYear) return false;
      }
      
      // Handle OR logic for status (prioritize OR over single status)
      if (parsed.filters.statusOr && parsed.filters.statusOr.length > 0) {
        if (!parsed.filters.statusOr.includes(asset.currentStatus)) return false;
      } else if (parsed.filters.status && asset.currentStatus !== parsed.filters.status) {
        return false;
      }

      // Apply text search to cleaned term
      if (parsed.cleanedTerm) {
        const searchFields = [
          asset.name,
          asset.serialNumber,
          asset.brand,
          asset.modelCode,
          asset.location.facility,
          asset.location.area
        ].map(field => field.toLowerCase());
        
        const searchTerms = parsed.cleanedTerm.toLowerCase().split(' ').filter(term => term.length > 0);
        
        return searchTerms.every(term =>
          searchFields.some(field => field.includes(term))
        );
      }

      return true;
    });
  }, [assets, debouncedSearchTerm, filterParam, parseSearchTerm, hasNoPartsActivity]);

  // Generate search suggestions
  const suggestions = useMemo((): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    const lowerTerm = debouncedSearchTerm.toLowerCase();

    // Only show recent searches when no search term is entered
    if (!debouncedSearchTerm) {
      const recentSearches = getRecentSearches();
      suggestions.push(...recentSearches.map(search => ({
        id: `recent-${search}`,
        type: 'recent' as const,
        label: search,
        searchTerm: search,
        icon: '🕒'
      })));
    }

    // Pattern suggestions based on current input (only when user is typing)
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
      const parsed = parseSearchTerm(debouncedSearchTerm);
      
      if (!parsed.hasNaturalLanguage) {
        // Suggest natural language patterns
        if (lowerTerm.includes('pump')) {
          suggestions.push({
            id: 'pattern-pumps-location',
            type: 'pattern',
            label: 'Try: "pumps in Plant A"',
            searchTerm: 'pumps in Plant A',
            description: 'Search for equipment by type and location'
          });
        }
        
        if (lowerTerm.includes('maintenance') || lowerTerm.includes('due')) {
          suggestions.push({
            id: 'pattern-maintenance',
            type: 'pattern',
            label: 'Try: "maintenance due"',
            searchTerm: 'maintenance due',
            description: 'Find assets with upcoming maintenance'
          });
        }

        if (lowerTerm.includes('not') || lowerTerm.includes('status') || lowerTerm.includes('unknown')) {
          suggestions.push({
            id: 'pattern-status-or',
            type: 'pattern',
            label: 'Try: "not in use OR unknown"',
            searchTerm: 'not in use OR unknown',
            description: 'Find assets with multiple status conditions'
          });
        }
      }
    }

    return suggestions.slice(0, 8); // Limit suggestions
  }, [debouncedSearchTerm, parseSearchTerm, getRecentSearches]);

  // Set search term with recent search tracking
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    if (term.trim()) {
      addRecentSearch(term.trim());
    }
  }, [addRecentSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    // Also clear any filter parameters
    const params = new URLSearchParams(searchParams);
    params.delete('filter');
    setSearchParams(params, { replace: true });
  }, [setSearchTerm, searchParams, setSearchParams]);

  // Get suggested bulk actions based on search
  const getSuggestedBulkActions = useCallback(() => {
    const suggestions = [];
    
    if (filterParam === 'no-parts-activity') {
      suggestions.push({
        action: 'order-parts',
        label: 'Order Parts',
        icon: '📦',
        description: 'Order parts for assets with no parts history'
      });
    }
    
    if (debouncedSearchTerm) {
      const parsed = parseSearchTerm(debouncedSearchTerm);
      
      if (parsed.filters.maintenanceDue) {
        suggestions.push({
          action: 'schedule-maintenance',
          label: 'Schedule Maintenance',
          icon: '📅',
          description: 'Schedule maintenance for assets with upcoming due dates'
        });
      }
      
      if (parsed.filters.critical) {
        suggestions.push({
          action: 'order-parts',
          label: 'Order Critical Parts',
          icon: '📦',
          description: 'Order parts for critical assets'
        });
      }

      if (parsed.filters.statusOr || parsed.filters.status === 'Not In Use' || parsed.filters.status === 'Not Commissioned' || parsed.filters.status === 'Unknown') {
        suggestions.push({
          action: 'update-status',
          label: 'Update Status',
          icon: '🔄',
          description: 'Update equipment status for selected assets'
        });
      }
    }
    
    return suggestions;
  }, [debouncedSearchTerm, filterParam, parseSearchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    filteredAssets,
    suggestions,
    isSearching,
    resultCount: filteredAssets.length,
    totalCount: assets.length,
    hasActiveSearch: !!debouncedSearchTerm || !!filterParam,
    getSuggestedBulkActions,
    parseSearchTerm: (term: string) => parseSearchTerm(term)
  };
};