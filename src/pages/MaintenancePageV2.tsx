import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Settings,
  TrendingUp,
  Eye,
  Plus,
  Download} from 'lucide-react';

// Hooks
import { getMockAssets } from '../data/mockData';
import { useMaintenanceFiltering } from '../hooks/useMaintenanceFiltering';
import { useMaintenanceStats } from '../hooks/useMaintenanceStats';
import { useDeviceType, usePullToRefresh } from '../hooks/useTouch';
import { useAssetSelection } from '../hooks/useAssetSelection';
import { useBulkOperations } from '../hooks/useBulkOperations';

// Components
import MaintenanceListTable from '../../components/Maintenance/MaintenanceListTable';
import MaintenanceBulkActionBar from '../components/BulkActions/MaintenanceBulkActionBar';
import MaintenanceCarouselModal from '../components/BulkActions/MaintenanceCarouselModal';
import NotificationToast from '../components/BulkActions/NotificationToast';
import MaintenanceSkeletonLoader from '../components/Maintenance/MaintenanceSkeletonLoader';

// Utils
import { getPriorityBadge, PRIORITY_COLOR_MAP } from '../utils/badgeUtils';

// Types
import type { MaintenanceItem, MaintenanceFilters } from '../types/Maintenance';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor, 
  bgColor,
  onClick 
}) => (
  <div 
    className={`${bgColor} rounded-xl p-6 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`${iconColor} bg-white/50 rounded-lg p-3`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

interface FilterButtonProps {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  label, 
  count, 
  isActive, 
  onClick, 
  color = 'blue' 
}) => {
  const colorClasses = {
    red: isActive ? 'bg-red-100 text-red-700 border-red-200' : 'text-gray-600 hover:text-red-600 hover:bg-red-50',
    orange: isActive ? 'bg-orange-100 text-orange-700 border-orange-200' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50',
    yellow: isActive ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50',
    green: isActive ? 'bg-green-100 text-green-700 border-green-200' : 'text-gray-600 hover:text-green-600 hover:bg-green-50',
    blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-200 ${colorClasses[color]} ${
        isActive ? 'border-current' : 'border-gray-200 hover:border-current'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
          isActive ? 'bg-white/70' : 'bg-gray-100'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
};

const MaintenancePageV2: React.FC = () => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  
  // State
  const [activeView, setActiveView] = useState<'overview' | 'list' | 'calendar'>('overview');
  const [filters, setFilters] = useState<MaintenanceFilters>({
    priorityFilter: 'all',
    searchTerm: ''
  });
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const assets = useMemo(() => getMockAssets(), []);
  const { filteredAndSortedItems, allMaintenanceItems } = useMaintenanceFiltering(assets, filters);
  const stats = useMaintenanceStats(assets);

  // Selection
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

  // Bulk operations
  const { operationState, clearOperationState } = useBulkOperations();

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const { touchRef, isRefreshing, showRefreshIndicator } = usePullToRefresh(handleRefresh);

  // Filter handlers
  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  }, []);

  const handlePriorityFilter = useCallback((priority: MaintenanceFilters['priorityFilter']) => {
    setFilters(prev => ({ ...prev, priorityFilter: priority }));
  }, []);

  // Stats calculations
  const priorityStats = useMemo(() => {
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    allMaintenanceItems.forEach(item => {
      counts[item.priority]++;
    });

    return counts;
  }, [allMaintenanceItems]);

  const overdueItems = useMemo(() => {
    return allMaintenanceItems.filter(item => 
      item.daysOverdue && item.daysOverdue > 0
    ).length;
  }, [allMaintenanceItems]);

  const dueSoonItems = useMemo(() => {
    return allMaintenanceItems.filter(item => {
      if (!item.nextDueDate) return false;
      const daysUntilDue = Math.ceil((item.nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue > 0;
    }).length;
  }, [allMaintenanceItems]);

  // Action handlers
  const handleScheduleMaintenance = () => {
    setShowMaintenanceModal(true);
  };

  const handleMaintenanceComplete = (completedCount: number) => {
    setShowMaintenanceModal(false);
    clearSelection();
  };

  const handleExportMaintenance = () => {
    // Export functionality
    console.log('Export maintenance data');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MaintenanceSkeletonLoader />
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`font-bold text-gray-900 mb-2 ${
                deviceType === 'mobile' ? 'text-2xl' : 'text-3xl'
              }`}>
                <Wrench className="inline-block w-8 h-8 mr-3 text-blue-600" />
                Maintenance Management
              </h1>
              <p className="text-gray-600">
                Monitor, schedule, and track equipment maintenance across your facility
              </p>
            </div>
            
            {deviceType !== 'mobile' && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportMaintenance}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={handleScheduleMaintenance}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'list', label: 'List View', icon: Eye },
              { id: 'calendar', label: 'Calendar', icon: Calendar }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as typeof activeView)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeView === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {deviceType === 'mobile' ? '' : label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Overdue Items"
                value={overdueItems}
                subtitle="Require immediate attention"
                icon={AlertTriangle}
                iconColor="text-red-600"
                bgColor="bg-white border-l-4 border-red-500"
                onClick={() => {
                  setFilters({ priorityFilter: 'all', searchTerm: '' });
                  setActiveView('list');
                }}
              />
              <StatCard
                title="Due Soon"
                value={dueSoonItems}
                subtitle="Due within 7 days"
                icon={Clock}
                iconColor="text-orange-600"
                bgColor="bg-white border-l-4 border-orange-500"
                onClick={() => setActiveView('list')}
              />
              <StatCard
                title="Total Items"
                value={allMaintenanceItems.length}
                subtitle="All maintenance items"
                icon={Settings}
                iconColor="text-blue-600"
                bgColor="bg-white border-l-4 border-blue-500"
                onClick={() => setActiveView('list')}
              />
              <StatCard
                title="Completed This Month"
                value={42}
                subtitle="On-time completion rate"
                icon={CheckCircle2}
                iconColor="text-green-600"
                bgColor="bg-white border-l-4 border-green-500"
              />
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Priority Breakdown
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(priorityStats).map(([priority, count]) => {
                  const colorConfig = PRIORITY_COLOR_MAP[priority as keyof typeof PRIORITY_COLOR_MAP];
                  return (
                    <div
                      key={priority}
                      className={`${colorConfig.bg} ${colorConfig.darkBg} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200`}
                      onClick={() => {
                        handlePriorityFilter(priority as MaintenanceFilters['priorityFilter']);
                        setActiveView('list');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${colorConfig.text} ${colorConfig.darkText} capitalize`}>
                            {priority}
                          </p>
                          <p className={`text-2xl font-bold ${colorConfig.text} ${colorConfig.darkText}`}>
                            {count}
                          </p>
                        </div>
                        <AlertTriangle className={`w-5 h-5 ${colorConfig.icon}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Maintenance Activity
                </h2>
                <button
                  onClick={() => setActiveView('list')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {filteredAndSortedItems.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.priority === 'critical' ? 'bg-red-500' :
                        item.priority === 'high' ? 'bg-orange-500' :
                        item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={getPriorityBadge(item.priority, 'small')}>
                        {item.priority}
                      </span>
                      {item.daysOverdue && item.daysOverdue > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          {item.daysOverdue} days overdue
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {activeView === 'list' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search maintenance items..."
                    value={filters.searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full lg:w-80 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Priority Filters */}
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    label="All"
                    count={allMaintenanceItems.length}
                    isActive={filters.priorityFilter === 'all'}
                    onClick={() => handlePriorityFilter('all')}
                  />
                  <FilterButton
                    label="Critical"
                    count={priorityStats.critical}
                    isActive={filters.priorityFilter === 'critical'}
                    onClick={() => handlePriorityFilter('critical')}
                    color="red"
                  />
                  <FilterButton
                    label="High"
                    count={priorityStats.high}
                    isActive={filters.priorityFilter === 'high'}
                    onClick={() => handlePriorityFilter('high')}
                    color="orange"
                  />
                  <FilterButton
                    label="Medium"
                    count={priorityStats.medium}
                    isActive={filters.priorityFilter === 'medium'}
                    onClick={() => handlePriorityFilter('medium')}
                    color="yellow"
                  />
                  <FilterButton
                    label="Low"
                    count={priorityStats.low}
                    isActive={filters.priorityFilter === 'low'}
                    onClick={() => handlePriorityFilter('low')}
                    color="green"
                  />
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {filteredAndSortedItems.length} of {allMaintenanceItems.length} maintenance items
                  {filters.searchTerm && (
                    <span> for "{filters.searchTerm}"</span>
                  )}
                  {filters.priorityFilter !== 'all' && (
                    <span> with {filters.priorityFilter} priority</span>
                  )}
                </p>
              </div>
            </div>

            {/* Maintenance List */}
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
          </div>
        )}

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Calendar View Coming Soon
              </h3>
              <p className="text-gray-500">
                Visual calendar interface for maintenance scheduling will be available in the next update.
              </p>
            </div>
          </div>
        )}

        {/* Floating Action Button for Mobile */}
        {deviceType === 'mobile' && (
          <button
            onClick={handleScheduleMaintenance}
            className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors duration-200 z-50"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Bulk Action Bar */}
        {hasSelection && (
          <MaintenanceBulkActionBar
            selectedCount={selectedCount}
            selectedAssets={selectedMaintenanceItems.map(item => item.asset)}
            onScheduleMaintenance={handleScheduleMaintenance}
            onClearSelection={clearSelection}
          />
        )}

        {/* Modals */}
        {showMaintenanceModal && (
          <MaintenanceCarouselModal
            isOpen={showMaintenanceModal}
            onClose={() => setShowMaintenanceModal(false)}
            selectedAssets={selectedMaintenanceItems.map(item => item.asset)}
            onComplete={handleMaintenanceComplete}
          />
        )}

        {/* Notifications */}
        {operationState.message && (
          <NotificationToast
            message={operationState.message}
            type={operationState.type}
            onClose={clearOperationState}
          />
        )}
      </div>
    </div>
  );
};

export default MaintenancePageV2;
