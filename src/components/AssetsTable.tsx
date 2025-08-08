import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset } from '../types/Asset';
import { useDeviceType, useTouch } from '../hooks/useTouch';
import VirtualList from './VirtualList/VirtualList';
import {
  Zap,
  Droplets,
  Wind,
  Wrench,
  Flame,
  Cylinder,
  Settings,
  ChevronLeft,
  ChevronRight
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
}

const AssetsTable: React.FC<AssetsTableProps> = ({ 
  assets,
  selectedIds = new Set(),
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  isAllSelected = false,
  isIndeterminate = false,
  showSelection = false
}) => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Check scroll position to show/hide scroll indicators
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Initialize scroll indicators on mount and when assets change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      handleScroll();
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [assets]);

  const handleRowClick = (assetId: string, event: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or if selection is enabled and shift/ctrl is pressed
    if (
      (event.target as HTMLElement).closest('input[type="checkbox"]') ||
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

  const getStatusBadge = (status: Asset['currentStatus']) => {
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
  };

  const getCriticalityBadge = (criticality: Asset['criticalityLevel']) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    
    switch (criticality) {
      case 'Critical':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'High':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'Medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Low':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
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
  const renderMobileCard = (asset: Asset, index: number) => (
    <div
      key={asset.id}
      onClick={(e) => handleRowClick(asset.id, e)}
      className={`p-4 bg-white border border-gray-200 rounded-lg mb-3 transition-all duration-150 ease-in-out active:bg-gray-50 ${
        selectedIds.has(asset.id) 
          ? 'ring-2 ring-blue-500 border-blue-300' 
          : 'hover:shadow-md'
      }`}
    >
      {showSelection && (
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={selectedIds.has(asset.id)}
            onChange={(e) => handleCheckboxClick(asset.id, e as any)}
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
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="font-medium text-gray-700">Serial:</span>
          <p className="font-mono text-gray-900 text-xs mt-1">{asset.serialNumber}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Location:</span>
          <p className="text-gray-900 text-xs mt-1">{asset.location.facility}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Install Date:</span>
          <p className="text-gray-900 text-xs mt-1">{formatDate(asset.installDate)}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Status:</span>
          <div className="mt-1">
            <span className={getStatusBadge(asset.currentStatus)}>
              {asset.currentStatus}
            </span>
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
        {/* Left scroll indicator */}
        {showLeftScroll && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-white via-white to-transparent pl-2 pr-8 pointer-events-none">
            <ChevronLeft className="text-gray-600 w-5 h-5" />
          </div>
        )}
        
        {/* Right scroll indicator */}
        {showRightScroll && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-white via-white to-transparent pr-2 pl-8 pointer-events-none">
            <ChevronRight className="text-gray-600 w-5 h-5" />
          </div>
        )}
        
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
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20" style={{ minWidth: '250px' }}>
                Equipment
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
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
                className={`transition-colors duration-150 ease-in-out cursor-pointer min-h-[60px] ${
                  selectedIds.has(asset.id) 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                {showSelection && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(asset.id)}
                      onChange={(e) => handleCheckboxClick(asset.id, e as any)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`Select ${asset.name}`}
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200">
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
                  <div className="flex flex-col">
                    <div className="text-base font-medium text-gray-900">
                      {asset.location.facility}
                    </div>
                    <div className="text-sm text-gray-500">
                      {asset.location.area}
                    </div>
                  </div>
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
              {assets.map((asset, index) => renderMobileCard(asset, index))}
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
        {/* Desktop scroll indicators */}
        {showLeftScroll && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-white via-white to-transparent pl-2 pr-8 pointer-events-none">
            <ChevronLeft className="text-gray-600 w-5 h-5" />
          </div>
        )}
        
        {showRightScroll && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-white via-white to-transparent pr-2 pl-8 pointer-events-none">
            <ChevronRight className="text-gray-600 w-5 h-5" />
          </div>
        )}
        
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1000px' }}>
          <thead className="bg-gray-50">
            <tr>
              {showSelection && (
                <th className="px-6 py-3 text-left">
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
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r border-gray-200" style={{ minWidth: '250px' }}>
                Equipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '140px' }}>
                Serial Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                Install Date
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
                className={`transition-colors duration-150 ease-in-out ${
                  selectedIds.has(asset.id) 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50'
                } ${showSelection ? 'cursor-pointer' : 'cursor-pointer'}`}
              >
                {showSelection && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(asset.id)}
                      onChange={(e) => handleCheckboxClick(asset.id, e as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`Select ${asset.name}`}
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200">
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
                  {formatDate(asset.installDate)}
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