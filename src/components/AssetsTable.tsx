import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset } from '../types/Asset';
import { useDeviceType } from '../hooks/useTouch';
import { getAssetMaintenanceStatus } from '../utils/maintenanceUtils';
import { 
  getStatusBadge, 
  getCriticalityBadge, 
  getMaintenanceStatusBadge,
  getRowStateClasses, 
  getCardStateClasses 
} from '../utils/badgeUtils';
import VirtualList from './VirtualList/VirtualList';
import { HorizontalScrollIndicators, useHorizontalScrollIndicators } from './ScrollIndicators';
import {
  Zap,
  Droplets,
  Wind,
  Wrench,
  Flame,
  Cylinder,
  Settings,
  Check
} from 'lucide-react';

interface AssetsTableProps {
  assets: Asset[];
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string, shiftKey: boolean) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  showSelection?: boolean;
  // Inline maintenance actions
  onInlineScheduleMaintenance?: (asset: Asset) => void;
  onInlineLogInspection?: (asset: Asset) => void;
}

const AssetsTable: React.FC<AssetsTableProps> = ({ 
  assets,
  selectedIds = new Set(),
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  isAllSelected = false,
  isIndeterminate = false,
  showSelection = false,
  onInlineScheduleMaintenance,
  onInlineLogInspection
}) => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const { scrollContainerRef, showLeftScroll, showRightScroll } = useHorizontalScrollIndicators([assets]);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const handleRowClick = (assetId: string, event: React.MouseEvent) => {
    // Don't navigate if clicking on selection toggle or if selection is enabled and shift/ctrl is pressed
    if (
      (event.target as HTMLElement).closest('.selection-toggle') ||
      (showSelection && (event.shiftKey || event.ctrlKey || event.metaKey))
    ) {
      return;
    }
    
    console.log('Asset ID:', assetId);
    navigate(`/assets/${assetId}`);
  };

  const handleCheckboxClick = (assetId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onToggleSelection) {
      onToggleSelection(assetId, event.shiftKey);
    }
  };

  const handleSelectAllChange = () => {
    if (isAllSelected || isIndeterminate) {
      onClearSelection?.();
    } else {
      onSelectAll?.();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


const getEquipmentTypeIcon = (type: Asset['equipmentType']) => {
  switch (type) {
    case 'Pump':
      return <Droplets />;
    case 'Compressor':
      return <Wind />;
    case 'Valve':
      return <Wrench />;
    case 'Motor':
      return <Zap />;
    case 'Heat Exchanger':
      return <Flame />;
    case 'Tank':
      return <Cylinder />;
    default:
      return <Settings />;
  }
};

  // Mobile card view for better touch interaction
  const renderMobileCard = (asset: Asset) => (
    <div
      key={asset.id}
      onClick={(e) => handleRowClick(asset.id, e)}
      className={`p-4 bg-white border border-gray-200 rounded-lg mb-3 ${getCardStateClasses(selectedIds.has(asset.id), showSelection)}`}
    >
      {showSelection && (
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={selectedIds.has(asset.id)}
            onChange={(e) => handleCheckboxClick(asset.id, e)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            aria-label={`Select ${asset.name}`}
          />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{getEquipmentTypeIcon(asset.equipmentType)}</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {asset.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {asset.brand} • {asset.equipmentType}
            </p>
          </div>
        </div>
        <span className={getCriticalityBadge(asset.criticalityLevel)}>
          {asset.criticalityLevel}
        </span>
      </div>
      
      {/* Grid layout: Serial, Location, Priority, Last Inspection, Maintenance */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="font-medium text-gray-700">Serial:</span>
          <p className="font-mono text-gray-900 text-xs mt-1">{asset.serialNumber}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Location:</span>
          <div className="text-gray-900 text-xs mt-1">
            <div>{asset.location.facility}</div>
            <div className="text-gray-500">{asset.location.area}</div>
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Priority:</span>
          <div className="mt-1">
            <span className={getCriticalityBadge(asset.criticalityLevel)}>
              {asset.criticalityLevel}
            </span>
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Last Inspection:</span>
          <div className="mt-1 text-xs text-gray-900">{formatDate(asset.lastInspection ?? null)}</div>
        </div>
        <div className="col-span-2">
          <span className="font-medium text-gray-700">Maintenance:</span>
          <div className="mt-1 flex items-center space-x-2">
            {(() => {
              const { overdueCount, dueSoonCount } = getAssetMaintenanceStatus(asset);
              const status: 'overdue' | 'due-soon' | 'good' = overdueCount > 0 ? 'overdue' : dueSoonCount > 0 ? 'due-soon' : 'good';
              return (
                <span className={getMaintenanceStatusBadge(status)}>
                  {status === 'overdue' ? 'Overdue' : status === 'due-soon' ? 'Due Soon' : 'Good'}
                </span>
              );
            })()}
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={(e) => { e.stopPropagation(); onInlineScheduleMaintenance?.(asset); }}
            >
              Schedule
            </button>
            <button
              className="text-xs text-gray-600 hover:underline"
              onClick={(e) => { e.stopPropagation(); onInlineLogInspection?.(asset); }}
            >
              Log Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Tablet optimized table with larger touch targets
  const renderTabletTable = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Industrial Assets</h2>
        <p className="text-sm text-gray-600 mt-1">
          {showSelection 
            ? 'Tap assets to select for bulk operations' 
            : 'Tap any row to view asset details'
          }
        </p>
      </div>
      
<div className="relative">
        <HorizontalScrollIndicators showLeftScroll={showLeftScroll} showRightScroll={showRightScroll} />
        
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
          <thead className="bg-gray-50">
            <tr>
              {showSelection && (
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAllChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Select all assets"
                  />
                </th>
              )}
              	<th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-50 border-r border-gray-200" style={{ minWidth: '250px', boxShadow: '4px 0 6px -4px rgba(0,0,0,0.12)' }}>
                Equipment
              </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '140px' }}>
                Serial / Model
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                Last Inspection
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                Maintenance
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr
                key={asset.id}
                onClick={(e) => handleRowClick(asset.id, e)}
                className={`${getRowStateClasses(selectedIds.has(asset.id), showSelection)} min-h-[60px]`}
              >
                {showSelection && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(asset.id)}
                      onChange={(e) => handleCheckboxClick(asset.id, e)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`Select ${asset.name}`}
                    />
                  </td>
                )}
                	<td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-40 border-r border-gray-200" style={{ boxShadow: '4px 0 6px -4px rgba(0,0,0,0.12)' }}>
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{getEquipmentTypeIcon(asset.equipmentType)}</span>
                    <div className="flex flex-col">
                      <div className="text-base font-medium text-gray-900">
                        {asset.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {asset.brand} • {asset.equipmentType}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">
                    {asset.serialNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    {asset.modelCode}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-base font-medium text-gray-900">
                      {asset.location.facility}
                    </div>
                    <div className="text-sm text-gray-500">
                      {asset.location.area}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(asset.lastInspection ?? null)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const { overdueCount, dueSoonCount } = getAssetMaintenanceStatus(asset);
                    const status = overdueCount > 0 ? 'overdue' : dueSoonCount > 0 ? 'due-soon' : 'good';
                    return (
                      <div className="flex items-center space-x-2">
                        <span className={getMaintenanceStatusBadge(status)}>
                          {status === 'overdue' ? 'Overdue' : status === 'due-soon' ? 'Due Soon' : 'Good'}
                        </span>
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={(e) => { e.stopPropagation(); onInlineScheduleMaintenance?.(asset); }}
                        >
                          Schedule
                        </button>
                        <button
                          className="text-xs text-gray-600 hover:underline"
                          onClick={(e) => { e.stopPropagation(); onInlineLogInspection?.(asset); }}
                        >
                          Log
                        </button>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(asset.currentStatus)}>
                    {asset.currentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getCriticalityBadge(asset.criticalityLevel)}>
                    {asset.criticalityLevel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile View */}
      {deviceType === 'mobile' && (
        <div className="space-y-3">
          {showSelection && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAllChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-base font-medium text-gray-900">
                    Select All ({assets.length})
                  </span>
                </label>
                {selectedIds.size > 0 && (
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>
            </div>
          )}
          
          {assets.length > 50 ? (
            <VirtualList
              items={assets}
              itemHeight={180}
              containerHeight={600}
              renderItem={renderMobileCard}
              className="px-1"
            />
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => renderMobileCard(asset))}
            </div>
          )}
        </div>
      )}

      {/* Tablet View */}
      {deviceType === 'tablet' && renderTabletTable()}

      {/* Desktop View */}
      {deviceType === 'desktop' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Industrial Assets</h2>
        <p className="text-sm text-gray-600 mt-1">
          {showSelection 
            ? 'Select assets to perform bulk operations' 
            : 'Click on any row to view asset details'
          }
        </p>
      </div>
      
      <div className="relative">
        <HorizontalScrollIndicators showLeftScroll={showLeftScroll} showRightScroll={showRightScroll} />
        
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1000px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left w-12">
                <div className="w-8 h-8 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAllChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Select all assets"
                  />
                </div>
              </th>
              	<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-50 border-r border-gray-200" style={{ minWidth: '250px', boxShadow: '4px 0 6px -4px rgba(0,0,0,0.12)' }}>
                Equipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '140px' }}>
                Serial Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                Last Inspection
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                Maintenance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr
                key={asset.id}
                onClick={(e) => handleRowClick(asset.id, e)}
                className={`${getRowStateClasses(selectedIds.has(asset.id), showSelection).replace('hover:bg-blue-50', 'hover:bg-gray-50')}`}
              >
                <td 
                  className="px-3 py-4 whitespace-nowrap w-12 relative"
                  onMouseEnter={() => setHoveredRowId(asset.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  <div 
                    className="selection-toggle w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100"
                    onClick={(e) => handleCheckboxClick(asset.id, e)}
                    aria-label={`Select ${asset.name}`}
                  >
                    {selectedIds.has(asset.id) ? (
                      <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : hoveredRowId === asset.id ? (
                      <div className="w-5 h-5 border-2 border-gray-400 rounded hover:border-blue-600" />
                    ) : (
                      <div className="w-5 h-5" />
                    )}
                  </div>
                </td>
                	<td className="px-6 py-4 whitespace-nowrap sticky left-0 z-40 border-r border-gray-200 bg-white" style={{ boxShadow: '4px 0 6px -4px rgba(0,0,0,0.12)' }}>
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{getEquipmentTypeIcon(asset.equipmentType)}</span>
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {asset.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {asset.brand} • {asset.equipmentType}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">
                    {asset.serialNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    {asset.modelCode}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {asset.location.facility}
                    </div>
                    <div className="text-xs text-gray-500">
                      {asset.location.area}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(asset.lastInspection ?? null)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const { overdueCount, dueSoonCount } = getAssetMaintenanceStatus(asset);
                    const status = overdueCount > 0 ? 'overdue' : dueSoonCount > 0 ? 'due-soon' : 'good';
                    return (
                      <div className="flex items-center space-x-2">
                        <span className={getMaintenanceStatusBadge(status)}>
                          {status === 'overdue' ? 'Overdue' : status === 'due-soon' ? 'Due Soon' : 'Good'}
                        </span>
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={(e) => { e.stopPropagation(); onInlineScheduleMaintenance?.(asset); }}
                        >
                          Schedule
                        </button>
                        <button
                          className="text-xs text-gray-600 hover:underline"
                          onClick={(e) => { e.stopPropagation(); onInlineLogInspection?.(asset); }}
                        >
                          Log
                        </button>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(asset.currentStatus)}>
                    {asset.currentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getCriticalityBadge(asset.criticalityLevel)}>
                    {asset.criticalityLevel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
      )}
      
      {assets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-base">No assets found</p>
        </div>
      )}
    </>
  );
};

export default AssetsTable;