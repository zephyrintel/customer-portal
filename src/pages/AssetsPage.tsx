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
import { ChevronDown, Keyboard } from 'lucide-react';
import { useDeviceType, usePullToRefresh } from '../hooks/useTouch';

const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showBulkActionsMenu, setShowBulkActionsMenu] = useState(false);
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

  // Equipment type filter UI state
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState<null | 'Pump' | 'Compressor' | 'Valve' | 'Motor' | 'Heat Exchanger' | 'Tank'>(null);
  const displayedAssets = useMemo(() => {
    if (!equipmentTypeFilter) return filteredAssets;
    return filteredAssets.filter(a => a.equipmentType === equipmentTypeFilter);
  }, [filteredAssets, equipmentTypeFilter]);

  // Inline maintenance single-asset override for modal
  const [inlineMaintenanceAssets, setInlineMaintenanceAssets] = useState<null | typeof selectedAssets>(null);

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
    onClearSelection: clearSelection,
    onOpenFirstAsset: openFirstAsset,
    searchTerm,
    resultCount,
    hasSelection
  });

  // Toggle bulk actions menu
  const toggleBulkActionsMenu = () => {
    setShowBulkActionsMenu(!showBulkActionsMenu);
  };

  // Bulk operation handlers
  const handleScheduleMaintenance = () => {
    setInlineMaintenanceAssets(null); // use current selection
    setShowMaintenanceModal(true);
  };

  // Inline actions
  const handleInlineScheduleMaintenance = (asset: Asset) => {
    setInlineMaintenanceAssets([asset]);
    setShowMaintenanceModal(true);
  };

  const handleInlineLogInspection = (asset: Asset) => {
    // For now, just add a system note to simulate logging an inspection
    console.log('Log inspection for asset', asset.id);
    // In a full implementation, this could open an inspection modal
  };

  const handleMaintenanceSchedule = async (scheduleData: any) => {
    const targets = inlineMaintenanceAssets ?? selectedAssets;
    await scheduleMaintenance(targets, scheduleData);
    setShowMaintenanceModal(false);
    setInlineMaintenanceAssets(null);
    clearSelection();
  };

  const handleOrderParts = async () => {
    await orderParts(selectedAssets);
    clearSelection();
    setShowBulkActionsMenu(false);
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    await exportAssets(selectedAssets, format);
    clearSelection();
    setShowBulkActionsMenu(false);
  };

  const handleAddTags = async () => {
    const mockTags = ['maintenance-scheduled', 'high-priority'];
    await addTags(selectedAssets, mockTags);
    clearSelection();
    setShowBulkActionsMenu(false);
  };

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to archive ${selectedCount} asset${selectedCount > 1 ? 's' : ''}?`)) {
      await archiveAssets(selectedAssets);
      clearSelection();
      setShowBulkActionsMenu(false);
    }
  };

  // Handle suggested actions
  const handleSuggestedAction = (action: string) => {
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonLoader rows={8} />
        </div>
      </div>
    );
  }

  // Show empty state for no assets
  if (assets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
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
      className="min-h-screen bg-gray-50 py-4 sm:py-8 relative"
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
            
            {/* Bulk Actions Dropdown */}
            <div className={`flex items-center space-x-3 ${
              deviceType === 'mobile' ? 'flex-col space-y-2 space-x-0' : ''
            }`}>
              {deviceType === 'desktop' && (
                <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                <Keyboard className="w-3 h-3" />
                <span>⌘+F to search</span>
              </div>
              )}
              
              <div className="relative">
                <button
                  onClick={toggleBulkActionsMenu}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-blue-700 min-h-[44px]"
                >
                  {deviceType === 'mobile' ? 'Actions' : 'Bulk Actions'}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                
                {showBulkActionsMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleScheduleMaintenance();
                          setShowBulkActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Schedule Maintenance
                      </button>
                      <button
                        onClick={() => {
                          handleOrderParts();
                          setShowBulkActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Order Parts
                      </button>
                      <button
                        onClick={() => {
                          handleExport('csv');
                          setShowBulkActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Export Assets
                      </button>
                      <button
                        onClick={() => {
                          handleAddTags();
                          setShowBulkActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Add Tags
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          handleArchive();
                          setShowBulkActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Archive Assets
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

        {/* Equipment Type Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {['All','Pump','Compressor','Valve','Motor','Heat Exchanger','Tank'].map((type) => (
            <button
              key={type}
              className={`px-3 py-1 rounded-full text-sm border ${
                (type === 'All' && !equipmentTypeFilter) || equipmentTypeFilter === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setEquipmentTypeFilter(type === 'All' ? null : (type as any))}
            >
              {type}
            </button>
          ))}
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
          {displayedAssets.length > 0 ? (
            <AssetsTable 
              assets={displayedAssets}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              showSelection={hasSelection}
              onInlineScheduleMaintenance={handleInlineScheduleMaintenance}
              onInlineLogInspection={handleInlineLogInspection}
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
          onClearSelection={clearSelection}
          onScheduleMaintenance={handleScheduleMaintenance}
          onOrderParts={handleOrderParts}
          onExport={handleExport}
          onAddTags={handleAddTags}
          onArchive={handleArchive}
        />

        {/* Maintenance Schedule Modal */}
        <MaintenanceScheduleModal
          isOpen={showMaintenanceModal}
          onClose={() => { setShowMaintenanceModal(false); setInlineMaintenanceAssets(null); }}
          selectedAssets={inlineMaintenanceAssets ?? selectedAssets}
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