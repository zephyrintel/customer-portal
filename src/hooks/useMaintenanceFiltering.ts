import { useMemo } from 'react';
import { Asset } from '../types/Asset';
import { getAssetMaintenanceStatus } from '../utils/maintenanceUtils';

export interface MaintenanceItem {
  id: string;
  name: string;
  status: string;
  lastMaint: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  equipmentType: string;
  location: string;
  asset: Asset;
  daysOverdue?: number;
  nextDueDate?: Date;
  maintenanceDetails: string;
}

export interface MaintenanceFilters {
  priorityFilter: 'all' | 'critical' | 'high' | 'medium' | 'low';
  searchTerm: string;
}

export const useMaintenanceFiltering = (
  assets: Asset[],
  filters: MaintenanceFilters
) => {
  // Memoize maintenance items generation
  const maintenanceItems = useMemo((): MaintenanceItem[] => {
    const items: MaintenanceItem[] = [];

    assets.forEach(asset => {
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

      const maintenanceStatus = getAssetMaintenanceStatus(asset);
      hasOverdueMaintenance = maintenanceStatus.overdueCount > 0;
      hasDueSoonMaintenance = maintenanceStatus.dueSoonCount > 0;

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
          priority,
          equipmentType: asset.equipmentType,
          location: `${asset.location.facility} - ${asset.location.area}`,
          asset,
          daysOverdue,
          nextDueDate,
          maintenanceDetails: reasons.join('; ')
        });
      }
    });

    return items;
  }, [assets]);

  // Memoize filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = maintenanceItems.filter(item => {
      const matchesPriority = filters.priorityFilter === 'all' || item.priority === filters.priorityFilter;
      const matchesSearch = filters.searchTerm === '' || 
        item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.equipmentType.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      return matchesPriority && matchesSearch;
    });

    // Sort by priority
    filtered.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return filtered;
  }, [maintenanceItems, filters.priorityFilter, filters.searchTerm]);

  return {
    maintenanceItems,
    filteredAndSortedItems
  };
};
</parameter>
</invoke>