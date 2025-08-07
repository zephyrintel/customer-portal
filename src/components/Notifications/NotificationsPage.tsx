import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Settings,
  Clock,
  Search
} from 'lucide-react';
import { NotificationRule, NotificationStats, NotificationHistory } from '../../types/Notification';
import NotificationRuleCard from './NotificationRuleCard';
import CreateNotificationModal from './CreateNotificationModal';
import NotificationStatsCards from './NotificationStatsCards';
import NotificationHistoryTable from './NotificationHistoryTable';

type TabType = 'rules' | 'history' | 'templates';

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotificationRules(mockRules);
      setNotificationHistory(mockHistory);
      setStats(mockStats);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleCreateRule = () => {
    setShowCreateModal(true);
  };

  const handleToggleRule = async (ruleId: string) => {
    setNotificationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
          : rule
      )
    );
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this notification rule?')) {
      setNotificationRules(prev => prev.filter(rule => rule.id !== ruleId));
    }
  };

  const filteredRules = notificationRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'rules', label: 'Notification Rules', icon: Bell, count: notificationRules.length },
    { id: 'history', label: 'History', icon: Clock, count: notificationHistory.length },
    { id: 'templates', label: 'Templates', icon: Settings, count: 3 }
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="w-8 h-8 mr-3 text-blue-600" />
            Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            Manage automated alerts and reminders for your equipment
          </p>
        </div>
        <button
          onClick={handleCreateRule}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && <NotificationStatsCards stats={stats} />}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'rules' && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notification rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Notification Rules */}
          <div className="space-y-4">
            {filteredRules.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No matching rules found' : 'No notification rules yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first notification rule to get started with automated alerts'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <button
                    onClick={handleCreateRule}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Create Your First Rule
                  </button>
                )}
              </div>
            ) : (
              filteredRules.map((rule) => (
                <NotificationRuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={handleToggleRule}
                  onDelete={handleDeleteRule}
                />
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <NotificationHistoryTable history={notificationHistory} />
      )}

      {activeTab === 'templates' && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Templates Coming Soon</h3>
          <p className="text-gray-600">
            Create and manage reusable notification templates
          </p>
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <CreateNotificationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={(rule) => {
            setNotificationRules(prev => [...prev, rule]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// Mock data (to be replaced with actual API calls)
const mockRules: NotificationRule[] = [
  {
    id: '1',
    name: 'Pump Maintenance Alert',
    description: 'Notify when pumps are due for maintenance',
    type: 'maintenance_due',
    status: 'active',
    condition: 'days_before',
    conditionValue: 7,
    assetIds: ['AST-001'],
    channels: ['email'],
    recipients: ['maintenance@company.com'],
    frequency: 'once',
    subject: 'Maintenance Alert for {{assetName}}',
    message: 'Your pump {{assetName}} is due for maintenance in {{days}} days.',
    includeAssetDetails: true,
    createdAt: '2025-06-01',
    createdBy: 'admin',
    updatedAt: '2025-06-01',
    nextTrigger: '2025-08-05T09:00:00Z'
  },
  {
    id: '2',
    name: 'Critical Equipment Status',
    description: 'Alert when critical equipment changes status',
    type: 'equipment_status',
    status: 'active',
    condition: 'when_status_changes',
    criticalityLevels: ['Critical'],
    channels: ['email', 'sms'],
    recipients: ['ops@company.com', '+1234567890'],
    frequency: 'once',
    subject: 'URGENT: {{assetName}} Status Change',
    message: 'Critical equipment {{assetName}} has changed status to {{newStatus}}.',
    includeAssetDetails: true,
    createdAt: '2025-06-15',
    createdBy: 'admin',
    updatedAt: '2025-07-01'
  },
  {
    id: '3',
    name: 'Parts Reorder Reminder',
    description: 'Notify when wear components are below reorder point',
    type: 'part_reorder',
    status: 'paused',
    condition: 'when_below_threshold',
    conditionValue: 5,
    channels: ['email'],
    recipients: ['purchasing@company.com'],
    frequency: 'daily',
    subject: 'Parts Reorder Required',
    message: 'The following parts are below reorder point: {{partsList}}',
    includeAssetDetails: false,
    createdAt: '2025-05-20',
    createdBy: 'admin',
    updatedAt: '2025-07-20'
  },
  {
    id: '4',
    name: 'Weekly Maintenance Summary',
    description: 'Weekly summary of upcoming maintenance',
    type: 'custom_reminder',
    status: 'active',
    condition: 'custom_schedule',
    channels: ['email'],
    recipients: ['team@company.com'],
    frequency: 'weekly',
    customSchedule: {
      startDate: '2025-07-01',
      cronExpression: '0 9 * * MON'
    },
    subject: 'Weekly Maintenance Summary',
    message: 'Here is your weekly maintenance summary for the upcoming week.',
    includeAssetDetails: true,
    createdAt: '2025-07-01',
    createdBy: 'admin',
    updatedAt: '2025-07-01',
    nextTrigger: '2025-08-05T09:00:00Z'
  },
  {
    id: '5',
    name: 'Overdue Maintenance Alert',
    description: 'Alert for maintenance that is overdue',
    type: 'maintenance_overdue',
    status: 'draft',
    condition: 'days_after',
    conditionValue: 1,
    channels: ['email', 'sms'],
    recipients: ['supervisor@company.com'],
    frequency: 'once',
    subject: 'OVERDUE: {{assetName}} Maintenance',
    message: 'Maintenance for {{assetName}} is now {{days}} days overdue.',
    includeAssetDetails: true,
    createdAt: '2025-07-25',
    createdBy: 'admin',
    updatedAt: '2025-07-25'
  }
];

const mockHistory: NotificationHistory[] = [
  {
    id: 'hist-1',
    ruleId: '1',
    ruleName: 'Pump Maintenance Alert',
    assetId: 'AST-001',
    assetName: 'Centrifugal Pump Model X',
    channel: 'email',
    recipient: 'user@example.com',
    subject: 'Maintenance Alert for Centrifugal Pump Model X',
    message: 'Your pump Centrifugal Pump Model X is due for maintenance in 7 days.',
    sentAt: '2025-07-30T10:30:00Z',
    status: 'sent'
  },
  {
    id: 'hist-2',
    ruleId: '1',
    ruleName: 'Pump Maintenance Alert',
    assetId: 'AST-002',
    assetName: 'Rotary Screw Compressor',
    channel: 'email',
    recipient: 'maintenance@company.com',
    subject: 'Maintenance Alert for Rotary Screw Compressor',
    message: 'Your compressor Rotary Screw Compressor is due for maintenance in 3 days.',
    sentAt: '2025-07-29T14:15:00Z',
    status: 'sent'
  }
];

const mockStats: NotificationStats = {
  totalRules: 5,
  activeRules: 4,
  sentToday: 10,
  sentThisWeek: 30,
  sentThisMonth: 100,
  failureRate: 2,
  averageDeliveryTime: 3500
};

export default NotificationsPage;


