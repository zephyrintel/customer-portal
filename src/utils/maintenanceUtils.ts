/**
 * Centralized maintenance calculation utilities
 */

import { WearComponent, Asset } from '../types/Asset';
import { daysBetween } from './dateUtils';

export interface MaintenanceStatus {
  status: 'overdue' | 'due-soon' | 'good' | 'unknown';
  daysUntilDue: number | null;
  nextDueDate: Date | null;
}

/**
 * Calculates maintenance status for a wear component
 */
export function calculateMaintenanceStatus(component: WearComponent): MaintenanceStatus {
  if (!component.lastReplaced || !component.recommendedReplacementInterval) {
    return { status: 'unknown', daysUntilDue: null, nextDueDate: null };
  }

  const lastReplacedDate = new Date(component.lastReplaced);
  const intervalMonths = parseInt(component.recommendedReplacementInterval.split(' ')[0]);
  const nextDueDate = new Date(lastReplacedDate);
  nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);
  
  const today = new Date();
  const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let status: MaintenanceStatus['status'];
  if (daysUntilDue < 0) {
    status = 'overdue';
  } else if (daysUntilDue <= 30) {
    status = 'due-soon';
  } else {
    status = 'good';
  }

  return { status, daysUntilDue, nextDueDate };
}

/**
 * Gets overall maintenance status for an asset
 */
export function getAssetMaintenanceStatus(asset: Asset): {
  overdueCount: number;
  dueSoonCount: number;
  hasMaintenanceDue: boolean;
} {
  if (asset.wearComponents.length === 0) {
    return { overdueCount: 0, dueSoonCount: 0, hasMaintenanceDue: false };
  }
  
  let overdueCount = 0;
  let dueSoonCount = 0;
  
  asset.wearComponents.forEach(component => {
    const status = calculateMaintenanceStatus(component);
    
    if (status.status === 'overdue') {
      overdueCount++;
    } else if (status.status === 'due-soon') {
      dueSoonCount++;
    }
  });
  
  return {
    overdueCount,
    dueSoonCount,
    hasMaintenanceDue: overdueCount > 0 || dueSoonCount > 0
  };
}

/**
 * Checks if an asset has maintenance due within specified days
 */
export function hasMaintenanceDue(asset: Asset, withinDays: number = 30): boolean {
  const { hasMaintenanceDue } = getAssetMaintenanceStatus(asset);
  return hasMaintenanceDue;
}