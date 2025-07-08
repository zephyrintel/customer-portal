import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  FileText,
  Shield
} from 'lucide-react';
import StatCard from '../components/Dashboard/StatCard';
import MaintenanceSchedulingCard from '../components/Dashboard/MaintenanceSchedulingCard';
import AssetStatusCard from '../components/Dashboard/AssetStatusCard';
import PartsEngagementCard from '../components/Dashboard/PartsEngagementCard';
import EmptyStateCard from '../components/Dashboard/EmptyStateCard';
import OnboardingCard from '../components/Dashboard/OnboardingCard';
import RecentActivityCard from '../components/Dashboard/RecentActivityCard';
import { getMockAssets, getMockOrders } from '../data/mockData';
import { calculateDashboardMetrics } from '../utils/dashboardMetrics';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Calculate dashboard metrics using utility function with memoization
  const metrics = useMemo(() => {
    const assets = getMockAssets();
    const orders = getMockOrders();
    return calculateDashboardMetrics(assets, orders);
  }, []);

  // Mock recent activities - in production, this would come from an API
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

  // Onboarding steps configuration
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

  // Navigation handlers - centralized for reusability
  const navigationHandlers = {
    viewEquipment: () => navigate('/assets'),
    scheduleMaintenance: () => navigate('/maintenance?action=schedule'),
    updateAssets: () => {
      // Filter to show assets that are not in operation (Not In Use + Not Commissioned + Unknown)
      navigate('/assets?search=not in use OR not commissioned OR unknown');
    },
    reviewPartsHistory: () => {
      // Filter to show assets with no parts activity
      // This will be handled by the search system to identify assets with wear components but no orders/replacements
      navigate('/assets?filter=no-parts-activity');
    },
    viewOrders: () => navigate('/orders'),
    viewDocumentation: () => navigate('/documentation'),
    viewActivity: () => navigate('/activity'),
    setupPrevention: () => navigate('/maintenance?tab=preventive')
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
                <span>{metrics.totalEquipment} total equipment units</span>
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

        {/* Main Stats Grid - 4 columns with equal height */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Equipment"
            value={metrics.totalEquipment}
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
              onClick: navigationHandlers.viewEquipment
            }}
          />

          <MaintenanceSchedulingCard
            totalAssets={metrics.totalEquipment}
            assetsWithMaintenance={metrics.assetsWithMaintenance}
            onScheduleMaintenance={navigationHandlers.scheduleMaintenance}
          />

          <AssetStatusCard
            totalAssets={metrics.totalEquipment}
            assetsNotOperating={metrics.assetsNotOperating}
            onUpdateAssets={navigationHandlers.updateAssets}
          />

          <PartsEngagementCard
            totalAssets={metrics.totalEquipment}
            assetsWithNoPartsActivity={metrics.assetsWithNoPartsActivity}
            onViewOpportunities={navigationHandlers.reviewPartsHistory}
          />
        </div>

        {/* Secondary Stats Row - 2 columns for better spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {metrics.openOrders > 0 ? (
            <StatCard
              title="Open Orders"
              value={metrics.openOrders}
              subtitle="Parts orders in progress"
              icon={ShoppingCart}
              iconColor="text-purple-600"
              action={{
                label: "View Orders",
                onClick: navigationHandlers.viewOrders
              }}
            />
          ) : (
            <EmptyStateCard
              title="Your equipment is operating"
              description="Within normal parameters"
              icon={Shield}
              iconColor="text-green-600"
              actionLabel="Set Up Prevention"
              onAction={navigationHandlers.setupPrevention}
            />
          )}

          <StatCard
            title="Documentation"
            value={metrics.totalDocuments}
            subtitle="Documents available"
            icon={FileText}
            iconColor="text-indigo-600"
            action={{
              label: "Browse Docs",
              onClick: navigationHandlers.viewDocumentation
            }}
          />
        </div>

        {/* Recent Activity - Full width for better content display */}
        <div className="mb-8">
          <RecentActivityCard
            activities={recentActivities}
            onViewAll={navigationHandlers.viewActivity}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;