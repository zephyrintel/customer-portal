export interface SearchSuggestion {
  id: string;
  type: 'chip' | 'recent' | 'pattern';
  label: string;
  searchTerm: string;
  icon?: string;
  description?: string;
}

export interface SearchFilters {
  equipmentType?: string;
  location?: string;
  maintenanceDue?: boolean;
  critical?: boolean;
  installYear?: number;
  status?: string;
}

export interface ParsedSearch {
  originalTerm: string;
  cleanedTerm: string;
  filters: SearchFilters;
  hasNaturalLanguage: boolean;
}