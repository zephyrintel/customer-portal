/**
 * Centralized maintenance calculation utilities
 */

import { WearComponent, Asset } from '../types/Asset';
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
export function hasMaintenanceDue(asset: Asset, _withinDays: number = 30): boolean {
  const { hasMaintenanceDue } = getAssetMaintenanceStatus(asset);
  return hasMaintenanceDue;
}

/**
 * UI Helper functions for maintenance display
 */

import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Droplets,
  Wind,
  Wrench,
  Zap,
  Flame,
  Cylinder,
  Settings
} from 'lucide-react';

export type MaintenancePriority = 'critical' | 'high' | 'medium' | 'low';
export type EquipmentType = 'Pump' | 'Compressor' | 'Valve' | 'Motor' | 'Heat Exchanger' | 'Tank';
export type EquipmentStatus = 'In Operation' | 'Intermittent Operation' | 'Not Commissioned' | 'Not In Use' | 'Unknown';

/**
 * Get priority icon component
 */
export function getPriorityIcon(priority: MaintenancePriority): React.ReactNode {
  switch (priority) {
    case 'critical':
      return React.createElement(AlertTriangle, { className: "w-4 h-4 text-red-600" });
    case 'high':
      return React.createElement(AlertTriangle, { className: "w-4 h-4 text-orange-600" });
    case 'medium':
      return React.createElement(Clock, { className: "w-4 h-4 text-yellow-600" });
    case 'low':
      return React.createElement(CheckCircle, { className: "w-4 h-4 text-green-600" });
  }
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority: MaintenancePriority): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
  }
}

/**
 * Get status badge classes
 */
export function getStatusBadgeClasses(status: EquipmentStatus): string {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide";
  
  switch (status) {
    case 'In Operation':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'Intermittent Operation':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'Not Commissioned':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'Not In Use':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'Unknown':
      return `${baseClasses} bg-gray-100 text-gray-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
}

/**
 * Get equipment type icon component
 */
export function getEquipmentTypeIcon(equipmentType: string): React.ReactNode {
  switch (equipmentType) {
    case 'Pump':
      return React.createElement(Droplets);
    case 'Compressor':
      return React.createElement(Wind);
    case 'Valve':
      return React.createElement(Wrench);
    case 'Motor':
      return React.createElement(Zap);
    case 'Heat Exchanger':
      return React.createElement(Flame);
    case 'Tank':
      return React.createElement(Cylinder);
    default:
      return React.createElement(Settings);
  }
}
