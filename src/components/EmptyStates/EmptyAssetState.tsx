import React from 'react';
import { Plus, Upload, Search } from 'lucide-react';

interface EmptyAssetStateProps {
  type: 'no-assets' | 'no-search-results';
  searchTerm?: string;
  onAddAsset?: () => void;
  onImportAssets?: () => void;
  onClearSearch?: () => void;
}

const EmptyAssetState: React.FC<EmptyAssetStateProps> = ({
  type,
  searchTerm,
  onAddAsset,
  onImportAssets,
  onClearSearch
}) => {
  if (type === 'no-search-results') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No assets found
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {searchTerm 
            ? `No assets match your search for "${searchTerm}". Try adjusting your search terms or filters.`
            : 'No assets match your current filters.'
          }
        </p>
        
        <div className="space-y-3">
          <div className="text-sm text-gray-500 mb-4">
            <p className="font-medium mb-2">Search suggestions:</p>
            <ul className="space-y-1">
              <li>• Try "pumps in Plant A" for location-specific searches</li>
              <li>• Use "maintenance due" to find assets needing attention</li>
              <li>• Search by equipment type like "compressors" or "valves"</li>
            </ul>
          </div>
          
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Plus className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        No assets yet
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Get started by adding your first industrial asset to begin tracking maintenance, parts, and documentation.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onAddAsset && (
          <button
            onClick={onAddAsset}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Asset
          </button>
        )}
        
        {onImportAssets && (
          <button
            onClick={onImportAssets}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import Assets
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyAssetState;