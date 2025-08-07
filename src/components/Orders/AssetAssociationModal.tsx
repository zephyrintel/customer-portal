import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Package, MapPin, CheckCircle, Link } from 'lucide-react';
import { Asset } from '../../types/Asset';
import { getMockAssets } from '../../data/mockData';

interface AssetAssociationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssociate: (assetId: string) => void;
  currentAssetId?: string;
  orderNumber: string;
  isLoading?: boolean;
}

const AssetAssociationModal: React.FC<AssetAssociationModalProps> = ({
  isOpen,
  onClose,
  onAssociate,
  currentAssetId,
  orderNumber,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(currentAssetId || null);

  const assets = useMemo(() => getMockAssets(), []);

  // Filter assets based on search term
  const filteredAssets = useMemo(() => {
    if (!searchTerm) return assets;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return assets.filter(asset => 
      asset.name.toLowerCase().includes(lowerSearchTerm) ||
      asset.serialNumber.toLowerCase().includes(lowerSearchTerm) ||
      asset.brand.toLowerCase().includes(lowerSearchTerm) ||
      asset.location.facility.toLowerCase().includes(lowerSearchTerm) ||
      asset.location.area.toLowerCase().includes(lowerSearchTerm) ||
      asset.equipmentType.toLowerCase().includes(lowerSearchTerm)
    );
  }, [assets, searchTerm]);

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

  const getStatusBadge = (status: Asset['currentStatus']) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
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

  const handleAssociate = () => {
    if (selectedAssetId) {
      onAssociate(selectedAssetId);
    }
  };

  const handleAssetSelect = (assetId: string, event: React.MouseEvent) => {
    // Don't select if clicking with meta/ctrl/shift keys (for consistency with other tables)
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      return;
    }
    
    if (selectedAssetId === assetId) {
      setSelectedAssetId(null);
    } else {
      setSelectedAssetId(assetId);
    }
  };

  const handleRemoveAssociation = () => {
    setSelectedAssetId(null);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Link className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Associate with Equipment</h3>
                  <p className="text-sm text-gray-500">Link order {orderNumber} to specific equipment</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Why associate orders with equipment?</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Linking orders to specific equipment helps track parts consumption, maintenance costs, and procurement history for better asset management.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search equipment by name, serial number, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Current Selection */}
            {selectedAssetId && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900">Selected Equipment</h4>
                      <p className="text-sm text-green-800">
                        {assets.find(a => a.id === selectedAssetId)?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveAssociation}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Equipment List */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Available Equipment ({filteredAssets.length})
              </h4>
              
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredAssets.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredAssets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={(e) => handleAssetSelect(asset.id, e)}
                        className={`p-4 cursor-pointer transition-colors duration-150 hover:bg-gray-50 ${
                          selectedAssetId === asset.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">
                              {getEquipmentTypeIcon(asset.equipmentType)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="text-sm font-medium text-gray-900 truncate">
                                  {asset.name}
                                </h5>
                                {selectedAssetId === asset.id && (
                                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="font-mono">{asset.serialNumber}</span>
                                <span>{asset.brand}</span>
                                <span>{asset.equipmentType}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  {asset.location.facility} - {asset.location.area}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={getStatusBadge(asset.currentStatus)}>
                              {asset.currentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      {searchTerm ? 'No equipment matches your search' : 'No equipment available'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* General/Unassociated Option */}
            <div className="mb-6">
              <div
                onClick={(e) => handleAssetSelect('GENERAL', e)}
                className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-gray-50 ${
                  selectedAssetId === 'GENERAL' ? 'bg-blue-50 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-500" />
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">General/Unassociated</h5>
                      <p className="text-xs text-gray-600">
                        Keep this order unlinked to specific equipment
                      </p>
                    </div>
                  </div>
                  {selectedAssetId === 'GENERAL' && (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleAssociate}
              disabled={!selectedAssetId || isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Associate Order
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAssociationModal;