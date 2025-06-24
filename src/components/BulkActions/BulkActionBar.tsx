import React, { useState } from 'react';
import { X, Calendar, Package, Download, Tag, Archive, ChevronDown } from 'lucide-react';
import { Asset } from '../../types/Asset';
import { BulkOperationState } from '../../hooks/useBulkOperations';

interface BulkActionBarProps {
  selectedCount: number;
  selectedAssets: Asset[];
  operationState: BulkOperationState;
  onClearSelection: () => void;
  onScheduleMaintenance: () => void;
  onOrderParts: () => void;
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
  onAddTags: () => void;
  onArchive: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  selectedAssets,
  operationState,
  onClearSelection,
  onScheduleMaintenance,
  onOrderParts,
  onExport,
  onAddTags,
  onArchive
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (selectedCount === 0) return null;

  const isLoading = operationState.isLoading;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-out">
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Selection Info */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onClearSelection}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Clear selection"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-sm font-medium text-gray-900">
                {selectedCount} asset{selectedCount > 1 ? 's' : ''} selected
              </div>
              
              {operationState.isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">
                    {operationState.operation === 'schedule-maintenance' && 'Scheduling maintenance...'}
                    {operationState.operation === 'order-parts' && 'Processing parts order...'}
                    {operationState.operation === 'export' && 'Exporting data...'}
                    {operationState.operation === 'add-tags' && 'Adding tags...'}
                    {operationState.operation === 'archive' && 'Archiving assets...'}
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
            <div className="flex items-center space-x-2">
              <button
                onClick={onScheduleMaintenance}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Maintenance
              </button>

              <button
                onClick={onOrderParts}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Package className="w-4 h-4 mr-2" />
                Order Parts
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {showExportMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onExport('csv');
                          setShowExportMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => {
                          onExport('excel');
                          setShowExportMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Export as Excel
                      </button>
                      <button
                        onClick={() => {
                          onExport('pdf');
                          setShowExportMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Export as PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onAddTags}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <Tag className="w-4 h-4 mr-2" />
                Add Tags
              </button>

              <button
                onClick={onArchive}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;