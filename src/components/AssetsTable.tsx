import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset } from '../types/Asset';

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
        return '🔄';
      case 'Compressor':
        return '💨';
      case 'Valve':
        return '🔧';
      case 'Motor':
        return '⚡';
      case 'Heat Exchanger':
        return '🔥';
      case 'Tank':
        return '🛢️';
      default:
        return '⚙️';
    }
  };

  return (
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
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serial Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Install Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                <td className="px-6 py-4 whitespace-nowrap">
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
      
      {assets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">No assets found</p>
        </div>
      )}
    </div>
  );
};

export default AssetsTable;