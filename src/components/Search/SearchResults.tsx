import React from 'react';
import { AlertCircle, Filter, Lightbulb } from 'lucide-react';

interface SearchResultsProps {
  resultCount: number;
  totalCount: number;
  hasActiveSearch: boolean;
  searchTerm: string;
  selectedCount?: number;
  suggestedActions?: Array<{
    action: string;
    label: string;
    icon: string;
    description: string;
  }>;
  onSuggestedAction?: (action: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  resultCount,
  totalCount,
  hasActiveSearch,
  searchTerm,
  selectedCount = 0,
  suggestedActions = [],
  onSuggestedAction
}) => {
  if (!hasActiveSearch) {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Showing all {totalCount} assets
          {selectedCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
              {selectedCount} selected
            </span>
          )}
        </div>
      </div>
    );
  }

  if (resultCount === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
        <p className="text-gray-500 mb-4">
          No assets match your search for "{searchTerm}"
        </p>
        <div className="text-sm text-gray-600">
          <p className="mb-2">Try:</p>
          <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
            <li>Checking your spelling</li>
            <li>Using different keywords</li>
            <li>Searching by equipment type (e.g., "pumps")</li>
            <li>Searching by location (e.g., "Plant A")</li>
            <li>Using natural language (e.g., "maintenance due")</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Showing {resultCount} of {totalCount} assets
            {searchTerm && (
              <span className="ml-1">
                for "<span className="font-medium text-gray-900">{searchTerm}</span>"
              </span>
            )}
          </span>
          {selectedCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
              {selectedCount} selected
            </span>
          )}
        </div>
      </div>

      {/* Suggested Actions */}
      {suggestedActions.length > 0 && selectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Suggested actions for your selection
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestedActions.map((action) => (
                  <button
                    key={action.action}
                    onClick={() => onSuggestedAction?.(action.action)}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    title={action.description}
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;