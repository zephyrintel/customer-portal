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
  Download,
  ChevronLeft} from 'lucide-react';

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
import MaintenanceWorkflowModal from '../components/Maintenance/MaintenanceWorkflowModal';
import MaintenanceHistorySection, { HistoryRecordItem } from '../components/Maintenance/Sections/MaintenanceHistorySection';

// Utils
import { PRIORITY_COLOR_MAP } from '../utils/badgeUtils';

// Types
import type { MaintenanceItem, MaintenanceFilters } from '../types/Maintenance';
import type { Asset } from '../types/Asset';

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
  const [showBackfillModal, setShowBackfillModal] = useState(false);
  const [backfillDate, setBackfillDate] = useState<string>('');
  const [backfillNotes, setBackfillNotes] = useState<string>('');
  const [backfillFiles, setBackfillFiles] = useState<FileList | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showNoHistoryModal, setShowNoHistoryModal] = useState(false);
  const [selectedAssetForBackfill, setSelectedAssetForBackfill] = useState<Asset | null>(null);
  const [noHistorySort, setNoHistorySort] = useState<'name' | 'serial' | 'type' | 'status' | 'location'>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState<boolean>(true);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecordItem[]>(() => {
    try {
      const raw = localStorage.getItem('__maintenance_history__');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [] as HistoryRecordItem[];
    }
  });

  // Local toast for ad-hoc notifications
  const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Data
  const [assets, setAssets] = useState<Asset[]>(() => {
    const base = getMockAssets();
    try {
      const raw = localStorage.getItem('__asset_overrides__');
      if (raw) {
        const overrides = JSON.parse(raw) as Record<string, Partial<Asset>>;
        return base.map(a => overrides[a.id] ? { ...a, ...overrides[a.id] } : a);
      }
    } catch {}
    return base;
  });
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

  // Overdue based on PM plan nextDue vs lastMaintenance
  const overdueAssetsCount = useMemo(() => {
    const today = new Date();
    return assets.filter(a => {
      const plan = a.maintenancePlan;
      if (!plan || !plan.isActive || !plan.nextDue) return false;
      const nextDue = new Date(plan.nextDue);
      if (isNaN(nextDue.getTime())) return false;
      const lastMaint = a.lastMaintenance ? new Date(a.lastMaintenance) : null;
      const cleared = lastMaint ? lastMaint.getTime() >= nextDue.getTime() : false;
      return nextDue.getTime() < today.getTime() && !cleared;
    }).length;
  }, [assets]);

  // Assets missing a last maintenance date
  const noHistoryAssets = useMemo(() => assets.filter(a => !a.lastMaintenance), [assets]);
  const sortedNoHistoryAssets = useMemo(() => {
    const arr = [...noHistoryAssets];
    arr.sort((a, b) => {
      switch (noHistorySort) {
        case 'serial':
          return a.serialNumber.localeCompare(b.serialNumber);
        case 'type':
          return a.equipmentType.localeCompare(b.equipmentType) || a.brand.localeCompare(b.brand);
        case 'status':
          return a.currentStatus.localeCompare(b.currentStatus);
        case 'location':
          return a.location.facility.localeCompare(b.location.facility) || a.location.area.localeCompare(b.location.area);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return arr;
  }, [noHistoryAssets, noHistorySort]);
  const missingLastMaintCount = noHistoryAssets.length;

  // Action handlers
  const handleScheduleMaintenance = () => {
    setShowMaintenanceModal(true);
  };

  const handleMaintenanceComplete = (completedCount: number) => {
    setShowMaintenanceModal(false);
    clearSelection();
  };

  const handleStartGuidedMaintenance = () => {
    setShowWorkflowModal(true);
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
        {/* No History Modal */}
        {showNoHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{missingLastMaintCount} assets with no maintenance history</h3>
                <div className="flex items-center space-x-3">
                  {missingLastMaintCount > 8 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <label className="text-gray-600">Sort by</label>
                      <select
                        value={noHistorySort}
                        onChange={(e) => setNoHistorySort(e.target.value as any)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="name">Name</option>
                        <option value="serial">Serial</option>
                        <option value="type">Type</option>
                        <option value="status">Status</option>
                        <option value="location">Location</option>
                      </select>
                    </div>
                  )}
                  <button onClick={() => setShowNoHistoryModal(false)} className="px-3 py-1.5 rounded-md border border-gray-300 text-sm">Close</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedNoHistoryAssets.length === 0 ? (
                  <div className="col-span-full">
                    <div className="flex flex-col items-center justify-center text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10">
                      <CheckCircle2 className="w-10 h-10 text-green-600 mb-2" />
                      <h4 className="text-base font-semibold text-gray-900 mb-1">All set!</h4>
                      <p className="text-sm text-gray-600 mb-4">All assets have a recorded maintenance history.</p>
                      <button onClick={() => setShowNoHistoryModal(false)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">Close</button>
                    </div>
                  </div>
                ) : (
                  sortedNoHistoryAssets.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelectedAssetForBackfill(a);
                        setShowNoHistoryModal(false);
                        setShowBackfillModal(true);
                      }}
                      className="group text-left border border-gray-200 rounded-xl p-4 bg-white shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 hover:border-blue-300"
                      aria-label={`Backfill maintenance for ${a.name}`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 truncate pr-2" title={a.name}>{a.name}</h4>
                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs text-gray-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-600">Serial</span>
                          <span className="font-mono text-gray-900">{a.serialNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-600">Type • Brand</span>
                          <span className="text-gray-900">{a.equipmentType} • {a.brand}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-600">Location</span>
                          <span className="text-gray-900">{a.location.facility} • {a.location.area}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-600">Status</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-700 capitalize border border-blue-200">{a.currentStatus.toLowerCase()}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Backfill Modal (retained, not triggered by the card click) */}
        {showBackfillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => { setShowBackfillModal(false); setShowNoHistoryModal(true); }} className="inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <h3 className="text-lg font-semibold text-gray-900">Backfill Last Maintenance{selectedAssetForBackfill ? ` — ${selectedAssetForBackfill.name}` : ''}</h3>
                <div />
              </div>
              <p className="text-sm text-gray-600 mb-4">Enter the last known maintenance date and include any documentation or notes to enrich your records.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance Date</label>
                  <input type="date" value={backfillDate} onChange={e => setBackfillDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={backfillNotes} onChange={e => setBackfillNotes(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="What was done? Any findings?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files (optional)</label>
                  <input type="file" multiple onChange={e => setBackfillFiles(e.target.files)} className="w-full" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <button onClick={() => { setShowBackfillModal(false); setShowNoHistoryModal(true); }} className="px-3 py-2 rounded-lg text-blue-600 hover:text-blue-700">Back to list</button>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      if (!selectedAssetForBackfill || !backfillDate) {
                        setShowBackfillModal(false);
                        setSelectedAssetForBackfill(null);
                        return;
                      }
                      // Update local state
                      setAssets(prev => prev.map(a =>
                        a.id === selectedAssetForBackfill.id
                          ? {
                              ...a,
                              lastMaintenance: backfillDate,
                              notes: [
                                ...a.notes,
                                {
                                  date: new Date().toISOString(),
                                  text: backfillNotes || 'Backfilled last maintenance date',
                                  type: 'maintenance',
                                  source: 'user'
                                }
                              ]
                            }
                          : a
                      ));
                      // Persist to localStorage overrides
                      try {
                        const raw = localStorage.getItem('__asset_overrides__');
                        const overrides = raw ? JSON.parse(raw) : {};
                        overrides[selectedAssetForBackfill.id] = {
                          ...(overrides[selectedAssetForBackfill.id] || {}),
                          lastMaintenance: backfillDate
                        };
                        localStorage.setItem('__asset_overrides__', JSON.stringify(overrides));
                      } catch {}
                      setShowBackfillModal(false);
                      setSelectedAssetForBackfill(null);
                      setBackfillDate('');
                      setBackfillNotes('');
                      setBackfillFiles(null);
                      setLocalToast({ message: 'Maintenance history updated', type: 'success' });
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                  >
                    Save
                  </button>
                  <button onClick={() => { setShowBackfillModal(false); setSelectedAssetForBackfill(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
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
                  onClick={handleStartGuidedMaintenance}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Guided Maintenance
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
                title="Overdue Maintenance"
                value={overdueAssetsCount}
                subtitle="Scheduled date passed"
                icon={AlertTriangle}
                iconColor="text-red-600"
                bgColor="bg-white border-l-4 border-red-500"
                onClick={() => {
                  setActiveView('list');
                }}
              />
              <StatCard
                title="No maintenance history"
                value={missingLastMaintCount}
                subtitle={`${missingLastMaintCount} assets with no maintenance history`}
                icon={Clock}
                iconColor="text-orange-600"
                bgColor="bg-white border-l-4 border-orange-500"
                onClick={() => setShowNoHistoryModal(true)}
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
            <div className="bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between p-6 pb-2">
                <h2 className="text-lg font-semibold text-gray-900">Priority Breakdown</h2>
                <button
                  className="btn-touch touch-active inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg lg:hidden"
                  onClick={() => setIsPriorityOpen((v) => !v)}
                  aria-expanded={isPriorityOpen}
                  aria-controls="priority-breakdown"
                >
                  {isPriorityOpen ? 'Hide' : 'Show'}
                </button>
              </div>
              <div id="priority-breakdown" className={`p-6 pt-0 ${deviceType === 'mobile' && !isPriorityOpen ? 'hidden' : ''}`}>
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
            </div>

          </div>
        )}

        {/* List View */}
        {activeView === 'list' && (
          <div className="space-y-6">
{/* Filters */}
            <div className="bg-white rounded-xl shadow-sm">
              {/* Mobile collapsible header */}
              <div className="flex items-center justify-between p-4 lg:hidden">
                <h3 className="text-base font-semibold text-gray-900">Filters</h3>
                <button
                  className="btn-touch touch-active inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg"
                  onClick={() => setIsFiltersOpen((v) => !v)}
                  aria-expanded={isFiltersOpen}
                  aria-controls="maintenance-filters"
                >
                  {isFiltersOpen ? 'Hide' : 'Show'}
                </button>
              </div>

              <div id="maintenance-filters" className={`p-6 pt-0 lg:pt-6 ${deviceType === 'mobile' && !isFiltersOpen ? 'hidden' : ''}`}>
                <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  {/* Search */}
                  <div className="relative w-full lg:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search maintenance items..."
                      value={filters.searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="input-mobile w-full lg:w-80 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Maintenance History */}
        <div className="mt-6">
          <MaintenanceHistorySection records={historyRecords} onOpenRecord={() => {}} />
        </div>

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
        {showWorkflowModal && (
          <MaintenanceWorkflowModal
            isOpen={showWorkflowModal}
            onClose={() => setShowWorkflowModal(false)}
            assets={assets}
            selectedAssetId={selectedMaintenanceItems[0]?.asset.id}
            onComplete={({ historyRecord }) => {
              setShowWorkflowModal(false);
              setHistoryRecords(prev => [historyRecord, ...prev]);
            }}
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
        {localToast && (
          <NotificationToast
            message={localToast.message}
            type={localToast.type as 'success' | 'error'}
            durationMs={3000}
            onClose={() => setLocalToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MaintenancePageV2;
