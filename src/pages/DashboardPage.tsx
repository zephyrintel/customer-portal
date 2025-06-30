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
import MaintenanceSchedulingCard from '../components/Dashboard/MaintenanceSchedulingCard';
import AssetStatusCard from '../components/Dashboard/AssetStatusCard';
import EmptyStateCard from '../components/Dashboard/EmptyStateCard';
import OnboardingCard from '../components/Dashboard/OnboardingCard';
import RecentActivityCard from '../components/Dashboard/RecentActivityCard';
import { mockAssets } from '../data/mockData';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Calculate dashboard metrics
  const totalEquipment = mockAssets.length;
  
  // Calculate maintenance scheduling percentage
  const assetsWithMaintenance = mockAssets.filter(asset => {
    // Mock logic: Assets with recent maintenance or scheduled maintenance
    // In real app, this would check for future scheduled maintenance dates
    return asset.lastMaintenance !== null || asset.wearComponents.some(component => 
      component.lastReplaced && component.recommendedReplacementInterval
    );
  }).length;

  // Calculate assets needing status updates (mock logic - in real app, track last update timestamps)
  const assetsNeedingUpdate = mockAssets.filter(asset => {
    // Mock: Assets without recent maintenance or status updates need attention
    if (!asset.lastMaintenance) return true;
    
    const lastMaintenance = new Date(asset.lastMaintenance);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return lastMaintenance < thirtyDaysAgo;
  }).length;

  // Mock: Days since last status update
  const lastUpdateDays = 3;

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

  const handleScheduleMaintenance = () => {
    navigate('/maintenance?action=schedule');
  };

  const handleUpdateAssets = () => {
    navigate('/assets?action=update-status');
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

        {/* Stats Grid - Now 3 columns instead of 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
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

          <MaintenanceSchedulingCard
            totalAssets={totalEquipment}
            assetsWithMaintenance={assetsWithMaintenance}
            onScheduleMaintenance={handleScheduleMaintenance}
          />

          <AssetStatusCard
            totalAssets={totalEquipment}
            assetsNeedingUpdate={assetsNeedingUpdate}
            lastUpdateDays={lastUpdateDays}
            onUpdateAssets={handleUpdateAssets}
          />
        </div>

        {/* Secondary Stats Row - Open Orders gets its own prominent space */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
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

          {/* Additional metric cards can go here as the system grows */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-gray-50 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">System Health</h3>
              </div>
              
              <div className="space-y-1 mb-4">
                <p className="text-3xl font-bold text-gray-900">98%</p>
                <p className="text-sm text-gray-500">Overall uptime</p>
              </div>
              
              <div className="flex items-center justify-center mb-4">
                <span className="text-sm font-medium text-green-600">
                  Excellent performance
                </span>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 text-center">
              <button
                onClick={() => navigate('/assets?view=performance')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                View Details
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-gray-50 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Documentation</h3>
              </div>
              
              <div className="space-y-1 mb-4">
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-500">Documents available</p>
              </div>
              
              <div className="flex items-center justify-center mb-4">
                <span className="text-sm font-medium text-blue-600">
                  Manuals & guides ready
                </span>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 text-center">
              <button
                onClick={() => navigate('/documentation')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Browse Docs
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity - Takes up more space */}
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