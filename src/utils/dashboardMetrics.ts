import { Asset, Order } from '../types/Asset';

export interface DashboardMetrics {
  totalEquipment: number;
  assetsWithMaintenance: number;
  assetsNotOperating: number;
  assetsWithNoPartsActivity: number;
  openOrders: number;
  totalDocuments: number;
  operatingPercentage: number;
  maintenancePercentage: number;
  partsEngagementPercentage: number;
}

export function calculateDashboardMetrics(assets: Asset[], orders: Order[]): DashboardMetrics {
  const totalEquipment = assets.length;
  
  // Calculate maintenance scheduling percentage
  const assetsWithMaintenance = assets.filter(asset => {
    // Assets with recent maintenance or scheduled maintenance
    return asset.lastMaintenance !== null || asset.wearComponents.some(component => 
      component.lastReplaced && component.recommendedReplacementInterval
    );
  }).length;

  // Calculate assets not operating (Not In Use + Not Commissioned + Unknown)
  // Unknown status should NOT count as operating since we don't know if they're actually running
  const assetsNotOperating = assets.filter(asset => {
    return asset.currentStatus === 'Not In Use' || 
           asset.currentStatus === 'Not Commissioned' || 
           asset.currentStatus === 'Unknown';
  }).length;

  // Calculate assets with no parts activity
  const assetsWithNoPartsActivity = assets.filter(asset => {
    // Check if asset has wear components but no orders or replacements
    const hasWearComponents = asset.wearComponents.length > 0;
    if (!hasWearComponents) return false;
    
    // Check if any wear components have been replaced
    const hasReplacements = asset.wearComponents.some(component => component.lastReplaced);
    
    // Check if asset has any orders
    const hasOrders = orders.some(order => order.assetId === asset.id);
    
    // Asset has no parts activity if it has wear components but no replacements or orders
    return !hasReplacements && !hasOrders;
  }).length;

  // Count open orders
  const openOrders = orders.filter(order => 
    ['pending', 'approved', 'shipped'].includes(order.status)
  ).length;

  // Count total documentation across all assets
  const totalDocuments = assets.reduce((total, asset) => total + asset.documentation.length, 0);

  // Calculate percentages
  const operatingPercentage = totalEquipment > 0 ? Math.round(((totalEquipment - assetsNotOperating) / totalEquipment) * 100) : 0;
  const maintenancePercentage = totalEquipment > 0 ? Math.round((assetsWithMaintenance / totalEquipment) * 100) : 0;
  const partsEngagementPercentage = totalEquipment > 0 ? Math.round(((totalEquipment - assetsWithNoPartsActivity) / totalEquipment) * 100) : 0;

  return {
    totalEquipment,
    assetsWithMaintenance,
    assetsNotOperating,
    assetsWithNoPartsActivity,
    openOrders,
    totalDocuments,
    operatingPercentage,
    maintenancePercentage,
    partsEngagementPercentage
  };
}

export function getStatusType(value: number, thresholds: { good: number; warning: number }): 'success' | 'warning' | 'error' {
  if (value >= thresholds.good) return 'success';
  if (value >= thresholds.warning) return 'warning';
  return 'error';
}

export function getInverseStatusType(value: number, thresholds: { good: number; warning: number }): 'success' | 'warning' | 'error' {
  if (value === 0) return 'success';
  if (value <= thresholds.warning) return 'warning';
  return 'error';
}