import { useMemo } from 'react';
import { Asset } from '../types/Asset';
import { getAssetMaintenanceStatus } from '../utils/maintenanceUtils';

export interface MaintenanceStats {
  totalAssets: number;
  assetsNeedingAttention: number;
  overdueCount: number;
  dueSoonCount: number;
  criticalAssets: number;
  highPriorityAssets: number;
}

export const useMaintenanceStats = (assets: Asset[]): MaintenanceStats => {
  return useMemo(() => {
    let assetsNeedingAttention = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;
    let criticalAssets = 0;
    let highPriorityAssets = 0;

    assets.forEach(asset => {
      const maintenanceStatus = getAssetMaintenanceStatus(asset);
      const needsAttention = 
        ['Not In Use', 'Not Commissioned', 'Unknown'].includes(asset.currentStatus) ||
        maintenanceStatus.hasMaintenanceDue ||
        (!asset.lastMaintenance) ||
        (asset.lastMaintenance && 
         Math.ceil((new Date().getTime() - new Date(asset.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24)) > 180);

      if (needsAttention) {
        assetsNeedingAttention++;
        
        if (asset.criticalityLevel === 'Critical') {
          criticalAssets++;
        } else if (asset.criticalityLevel === 'High') {
          highPriorityAssets++;
        }
      }

      overdueCount += maintenanceStatus.overdueCount;
      dueSoonCount += maintenanceStatus.dueSoonCount;
    });

    return {
      totalAssets: assets.length,
      assetsNeedingAttention,
      overdueCount,
      dueSoonCount,
      criticalAssets,
      highPriorityAssets
    };
  }, [assets]);
};
</parameter>
</invoke>