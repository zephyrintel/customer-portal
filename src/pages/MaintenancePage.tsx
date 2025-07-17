import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { Calendar, AlertTriangle, Clock, CheckCircle, Wrench, Search, ChevronUp, ChevronDown, X, Filter } from 'lucide-react';
import { getMockAssets } from '../data/mockData';
import { Asset } from '../types/Asset';
import { useAssetSelection } from '../hooks/useAssetSelection';
import { useMaintenanceFiltering } from '../hooks/useMaintenanceFiltering';
import { useMaintenanceStats } from '../hooks/useMaintenanceStats';
import { useVirtualList } from '../hooks/useVirtualList';
import { useDeviceType, usePullToRefresh } from '../hooks/useTouch';
import MaintenanceBulkActionBar from '../components/BulkActions/MaintenanceBulkActionBar';
import MaintenanceCarouselModal from '../components/BulkActions/MaintenanceCarouselModal';
import { useBulkOperations } from '../hooks/useBulkOperations';
import NotificationToast from '../components/BulkActions/NotificationToast';
import AssetDetailDrawer from '../components/Maintenance/AssetDetailDrawer';
import MaintenanceCard from '../components/Maintenance/MaintenanceCard';
import MaintenanceSkeletonLoader from '../components/Maintenance/MaintenanceSkeletonLoader';
import FloatingActionButton from '../components/Maintenance/FloatingActionButton';
import BottomSheet from '../components/Maintenance/BottomSheet';

// Lazy load heavy components
const MaintenanceCalendar = lazy(() => import('../components/Calendar/MaintenanceCalendar'));
const CalendarEventModal = lazy(() => import('../components/Calendar/CalendarEventModal'));

// Mock maintenance events for calendar
interface MaintenanceEvent {
  id: string;
  assetId: string;
  assetName: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'calibration';
  date: Date;
  title: string;
  description?: string;
  technician?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  estimatedDuration: number;
}

type SortField = 'name' | 'priority' | 'status' | 'lastMaint' | 'equipmentType' | 'location';
type SortDirection = 'asc' | 'desc';

