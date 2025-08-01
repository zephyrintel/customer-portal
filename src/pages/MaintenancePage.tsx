import React, { useState, useMemo, useCallback } from 'react';
import { Wrench, Search } from 'lucide-react';
import { getMockAssets } from '../data/mockData';
import { useMaintenanceFiltering } from '../hooks/useMaintenanceFiltering';
import { useMaintenanceStats } from '../hooks/useMaintenanceStats';
import { useDeviceType, usePullToRefresh } from '../hooks/useTouch';
import MaintenanceBulkActionBar from '../components/BulkActions/MaintenanceBulkActionBar';
import MaintenanceCarouselModal from '../components/BulkActions/MaintenanceCarouselModal';
import { useBulkOperations } from '../hooks/useBulkOperations';
import NotificationToast from '../components/BulkActions/NotificationToast';
import AssetDetailDrawer from '../components/Maintenance/AssetDetailDrawer';
import MaintenanceSkeletonLoader from '../components/Maintenance/MaintenanceSkeletonLoader';
import FloatingActionButton from '../components/Maintenance/FloatingActionButton';
import MaintenanceListTable from '../../components/Maintenance/MaintenanceListTable';
import { useAssetSelection } from '../hooks/useAssetSelection';


const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'needs-attention' | 'history'>('needs-attention');
  const [filters, setFilters] = useState({
    priorityFilter: 'all' as 'all' | 'critical' | 'high' | 'medium' | 'low',
    searchTerm: ''
  });
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const deviceType = useDeviceType();

  // Memoize assets to prevent unnecessary recalculations
  const assets = useMemo(() => getMockAssets(), []);

  // Use optimized filtering hook
  const { filteredAndSortedItems } = useMaintenanceFiltering(assets, filters);
  
  // Use stats hook for performance metrics
  const stats = useMaintenanceStats(assets);

  // Pull to refresh for mobile
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const { touchRef, isRefreshing, showRefreshIndicator } = usePullToRefresh(handleRefresh);

  // Use MaintenanceItem array directly for selection hook
  const {
    selectedIds,
    selectedAssets: selectedMaintenanceItems,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    hasSelection,
    toggleSelection,
    selectAll,
    clearSelection
  } = useAssetSelection(filteredAndSortedItems);

  // Extract assets from selected maintenance items for bulk operations
  const selectedAssets = useMemo(() => {
    return selectedMaintenanceItems.map(item => item.asset);
  }, [selectedMaintenanceItems]);

  const {
    operationState,
    clearOperationState
  } = useBulkOperations();

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  }, []);

  const handlePriorityFilterChange = useCallback((value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      priorityFilter: value as 'all' | 'critical' | 'high' | 'medium' | 'low' 
    }));
  }, []);

  // Bulk operation handlers
  const handleScheduleMaintenance = () => {
    setShowMaintenanceModal(true);
  };

  const handleMaintenanceComplete = (completedCount: number) => {
    setShowMaintenanceModal(false);
    clearSelection();
    
    // Show success message
    const message = completedCount === 1 
      ? 'Maintenance scheduled successfully for 1 asset'
      : `Maintenance scheduled successfully for ${completedCount} assets`;
    
    setSuccessMessage(message);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const tabs = [
    { id: 'needs-attention', label: 'Needs Attention', count: stats.assetsNeedingAttention },
    { id: 'history', label: 'History', count: 0 }
  ];

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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className={`font-bold text-gray-900 mb-2 ${
              deviceType === 'mobile' ? 'text-xl' : 'text-3xl'
            }`}>
              {deviceType === 'mobile' ? 'Maintenance' : 'Maintenance Scheduler'}
            </h1>
            <p className={`text-gray-600 ${
              deviceType === 'mobile' ? 'text-sm' : ''
            }`}>
              {deviceType === 'mobile' 
                ? 'Manage equipment maintenance' 
                : 'Manage preventive and corrective maintenance for your equipment'
              }
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'needs-attention' && (
            <div className="p-6">
              {/* Filters and Search */}
              <div className={`flex flex-col space-y-4 mb-6 ${
                deviceType !== 'mobile' ? 'sm:flex-row sm:items-center sm:justify-between sm:space-y-0' : ''
              }`}>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search equipment..."
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className={`pl-10 pr-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        deviceType === 'mobile' ? 'py-3 min-h-[44px] w-full' : 'py-2'
                      }`}
                    />
                  </div>
                  
                  <select
                    value={filters.priorityFilter}
                    onChange={(e) => handlePriorityFilterChange(e.target.value)}
                    className={`border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      deviceType === 'mobile' ? 'py-3 min-h-[44px]' : 'py-2'
                    }`}
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className={`text-gray-600 ${deviceType === 'mobile' ? 'text-sm text-center' : 'text-sm'}`}>
                  Showing {filteredAndSortedItems.length} of {stats.assetsNeedingAttention} items
                  {selectedCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                      {selectedCount} selected
                    </span>
                  )}
                </div>
              </div>

              {/* Maintenance Items */}
              {isLoading ? (
                <MaintenanceSkeletonLoader rows={8} />
              ) : (
                <MaintenanceListTable
                  items={filteredAndSortedItems}
                  selectedIds={selectedIds}
                  onToggleSelection={toggleSelection}
                  onSelectAll={selectAll}
                  onClearSelection={clearSelection}
                  isAllSelected={isAllSelected}
                  isIndeterminate={isIndeterminate}
                  showSelection={hasSelection}
                />
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6 text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Maintenance History</h3>
              <p className="text-gray-500">Review completed maintenance activities.</p>
            </div>
          )}
        </div>

        {/* Floating Action Button for Mobile */}
        {deviceType === 'mobile' && (
          <FloatingActionButton
            onClick={handleScheduleMaintenance}
            disabled={isLoading}
          />
        )}

        {/* Maintenance-Specific Bulk Action Bar */}
        <MaintenanceBulkActionBar
          selectedCount={selectedCount}
          selectedAssets={selectedAssets}
          operationState={operationState}
          onClearSelection={clearSelection}
          onScheduleMaintenance={handleScheduleMaintenance}
        />

        {/* Asset Detail Drawer */}
        <AssetDetailDrawer
          assetId={selectedAssetId}
          isOpen={!!selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
        />

        {/* Maintenance Carousel Modal */}
        <MaintenanceCarouselModal
          isOpen={showMaintenanceModal}
          onClose={() => setShowMaintenanceModal(false)}
          selectedAssets={selectedAssets}
          onComplete={handleMaintenanceComplete}
          isLoading={operationState.isLoading && operationState.operation === 'schedule-maintenance'}
        />

        {/* Success Toast */}
        <NotificationToast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
        
        {/* Error Toast */}
        <NotificationToast
          message={operationState.error}
          type="error"
          onClose={clearOperationState}
        />

      </div>
    </div>
  );
};

export default MaintenancePage;