import React from 'react';
import { Clock, Lightbulb } from 'lucide-react';
import { SearchSuggestion } from '../../types/Search';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSelect: (suggestion: SearchSuggestion) => void;
  focusedIndex: number;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect,
  focusedIndex
}) => {
  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.icon) {
      return <span className="text-lg mr-3">{suggestion.icon}</span>;
    }
    
    switch (suggestion.type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400 mr-3" />;
      case 'pattern':
        return <Lightbulb className="w-4 h-4 text-blue-500 mr-3" />;
      default:
        return null;
    }
  };

  const getSuggestionStyles = (suggestion: SearchSuggestion, index: number) => {
    const baseStyles = "flex items-center px-4 py-3 cursor-pointer transition-colors duration-150";
    const focusedStyles = index === focusedIndex ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50";
    
    switch (suggestion.type) {
      case 'chip':
        return `${baseStyles} ${focusedStyles} border-l-4 border-blue-500`;
      case 'recent':
        return `${baseStyles} ${focusedStyles} text-gray-600`;
      case 'pattern':
        return `${baseStyles} ${focusedStyles} bg-blue-50 text-blue-800 border-l-4 border-blue-300`;
      default:
        return `${baseStyles} ${focusedStyles}`;
    }
  };

  // Group suggestions by type
  const groupedSuggestions = suggestions.reduce((groups, suggestion, index) => {
    const type = suggestion.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push({ suggestion, originalIndex: index });
    return groups;
  }, {} as Record<string, Array<{ suggestion: SearchSuggestion; originalIndex: number }>>);

  const renderSuggestionGroup = (
    title: string,
    items: Array<{ suggestion: SearchSuggestion; originalIndex: number }>
  ) => (
    <div key={title}>
      {title && (
        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
          {title}
        </div>
      )}
      {items.map(({ suggestion, originalIndex }) => (
        <div
          key={suggestion.id}
          className={getSuggestionStyles(suggestion, originalIndex)}
          onClick={() => onSelect(suggestion)}
          role="option"
          aria-selected={originalIndex === focusedIndex}
        >
          {getSuggestionIcon(suggestion)}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {suggestion.label}
            </div>
            {suggestion.description && (
              <div className="text-xs text-gray-500 mt-1">
                {suggestion.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div role="listbox" aria-label="Search suggestions">
        {groupedSuggestions.chip && renderSuggestionGroup('', groupedSuggestions.chip)}
        {groupedSuggestions.recent && renderSuggestionGroup('Recent Searches', groupedSuggestions.recent)}
        {groupedSuggestions.pattern && renderSuggestionGroup('Suggestions', groupedSuggestions.pattern)}
      </div>
    </div>
  );
};

export default SearchSuggestions;