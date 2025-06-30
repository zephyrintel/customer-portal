import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  CheckCircle, 
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
import { mockAssets, mockOrders } from '../data/mockData';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Calculate dashboard metrics using reusable functions
  const metrics = calculateDashboardMetrics(mockAssets, mockOrders);

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
    updateAssets: () => navigate('/assets?action=update-status'),
    reviewPartsHistory: () => navigate('/assets?filter=no-parts-activity'),
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

        {/* Main Stats Grid - 4 columns */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

// Extracted utility function for calculating dashboard metrics
function calculateDashboardMetrics(assets: typeof mockAssets, orders: typeof mockOrders) {
  const totalEquipment = assets.length;
  
  // Calculate maintenance scheduling percentage
  const assetsWithMaintenance = assets.filter(asset => {
    // Assets with recent maintenance or scheduled maintenance
    return asset.lastMaintenance !== null || asset.wearComponents.some(component => 
      component.lastReplaced && component.recommendedReplacementInterval
    );
  }).length;

  // Calculate assets not operating (Not In Use + Not Commissioned)
  const assetsNotOperating = assets.filter(asset => {
    return asset.currentStatus === 'Not In Use' || asset.currentStatus === 'Not Commissioned';
  }).length;

  // Calculate assets with no parts activity - this is concerning from plant perspective
  const assetsWithNoPartsActivity = assets.filter(asset => {
    // Check if asset has wear components but no orders or replacements
    const hasWearComponents = asset.wearComponents.length > 0;
    if (!hasWearComponents) return false;
    
    // Check if any wear components have been replaced
    const hasReplacements = asset.wearComponents.some(component => component.lastReplaced);
    
    // Check if asset has any orders
    const hasOrders = orders.some(order => order.assetId === asset.id);
    
    // Asset has no parts activity if it has wear components but no replacements or orders
    // This could indicate neglected maintenance or missed preventive care opportunities
    return !hasReplacements && !hasOrders;
  }).length;

  // Count open orders
  const openOrders = orders.filter(order => 
    ['pending', 'approved', 'shipped'].includes(order.status)
  ).length;

  // Count total documentation across all assets
  const totalDocuments = assets.reduce((total, asset) => total + asset.documentation.length, 0);

  return {
    totalEquipment,
    assetsWithMaintenance,
    assetsNotOperating,
    assetsWithNoPartsActivity,
    openOrders,
    totalDocuments
  };
}

export default DashboardPage;