const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'needs-attention' | 'scheduled' | 'history'>('needs-attention');
  const [filters, setFilters] = useState({
    priorityFilter: 'all' as 'all' | 'critical' | 'high' | 'medium' | 'low',
    searchTerm: ''
  });
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [assetFilter, setAssetFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const deviceType = useDeviceType();

  // Memoize assets to prevent unnecessary recalculations
  const assets = useMemo(() => getMockAssets(), []);

  // Use optimized filtering hook
  const { filteredAndSortedItems } = useMaintenanceFiltering(assets, filters);
  
  // Use stats hook for performance metrics
  const stats = useMaintenanceStats(assets);

  // Debounced search with increased delay for mobile
  const debouncedSetSearch = useCallback(
    debounce((term: string) => {
      setFilters(prev => ({ ...prev, searchTerm: term }));
    }, deviceType === 'mobile' ? 500 : 300),
    [deviceType]
  );

  // Virtual list for mobile performance
  const virtualList = useVirtualList({
    items: filteredAndSortedItems,
    itemHeight: deviceType === 'mobile' ? 180 : 80,
    containerHeight: deviceType === 'mobile' ? 600 : 800,
    overscan: 5
  });

  // Pull to refresh for mobile
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const { touchRef, isRefreshing, showRefreshIndicator } = usePullToRefresh(handleRefresh);

  // Mock maintenance events for calendar
  const mockMaintenanceEvents: MaintenanceEvent[] = useMemo(() => [
    {
      id: 'maint-001',
      assetId: 'AST-001',
      assetName: 'Centrifugal Pump Model X',
      type: 'preventive',
      date: new Date(2024, 11, 25, 9, 0), // December 25, 2024, 9:00 AM
      title: 'Quarterly Preventive Maintenance',
      description: 'Replace filters, check seals, and lubricate bearings',
      technician: 'John Smith',
      priority: 'medium',
      status: 'scheduled',
      estimatedDuration: 3,
      requiredParts: ['55916', '4090064020']
    },
    {
      id: 'maint-002',
      assetId: 'AST-002',
      assetName: 'Rotary Screw Compressor',
      type: 'corrective',
      date: new Date(2024, 11, 28, 14, 0), // December 28, 2024, 2:00 PM
      title: 'Air Filter Replacement',
      description: 'Replace clogged air filter element',
      technician: 'Sarah Johnson',
      priority: 'high',
      status: 'scheduled',
      estimatedDuration: 1,
      requiredParts: ['AC-FILTER-001']
    },
    {
      id: 'maint-003',
      assetId: 'AST-004',
      assetName: 'Shell & Tube Heat Exchanger',
      type: 'inspection',
      date: new Date(2024, 11, 30, 10, 30), // December 30, 2024, 10:30 AM
      title: 'Annual Safety Inspection',
      description: 'Pressure test and safety system verification',
      technician: 'Mike Wilson',
      priority: 'critical',
      status: 'scheduled',
      estimatedDuration: 4,
      requiredParts: ['AL-GASKET-001']
    },
    {
      id: 'maint-004',
      assetId: 'AST-001',
      assetName: 'Centrifugal Pump Model X',
      type: 'emergency',
      date: new Date(2024, 11, 20, 8, 0), // December 20, 2024, 8:00 AM
      title: 'Emergency Seal Repair',
      description: 'Replace failed mechanical seal',
      technician: 'Emergency Team',
      priority: 'critical',
      status: 'completed',
      estimatedDuration: 2,
      requiredParts: ['55916'],
      usedParts: [
        {
          partNumber: '55916',
          description: 'SHIM FASTENAL NUMBER 7041808',
          quantityUsed: 2,
          isWearItem: true
        }
      ]
    },
    {
      id: 'maint-005',
      assetId: 'AST-005',
      assetName: 'Electric Motor Drive',
      type: 'calibration',
      date: new Date(2025, 0, 5, 13, 0), // January 5, 2025, 1:00 PM
      title: 'Motor Calibration',
      description: 'Calibrate motor control parameters',
      technician: 'Specialist Team',
      priority: 'medium',
      status: 'scheduled',
      estimatedDuration: 2,
      requiredParts: ['ABB-BEARING-001']
    },
    {
      id: 'maint-006',
      assetId: 'AST-002',
      assetName: 'Rotary Screw Compressor',
      type: 'preventive',
      date: new Date(2024, 11, 15, 11, 0), // December 15, 2024, 11:00 AM (overdue)
      title: 'Overdue Oil Change',
      description: 'Change compressor oil and filter',
      technician: 'John Smith',
      priority: 'high',
      status: 'overdue',
      estimatedDuration: 1.5,
      requiredParts: ['AC-FILTER-001']
    }
  ], []);

  // Convert maintenance items to assets for selection hook
  const assetsForSelection = filteredAndSortedItems.map(item => item.asset);

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
  } = useAssetSelection(assetsForSelection);

  const {
    operationState,
    clearOperationState
  } = useBulkOperations();

  // Debounce utility
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-300" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-gray-600" />
      : <ChevronDown className="w-4 h-4 text-gray-600" />;
  };

  const getPriorityIcon = (priority: MaintenanceItem['priority']) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getPriorityColor = (priority: MaintenanceItem['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  // Reuse the same status badge function as AssetsTable
  const getStatusBadge = (status: Asset['currentStatus']) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide";
    
    switch (status) {
      case 'In Operation':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Intermittent Operation':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Not Commissioned':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Not In Use':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Unknown':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getEquipmentTypeIcon = (type: string) => {
    switch (type) {
      case 'Pump':
        return '🔄';
      case 'Compressor':
        return '💨';
      case 'Valve':
        return '🔧';
      case 'Motor':
        return '⚡';
      case 'Heat Exchanger':
        return '🔥';
      case 'Tank':
        return '🛢️';
      default:
        return '⚙️';
    }
  };

  const formatMaintenanceDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return formatDate(dateString, { format: 'short' });
  };

  const handleRowClick = (assetId: string, event: React.MouseEvent) => {
    // Don't open drawer if clicking on checkbox
    if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    setSelectedAssetId(assetId);
  };

  const handleCheckboxClick = (assetId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleSelection(assetId, event.shiftKey);
  };

  const handleSelectAllChange = () => {
    if (isAllSelected || isIndeterminate) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  const handleSearchChange = useCallback((value: string) => {
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

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

  // Calendar event handlers
  const handleEventClick = (event: MaintenanceEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
  };

  const handleScheduleNew = (date: Date) => {
    console.log('Schedule new maintenance for:', date);
    // This would open the maintenance scheduling modal with the selected date
  };

  const handleCompleteEvent = async (event: MaintenanceEvent) => {
    // Simulate completing maintenance
    console.log('Completing maintenance:', event);
    
    // Add completion note to asset history
    if (event.assetId !== 'GENERAL') {
      const asset = assets.find(a => a.id === event.assetId);
      if (asset) {
        const partsUsedText = event.usedParts && event.usedParts.length > 0
          ? ` Parts used: ${event.usedParts.map(p => `${p.partNumber} (${p.quantityUsed})`).join(', ')}`
          : '';
        
        const note = {
          id: `note-${Date.now()}`,
          date: new Date().toISOString(),
          text: `Maintenance "${event.title}" completed successfully.${partsUsedText}`,
          type: 'maintenance' as const,
          source: 'calendar' as const
        };
        
        console.log('Adding completion note to asset:', { assetId: asset.id, note });
      }
    }
  };

  const handleUpdateEvent = async (updatedEvent: MaintenanceEvent) => {
    // Simulate updating maintenance event
    console.log('Updating maintenance event:', updatedEvent);
    
    // In a real implementation, this would update the event in the backend
    // For now, we'll just log the update and close the modal
    
    // Add a note to the associated asset about the rescheduling
    if (updatedEvent.assetId !== 'GENERAL') {
      const asset = assets.find(a => a.id === updatedEvent.assetId);
      if (asset) {
        const note = {
          id: `note-${Date.now()}`,
          date: new Date().toISOString(),
          text: `Maintenance "${updatedEvent.title}" rescheduled to ${updatedEvent.date.toLocaleDateString()}`,
          type: 'maintenance' as const,
          source: 'calendar' as const
        };
        
        // In real implementation, this would update the asset in the backend
        console.log('Adding note to asset:', { assetId: asset.id, note });
      }
    }
    
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleCancelEvent = async (event: MaintenanceEvent) => {
    // Simulate cancelling maintenance event
    console.log('Cancelling maintenance event:', event);
    
    // Add a note to the associated asset about the cancellation
    if (event.assetId !== 'GENERAL') {
      const asset = assets.find(a => a.id === event.assetId);
      if (asset) {
        const note = {
          id: `note-${Date.now()}`,
          date: new Date().toISOString(),
          text: `Maintenance "${event.title}" was cancelled`,
          type: 'maintenance' as const,
          source: 'calendar' as const
        };
        
        // In real implementation, this would update the asset in the backend
        console.log('Adding note to asset:', { assetId: asset.id, note });
      }
    }
    
    setShowEventModal(false);
    setSelectedEvent(null);
  };
  const tabs = [
    { id: 'needs-attention', label: 'Needs Attention', count: stats.assetsNeedingAttention },
    { id: 'scheduled', label: 'Scheduled', count: mockMaintenanceEvents.filter(e => e.status === 'scheduled').length },
    { id: 'history', label: 'History', count: 0 }
  ];

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

              {/* Maintenance Items Table */}
              {isLoading ? (
                <MaintenanceSkeletonLoader rows={8} />
              ) : filteredAndSortedItems.length > 0 ? (
                <>
                  {deviceType === 'mobile' ? (
                    // Mobile: Virtual scrolling card view
                    <div className={`transition-all duration-300 ${hasSelection ? 'mb-32' : 'mb-0'}`}>
                      {filteredAndSortedItems.length > 50 ? (
                        <div 
                          className="relative"
                          style={{ height: virtualList.totalHeight }}
                          onScroll={virtualList.handleScroll}
                        >
                          <div style={{ transform: `translateY(${virtualList.offsetY}px)` }}>
                            {virtualList.visibleItems.map(({ item, index }) => (
                              <MaintenanceCard
                                key={item.id}
                                item={item}
                                isSelected={selectedIds.has(item.id)}
                                onToggleSelection={handleCheckboxClick}
                                onRowClick={handleRowClick}
                                showSelection={true}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredAndSortedItems.map((item) => (
                            <MaintenanceCard
                              key={item.id}
                              item={item}
                              isSelected={selectedIds.has(item.id)}
                              onToggleSelection={handleCheckboxClick}
                              onRowClick={handleRowClick}
                              showSelection={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Desktop: Table view
                    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ${hasSelection ? 'mb-20' : 'mb-0'}`}>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={isAllSelected}
                                  ref={(input) => {
                                    if (input) input.indeterminate = isIndeterminate;
                                  }}
                                  onChange={handleSelectAllChange}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  aria-label="Select all assets"
                                />
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Equipment
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Maintenance
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedItems.map((item) => (
                              <MaintenanceCard
                                key={item.id}
                                item={item}
                                isSelected={selectedIds.has(item.id)}
                                onToggleSelection={handleCheckboxClick}
                                onRowClick={handleRowClick}
                                showSelection={true}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-500">
                    {stats.assetsNeedingAttention === 0 
                      ? 'No equipment requires immediate attention.'
                      : 'No equipment matches your current filters.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab === 'scheduled' && (
            <div className="p-6 text-center py-12">
              {/* Filters for Calendar */}
              <div className={`mb-6 flex flex-col space-y-4 ${
                deviceType !== 'mobile' ? 'sm:flex-row sm:items-center sm:justify-between sm:space-y-0' : ''
              }`}>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={assetFilter}
                      onChange={(e) => setAssetFilter(e.target.value)}
                      className={`pl-10 pr-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        deviceType === 'mobile' ? 'py-3 min-h-[44px] w-full' : 'py-2'
                      }`}
                    >
                      <option value="">All Assets</option>
                      {assets.map(asset => (
                        <option key={asset.id} value={asset.id}>{asset.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={`border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      deviceType === 'mobile' ? 'py-3 min-h-[44px] w-full' : 'py-2'
                    }`}
                  >
                    <option value="">All Types</option>
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective</option>
                    <option value="emergency">Emergency</option>
                    <option value="inspection">Inspection</option>
                    <option value="calibration">Calibration</option>
                  </select>
                </div>
              </div>

              <Suspense fallback={<MaintenanceSkeletonLoader rows={6} />}>
                <MaintenanceCalendar
                  events={mockMaintenanceEvents}
                  assets={assets}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
                  onScheduleNew={handleScheduleNew}
                  selectedAssetFilter={assetFilter}
                  selectedTypeFilter={typeFilter}
                />
              </Suspense>
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

        {/* Calendar Event Modal */}
        <Suspense fallback={null}>
          {deviceType === 'mobile' ? (
            <BottomSheet
              isOpen={showEventModal}
              onClose={() => setShowEventModal(false)}
              title={selectedEvent?.title || 'Maintenance Event'}
              height="auto"
            >
              {selectedEvent && (
                <CalendarEventModal
                  isOpen={true}
                  onClose={() => setShowEventModal(false)}
                  event={selectedEvent}
                  asset={selectedEvent ? assets.find(a => a.id === selectedEvent.assetId) : undefined}
                  onComplete={handleCompleteEvent}
                  onUpdate={handleUpdateEvent}
                  onCancel={handleCancelEvent}
                />
              )}
            </BottomSheet>
          ) : (
            <CalendarEventModal
              isOpen={showEventModal}
              onClose={() => setShowEventModal(false)}
              event={selectedEvent}
              asset={selectedEvent ? assets.find(a => a.id === selectedEvent.assetId) : undefined}
              onComplete={handleCompleteEvent}
              onUpdate={handleUpdateEvent}
              onCancel={handleCancelEvent}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default MaintenancePage;