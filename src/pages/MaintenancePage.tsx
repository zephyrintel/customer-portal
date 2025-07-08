import React, { useState, useMemo } from 'react';
import { Calendar, AlertTriangle, Clock, CheckCircle, Wrench, Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { getMockAssets } from '../data/mockData';
import { Asset } from '../types/Asset';
import { useAssetSelection } from '../hooks/useAssetSelection';
import MaintenanceBulkActionBar from '../components/BulkActions/MaintenanceBulkActionBar';
import MaintenanceCarouselModal from '../components/BulkActions/MaintenanceCarouselModal';
import { useBulkOperations } from '../hooks/useBulkOperations';
import NotificationToast from '../components/BulkActions/NotificationToast';
import AssetDetailDrawer from '../components/Maintenance/AssetDetailDrawer';
import { getAssetMaintenanceStatus } from '../utils/maintenanceUtils';
import { formatDate } from '../utils/dateUtils';

interface MaintenanceItem {
  id: string;
  name: string;
  status: string;
  lastMaint: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  equipmentType: string;
  location: string;
  asset: Asset;
  daysOverdue?: number;
  nextDueDate?: Date;
  maintenanceDetails: string; // Internal field for tracking reasons, not displayed
}

type SortField = 'name' | 'priority' | 'status' | 'lastMaint' | 'equipmentType' | 'location';
type SortDirection = 'asc' | 'desc';

const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'needs-attention' | 'scheduled' | 'history'>('needs-attention');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Memoize assets to prevent unnecessary recalculations
  const assets = useMemo(() => getMockAssets(), []);

  // Generate prioritized maintenance list from assets
  const maintenanceItems = useMemo((): MaintenanceItem[] => {
    const items: MaintenanceItem[] = [];

    assets.forEach(asset => {
      const reasons: string[] = [];
      let priority: MaintenanceItem['priority'] = 'low';
      let daysOverdue: number | undefined;
      let nextDueDate: Date | undefined;

      // Check if asset is not operating
      if (['Not In Use', 'Not Commissioned', 'Unknown'].includes(asset.currentStatus)) {
        reasons.push('Asset is offline');
        priority = asset.criticalityLevel === 'Critical' ? 'critical' : 'high';
      }

      // Check for overdue maintenance on wear components
      const today = new Date();
      let hasOverdueMaintenance = false;
      let hasDueSoonMaintenance = false;
      let maxOverdueDays = 0;
      let earliestDueDate: Date | undefined;

      const maintenanceStatus = getAssetMaintenanceStatus(asset);
      hasOverdueMaintenance = maintenanceStatus.overdueCount > 0;
      hasDueSoonMaintenance = maintenanceStatus.dueSoonCount > 0;
      
      // Add specific component details to reasons
      asset.wearComponents.forEach(component => {
        // ... existing component logic for building reasons array
      });

      // Set priority based on maintenance status
      if (hasOverdueMaintenance) {
        priority = asset.criticalityLevel === 'Critical' ? 'critical' : 'high';
        daysOverdue = maxOverdueDays;
      } else if (hasDueSoonMaintenance) {
        priority = asset.criticalityLevel === 'Critical' ? 'high' : 'medium';
        nextDueDate = earliestDueDate;
      }

      // Check for long time since last maintenance
      if (asset.lastMaintenance) {
        const lastMaintenanceDate = new Date(asset.lastMaintenance);
        const daysSinceLastMaintenance = Math.ceil((today.getTime() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastMaintenance > 180) { // 6 months
          reasons.push(`No maintenance for ${Math.floor(daysSinceLastMaintenance / 30)} months`);
          if (priority === 'low') priority = 'medium';
        }
      } else {
        reasons.push('No maintenance history recorded');
        if (priority === 'low') priority = 'medium';
      }

      // Only include assets that need attention
      if (reasons.length > 0) {
        items.push({
          id: asset.id,
          name: asset.name,
          status: asset.currentStatus,
          lastMaint: asset.lastMaintenance,
          priority,
          equipmentType: asset.equipmentType,
          location: `${asset.location.facility} - ${asset.location.area}`,
          asset,
          daysOverdue,
          nextDueDate,
          maintenanceDetails: reasons.join('; ') // Store internally but don't display
        });
      }
    });

    return items;
  }, [assets]);

  // Filter and sort maintenance items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = maintenanceItems.filter(item => {
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipmentType.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesPriority && matchesSearch;
    });

    // Sort the filtered items
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'lastMaint':
          aValue = a.lastMaint ? new Date(a.lastMaint).getTime() : 0;
          bValue = b.lastMaint ? new Date(b.lastMaint).getTime() : 0;
          break;
        case 'equipmentType':
          aValue = a.equipmentType.toLowerCase();
          bValue = b.equipmentType.toLowerCase();
          break;
        case 'location':
          aValue = a.location.toLowerCase();
          bValue = b.location.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [maintenanceItems, priorityFilter, searchTerm, sortField, sortDirection]);

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
    { id: 'needs-attention', label: 'Needs Attention', count: filteredAndSortedItems.length },
    { id: 'scheduled', label: 'Scheduled', count: 0 },
    { id: 'history', label: 'History', count: 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Scheduler</h1>
            <p className="text-gray-600">Manage preventive and corrective maintenance for your equipment</p>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search equipment..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="text-sm text-gray-600">
                  Showing {filteredAndSortedItems.length} of {maintenanceItems.length} items
                  {selectedCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                      {selectedCount} selected
                    </span>
                  )}
                </div>
              </div>

              {/* Maintenance Items Table */}
              {filteredAndSortedItems.length > 0 ? (
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
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Equipment</span>
                              {getSortIcon('name')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                            onClick={() => handleSort('location')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Location</span>
                              {getSortIcon('location')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                            onClick={() => handleSort('priority')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Priority</span>
                              {getSortIcon('priority')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Status</span>
                              {getSortIcon('status')}
                            </div>
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                            onClick={() => handleSort('lastMaint')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Last Maintenance</span>
                              {getSortIcon('lastMaint')}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedItems.map((item) => (
                          <tr 
                            key={item.id} 
                            onClick={(e) => handleRowClick(item.id, e)}
                            className={`transition-colors duration-150 ease-in-out cursor-pointer ${
                              selectedIds.has(item.id) 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(item.id)}
                                onChange={(e) => handleCheckboxClick(item.id, e as any)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                aria-label={`Select ${item.name}`}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-lg mr-3">{getEquipmentTypeIcon(item.equipmentType)}</span>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  <div className="text-sm text-gray-500">{item.equipmentType}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                {getPriorityIcon(item.priority)}
                                <span className="ml-1 capitalize">{item.priority}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={getStatusBadge(item.status as Asset['currentStatus'])}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatMaintenanceDate(item.lastMaint)}</div>
                              {item.daysOverdue && (
                                <div className="text-xs text-red-600 font-medium">
                                  {item.daysOverdue} days overdue
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-500">
                    {maintenanceItems.length === 0 
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
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduled Maintenance</h3>
              <p className="text-gray-500">View and manage scheduled maintenance tasks.</p>
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