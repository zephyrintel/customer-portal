import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AssetsTable from '../components/AssetsTable';
import SearchBar from '../components/Search/SearchBar';
import SearchResults from '../components/Search/SearchResults';
import BulkActionBar from '../components/BulkActions/BulkActionBar';
import MaintenanceScheduleModal from '../components/BulkActions/MaintenanceScheduleModal';
import NotificationToast from '../components/BulkActions/NotificationToast';
import SkeletonLoader from '../components/LoadingStates/SkeletonLoader';
import EmptyAssetState from '../components/EmptyStates/EmptyAssetState';
import HelpTooltip from '../components/Tooltips/HelpTooltip';
import { useAssetSearch } from '../hooks/useAssetSearch';
import { useAssetSelection } from '../hooks/useAssetSelection';
import { useBulkOperations } from '../hooks/useBulkOperations';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { getMockAssets } from '../data/mockData';
import { CheckSquare, Square, Keyboard } from 'lucide-react';
import { useDeviceType, usePullToRefresh } from '../hooks/useTouch';

const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchBarRef = useRef<HTMLInputElement>(null);
  const deviceType = useDeviceType();

  // Memoize assets to prevent unnecessary recalculations
  const assets = useMemo(() => getMockAssets(), []);

  const {
    searchTerm,
    setSearchTerm,
    clearSearch,
    filteredAssets,
    suggestions,
    isSearching,
    resultCount,
    totalCount,
    hasActiveSearch,
    getSuggestedBulkActions
  } = useAssetSearch(assets);

  const {
    selectedIds,
    selectedAssets,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    hasSelection,
    toggleSelection,
    selectAll,
    clearSelection
  } = useAssetSelection(filteredAssets);

  const {
    operationState,
    clearOperationState,
    scheduleMaintenance,
    orderParts,
    exportAssets,
    addTags,
    archiveAssets
  } = useBulkOperations();

  // Pull to refresh for mobile
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const { touchRef, isRefreshing, showRefreshIndicator } = usePullToRefresh(handleRefresh);

  // Focus search bar
  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  // Open first asset if only one result
  const openFirstAsset = useCallback(() => {
    if (filteredAssets.length === 1) {
      navigate(`/assets/${filteredAssets[0].id}`);
    }
  }, [filteredAssets, navigate]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: focusSearch,
    onSelectAll: selectAll,
    onClearSearch: clearSearch,
    onClearSelection: () => {
      clearSelection();
      setSelectionMode(false);
    },
    onOpenFirstAsset: openFirstAsset,
    searchTerm,
    resultCount,
    hasSelection
  });

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    if (selectionMode) {
      clearSelection();
    }
    setSelectionMode(!selectionMode);
  };

  // Bulk operation handlers
  const handleScheduleMaintenance = () => {
    setShowMaintenanceModal(true);
  };

  const handleMaintenanceSchedule = async (scheduleData: any) => {
    await scheduleMaintenance(selectedAssets, scheduleData);
    setShowMaintenanceModal(false);
    clearSelection();
    setSelectionMode(false);
  };

  const handleOrderParts = async () => {
    await orderParts(selectedAssets);
    clearSelection();
    setSelectionMode(false);
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    await exportAssets(selectedAssets, format);
    clearSelection();
    setSelectionMode(false);
  };

  const handleAddTags = async () => {
    const mockTags = ['maintenance-scheduled', 'high-priority'];
    await addTags(selectedAssets, mockTags);
    clearSelection();
    setSelectionMode(false);
  };

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to archive ${selectedCount} asset${selectedCount > 1 ? 's' : ''}?`)) {
      await archiveAssets(selectedAssets);
      clearSelection();
      setSelectionMode(false);
    }
  };

  // Handle suggested actions
  const handleSuggestedAction = (action: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
    }
    
    switch (action) {
      case 'schedule-maintenance':
        handleScheduleMaintenance();
        break;
      case 'order-parts':
        handleOrderParts();
        break;
      default:
        console.log('Suggested action:', action);
    }
  };

  // Get suggested actions based on search
  const suggestedActions = getSuggestedBulkActions();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonLoader rows={8} />
        </div>
      </div>
    );
  }

  // Show empty state for no assets
  if (assets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyAssetState
            type="no-assets"
            onAddAsset={() => console.log('Add asset')}
            onImportAssets={() => console.log('Import assets')}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={deviceType === 'mobile' ? touchRef : undefined}
      className="min-h-screen bg-gray-100 py-4 sm:py-8 relative"
    >
      {/* Pull to refresh indicator */}
      {showRefreshIndicator && deviceType === 'mobile' && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white text-center py-2 text-sm">
          {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-pt">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`font-bold text-gray-900 mb-2 ${
                deviceType === 'mobile' ? 'text-xl' : 'text-3xl'
              }`}>
                {deviceType === 'mobile' ? 'Assets' : 'Asset Management System'}
              </h1>
              <div className="flex items-center space-x-2">
                <p className={`text-gray-600 ${
                  deviceType === 'mobile' ? 'text-sm' : ''
                }`}>
                  {deviceType === 'mobile' 
                    ? 'Monitor your equipment' 
                    : 'Monitor and manage your industrial assets'
                  }
                </p>
                {deviceType !== 'mobile' && (
                  <HelpTooltip
                  title="Keyboard Shortcuts"
                  content="⌘+F to search, ⌘+A to select all, Escape to clear, Enter to open single result"
                />
                )}
              </div>
            </div>
            
            {/* Selection Mode Toggle */}
            <div className={`flex items-center space-x-3 ${
              deviceType === 'mobile' ? 'flex-col space-y-2 space-x-0' : ''
            }`}>
              {deviceType === 'desktop' && (
                <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                <Keyboard className="w-3 h-3" />
                <span>⌘+F to search</span>
              </div>
              )}
              
              <button
                onClick={handleToggleSelectionMode}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] ${
                  selectionMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500'
                }`}
              >
                {selectionMode ? (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Exit Selection
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    {deviceType === 'mobile' ? 'Select' : 'Select Assets'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <SearchBar
            ref={searchBarRef}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clearSearch={clearSearch}
            suggestions={suggestions}
            isSearching={isSearching}
            selectedCount={selectedCount}
            onFocus={() => {
              // Optional: Track search focus for analytics
            }}
          />
        </div>

        {/* Search Results Info */}
        <SearchResults
          resultCount={resultCount}
          totalCount={totalCount}
          hasActiveSearch={hasActiveSearch}
          searchTerm={searchTerm}
          selectedCount={selectedCount}
          suggestedActions={suggestedActions}
          onSuggestedAction={handleSuggestedAction}
        />
        
        {/* Assets Table or Empty State */}
        <div className={`transition-all duration-300 ${
          hasSelection 
            ? deviceType === 'mobile' 
              ? 'mb-32' 
              : 'mb-20' 
            : 'mb-0'
        }`}>
          {filteredAssets.length > 0 ? (
            <AssetsTable 
              assets={filteredAssets}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              showSelection={selectionMode}
            />
          ) : hasActiveSearch ? (
            <EmptyAssetState
              type="no-search-results"
              searchTerm={searchTerm}
              onClearSearch={clearSearch}
            />
          ) : null}
        </div>

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selectedCount}
          selectedAssets={selectedAssets}
          operationState={operationState}
          onClearSelection={() => {
            clearSelection();
            setSelectionMode(false);
          }}
          onScheduleMaintenance={handleScheduleMaintenance}
          onOrderParts={handleOrderParts}
          onExport={handleExport}
          onAddTags={handleAddTags}
          onArchive={handleArchive}
        />

        {/* Maintenance Schedule Modal */}
        <MaintenanceScheduleModal
          isOpen={showMaintenanceModal}
          onClose={() => setShowMaintenanceModal(false)}
          selectedAssets={selectedAssets}
          onSchedule={handleMaintenanceSchedule}
          isLoading={operationState.isLoading && operationState.operation === 'schedule-maintenance'}
        />

        {/* Notification Toasts */}
        <NotificationToast
          message={operationState.success}
          type="success"
          onClose={clearOperationState}
        />
        
        <NotificationToast
          message={operationState.error}
          type="error"
          onClose={clearOperationState}
        />
      </div>
    </div>
  );
};

export default AssetsPage;