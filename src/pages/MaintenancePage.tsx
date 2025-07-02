import React, { useState, useMemo } from 'react';
import { Calendar, AlertTriangle, Clock, CheckCircle, Wrench, User, Package, Filter, Search, Plus } from 'lucide-react';
import { mockAssets } from '../data/mockData';
import { Asset } from '../types/Asset';
import MaintenanceSchedulingModal from '../components/Maintenance/MaintenanceSchedulingModal';

interface MaintenanceItem {
  id: string;
  name: string;
  status: string;
  lastMaint: string | null;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  equipmentType: string;
  location: string;
  asset: Asset;
  daysOverdue?: number;
  nextDueDate?: Date;
}

const MaintenancePage: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'needs-attention' | 'scheduled' | 'history'>('needs-attention');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Generate prioritized maintenance list from assets
  const maintenanceItems = useMemo((): MaintenanceItem[] => {
    const items: MaintenanceItem[] = [];

    mockAssets.forEach(asset => {
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

      asset.wearComponents.forEach(component => {
        if (component.lastReplaced && component.recommendedReplacementInterval) {
          const lastReplacedDate = new Date(component.lastReplaced);
          const intervalMonths = parseInt(component.recommendedReplacementInterval.split(' ')[0]);
          const componentNextDueDate = new Date(lastReplacedDate);
          componentNextDueDate.setMonth(componentNextDueDate.getMonth() + intervalMonths);
          
          const daysUntilDue = Math.ceil((componentNextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue < 0) {
            hasOverdueMaintenance = true;
            const overdueDays = Math.abs(daysUntilDue);
            maxOverdueDays = Math.max(maxOverdueDays, overdueDays);
            reasons.push(`${component.description} overdue by ${overdueDays} days`);
          } else if (daysUntilDue <= 30) {
            hasDueSoonMaintenance = true;
            reasons.push(`${component.description} due in ${daysUntilDue} days`);
            if (!earliestDueDate || componentNextDueDate < earliestDueDate) {
              earliestDueDate = componentNextDueDate;
            }
          }
        }
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
          reason: reasons.join('; '),
          priority,
          equipmentType: asset.equipmentType,
          location: `${asset.location.facility} - ${asset.location.area}`,
          asset,
          daysOverdue,
          nextDueDate
        });
      }
    });

    // Sort by priority (critical first, then by days overdue)
    return items.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by days overdue (most overdue first)
      if (a.daysOverdue && b.daysOverdue) {
        return b.daysOverdue - a.daysOverdue;
      }
      if (a.daysOverdue) return -1;
      if (b.daysOverdue) return 1;
      
      return 0;
    });
  }, []);

  // Filter maintenance items
  const filteredItems = useMemo(() => {
    return maintenanceItems.filter(item => {
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipmentType.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesPriority && matchesSearch;
    });
  }, [maintenanceItems, priorityFilter, searchTerm]);

  const handleScheduleNow = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const handleScheduleComplete = () => {
    setShowModal(false);
    setSelectedAsset(null);
    // In a real app, you would refresh the data here
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'needs-attention', label: 'Needs Attention', count: filteredItems.length },
    { id: 'scheduled', label: 'Scheduled', count: 0 },
    { id: 'history', label: 'History', count: 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Scheduler</h1>
              <p className="text-gray-600">Manage preventive and corrective maintenance for your equipment</p>
            </div>
            
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Maintenance
            </button>
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
                  Showing {filteredItems.length} of {maintenanceItems.length} items
                </div>
              </div>

              {/* Maintenance Items Table */}
              {filteredItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Equipment
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg mr-3">{getEquipmentTypeIcon(item.equipmentType)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.location}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                              {getPriorityIcon(item.priority)}
                              <span className="ml-1 capitalize">{item.priority}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{item.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(item.lastMaint)}</div>
                            {item.daysOverdue && (
                              <div className="text-xs text-red-600 font-medium">
                                {item.daysOverdue} days overdue
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={item.reason}>
                              {item.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleScheduleNow(item.asset)}
                              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

        {/* Maintenance Scheduling Modal */}
        {selectedAsset && (
          <MaintenanceSchedulingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            asset={selectedAsset}
            onSchedule={handleScheduleComplete}
          />
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;