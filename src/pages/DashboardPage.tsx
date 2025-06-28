import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  CheckCircle, 
  ShoppingCart, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  Wrench,
  FileText,
  BookOpen
} from 'lucide-react';
import StatCard from '../components/Dashboard/StatCard';
import EmptyStateCard from '../components/Dashboard/EmptyStateCard';
import OnboardingCard from '../components/Dashboard/OnboardingCard';
import RecentActivityCard from '../components/Dashboard/RecentActivityCard';
import { mockAssets } from '../data/mockData';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Calculate dashboard metrics
  const totalEquipment = mockAssets.length;
  
  const upcomingMaintenance = mockAssets.filter(asset => {
    if (asset.wearComponents.length === 0) return false;
    
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return asset.wearComponents.some(component => {
      if (!component.lastReplaced || !component.recommendedReplacementInterval) return false;
      
      const lastReplacedDate = new Date(component.lastReplaced);
      const intervalMonths = parseInt(component.recommendedReplacementInterval.split(' ')[0]);
      const nextDueDate = new Date(lastReplacedDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);
      
      return nextDueDate >= today && nextDueDate <= oneWeekFromNow;
    });
  }).length;

  const recentMaintenance = mockAssets.filter(asset => {
    if (!asset.lastMaintenance) return false;
    
    const lastMaintenanceDate = new Date(asset.lastMaintenance);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return lastMaintenanceDate >= oneWeekAgo;
  }).length;

  // Mock data for open orders (would come from NetSuite integration)
  const openOrders = 3;

  // Mock recent activities
  const recentActivities = [
    {
      id: '1',
      type: 'maintenance' as const,
      title: 'Routine Maintenance Completed',
      description: 'Replaced air filter and checked pressure levels',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      asset: 'Centrifugal Pump Model X',
      user: 'John Smith'
    },
    {
      id: '2',
      type: 'order' as const,
      title: 'Parts Order Shipped',
      description: 'Gasket set and bearing assembly en route',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      asset: 'Heat Exchanger T20-BFG',
      user: 'IPEC Parts Dept'
    },
    {
      id: '3',
      type: 'inspection' as const,
      title: 'Safety Inspection Scheduled',
      description: 'Annual pressure vessel inspection due next week',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      asset: 'Compressor GA-75VSD+',
      user: 'Safety Team'
    }
  ];

  // Onboarding steps
  const onboardingSteps = [
    {
      id: 'equipment-status',
      title: 'Log Current Equipment Status',
      description: 'Update the current operational status of your equipment',
      completed: false,
      action: () => navigate('/assets')
    },
    {
      id: 'maintenance-schedules',
      title: 'Set Up Maintenance Schedules',
      description: 'Configure preventive maintenance schedules for critical equipment',
      completed: true,
      action: () => navigate('/maintenance')
    },
    {
      id: 'notifications',
      title: 'Configure Notifications',
      description: 'Set up alerts for maintenance due dates and critical issues',
      completed: false,
      action: () => navigate('/notifications')
    }
  ];

  const handleGetRecommendations = () => {
    navigate('/maintenance?tab=recommendations');
  };

  const handleLogMaintenance = () => {
    navigate('/maintenance?tab=log');
  };

  const handleSetupPrevention = () => {
    navigate('/maintenance?tab=preventive');
  };

  const handleViewEquipment = () => {
    navigate('/assets');
  };

  const handleViewMaintenance = () => {
    navigate('/maintenance');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleViewActivity = () => {
    navigate('/activity');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AcmePump Solutions Equipment Portal
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{totalEquipment} total equipment units</span>
                <span>•</span>
                <span>Last login: Today at 9:24 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Card */}
        {showOnboarding && (
          <div className="mb-8">
            <OnboardingCard 
              steps={onboardingSteps}
              onDismiss={() => setShowOnboarding(false)}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Equipment"
            value={totalEquipment}
            subtitle="Active units"
            icon={Package}
            iconColor="text-blue-600"
            trend={{
              value: 5,
              isPositive: true,
              label: "vs last month"
            }}
            action={{
              label: "View Equipment",
              onClick: handleViewEquipment
            }}
          />

          {upcomingMaintenance > 0 ? (
            <StatCard
              title="Maintenance This Week"
              value={upcomingMaintenance}
              subtitle="Units requiring attention"
              icon={Calendar}
              iconColor="text-orange-600"
              action={{
                label: "Schedule Now",
                onClick: handleViewMaintenance
              }}
            />
          ) : (
            <EmptyStateCard
              title="No maintenance scheduled?"
              description="Let's fix that."
              icon={Calendar}
              iconColor="text-orange-600"
              actionLabel="Get Recommendations"
              onAction={handleGetRecommendations}
            />
          )}

          {recentMaintenance > 0 ? (
            <StatCard
              title="Recent Maintenance"
              value={recentMaintenance}
              subtitle="Completed last week"
              icon={CheckCircle}
              iconColor="text-green-600"
              trend={{
                value: 12,
                isPositive: true,
                label: "vs previous week"
              }}
              action={{
                label: "View History",
                onClick: handleViewMaintenance
              }}
            />
          ) : (
            <EmptyStateCard
              title="Track completed work"
              description="Build maintenance history"
              icon={CheckCircle}
              iconColor="text-green-600"
              actionLabel="Log Maintenance"
              onAction={handleLogMaintenance}
            />
          )}

          {openOrders > 0 ? (
            <StatCard
              title="Open Orders"
              value={openOrders}
              subtitle="Parts orders in progress"
              icon={ShoppingCart}
              iconColor="text-purple-600"
              action={{
                label: "View Orders",
                onClick: handleViewOrders
              }}
            />
          ) : (
            <EmptyStateCard
              title="Your equipment is operating"
              description="Within normal parameters"
              icon={Shield}
              iconColor="text-green-600"
              actionLabel="Set Up Prevention"
              onAction={handleSetupPrevention}
            />
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivityCard
              activities={recentActivities}
              onViewAll={handleViewActivity}
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/maintenance?action=schedule')}
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-200">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Schedule Maintenance</p>
                    <p className="text-xs text-gray-500">Plan upcoming service work</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/orders?action=new')}
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors duration-200">
                    <ShoppingCart className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order Parts</p>
                    <p className="text-xs text-gray-500">Request spare parts</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/assets?filter=critical')}
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors duration-200">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Critical Equipment</p>
                    <p className="text-xs text-gray-500">Review high-priority assets</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/documentation')}
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors duration-200">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">View Documentation</p>
                    <p className="text-xs text-gray-500">Manuals and technical docs</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;