import React from 'react';
import { Calendar } from 'lucide-react';
import { Asset } from '../../types/Asset';
import { BulkOperationState } from '../../hooks/useBulkOperations';

interface MaintenanceBulkActionBarProps {
  selectedCount: number;
  selectedAssets: Asset[];
  operationState: BulkOperationState;
  onClearSelection: () => void;
  onScheduleMaintenance: () => void;
}

const MaintenanceBulkActionBar: React.FC<MaintenanceBulkActionBarProps> = ({
  selectedCount,
  operationState,
  onClearSelection,
  onScheduleMaintenance
}) => {
  if (selectedCount === 0) return null;

  const isLoading = operationState.isLoading;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-out">
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Selection Info */}
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-900">
                {selectedCount} asset{selectedCount > 1 ? 's' : ''} selected
              </div>
              
              {operationState.isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">
                    Scheduling maintenance...
                  </span>
                  {operationState.progress > 0 && (
                    <span className="text-sm text-gray-500">
                      {operationState.progress}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onClearSelection}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>

              <button
                onClick={onScheduleMaintenance}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBulkActionBar;