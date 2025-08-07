import React, { useState, useEffect } from 'react';
import { X, Package, MapPin, Gauge, Calendar, Hash, Settings, Wrench, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { getMockAssets } from '../../data/mockData';
import { Asset } from '../../types/Asset';
import WearComponentCard from '../WearComponents/WearComponentCard';
import DocumentItem from '../Documentation/DocumentItem';
import OrdersSection from '../Orders/OrdersSection';
import { getAssetMaintenanceStatus } from '../../utils/maintenanceUtils';
import { formatDate } from '../../utils/dateUtils';

interface AssetDetailDrawerProps {
  assetId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const AssetDetailDrawer: React.FC<AssetDetailDrawerProps> = ({
  assetId,
  isOpen,
  onClose
}) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'wear-components' | 'documentation' | 'orders'>('overview');

  // Find the asset from mock data
  useEffect(() => {
    if (assetId) {
      const foundAsset = getMockAssets().find(a => a.id === assetId);
      setAsset(foundAsset || null);
    } else {
      setAsset(null);
    }
  }, [assetId]);

  // Reset tab when drawer opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const getStatusBadge = (status: Asset['currentStatus']) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    
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

  const getEquipmentTypeIcon = (type: Asset['equipmentType']) => {
    switch (type) {
      case 'Pump':
        return <Settings className="w-5 h-5" />;
      case 'Compressor':
        return <Package className="w-5 h-5" />;
      case 'Valve':
        return <Wrench className="w-5 h-5" />;
      case 'Motor':
        return <Settings className="w-5 h-5" />;
      case 'Heat Exchanger':
        return <Gauge className="w-5 h-5" />;
      case 'Tank':
        return <Package className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getFluidTypeColor = (fluidType: Asset['operatingConditions']['fluidType']) => {
    switch (fluidType) {
      case 'Water':
        return 'text-blue-600 bg-blue-50';
      case 'Oil':
        return 'text-amber-600 bg-amber-50';
      case 'Chemical':
        return 'text-purple-600 bg-purple-50';
      case 'Steam':
        return 'text-red-600 bg-red-50';
      case 'Air':
        return 'text-gray-600 bg-gray-50';
      case 'Gas':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const wearStatus = getAssetMaintenanceStatus(asset);

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { 
      id: 'wear-components', 
      label: 'Wear Components', 
      count: asset.wearComponents.length,
      hasAlert: wearStatus.hasMaintenanceDue
    },
    { id: 'documentation', label: 'Documentation', count: asset.documentation.length },
    { id: 'orders', label: 'Orders', count: null }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">
                {getEquipmentTypeIcon(asset.equipmentType)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{asset.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={getStatusBadge(asset.currentStatus)}>
                    {asset.currentStatus}
                  </span>
                  <span className="text-sm text-gray-500">ID: {asset.id}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mt-4">
            <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.hasAlert && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Hash className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Serial Number</label>
                        <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded border">
                          {asset.serialNumber}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Model Code</label>
                        <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded border">
                          {asset.modelCode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Brand</label>
                        <p className="text-sm text-gray-900 font-medium">{asset.brand}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Equipment Type</label>
                        <p className="text-sm text-gray-900 font-medium">{asset.equipmentType}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Install Date
                        </label>
                        <p className="text-sm text-gray-900">{formatDate(asset.installDate)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Last Maintenance
                        </label>
                        <p className="text-sm text-gray-900">{formatDate(asset.lastMaintenance)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Location
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Facility</label>
                      <p className="text-lg font-medium text-gray-900">{asset.location.facility}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Area</label>
                      <p className="text-lg font-medium text-gray-900">{asset.location.area}</p>
                    </div>
                  </div>
                </div>

                {/* Operating Conditions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Gauge className="w-5 h-5 mr-2 text-blue-600" />
                    Current Operating Conditions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600 mb-1">
                        {asset.operatingConditions.flowRate}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Flow Rate</div>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600 mb-1">
                        {asset.operatingConditions.pressure}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Pressure</div>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600 mb-1">
                        {asset.operatingConditions.temperature}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Temperature</div>
                    </div>
                    <div className={`flex flex-col items-center text-center p-4 rounded-lg ${getFluidTypeColor(asset.operatingConditions.fluidType)}`}>
                      <div className="text-xl font-bold mb-1">
                        {asset.operatingConditions.fluidType}
                      </div>
                      <div className="text-sm font-medium">Fluid Type</div>
                    </div>
                  </div>
                </div>

                {/* Design Conditions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-600" />
                    Design Conditions
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                      Manufacturer Specs
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xl font-bold text-purple-600 mb-1">
                        {asset.designConditions.flowRate}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Design Flow Rate</div>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xl font-bold text-purple-600 mb-1">
                        {asset.designConditions.pressure}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Design Pressure</div>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xl font-bold text-purple-600 mb-1">
                        {asset.designConditions.temperature}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Design Temperature</div>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xl font-bold text-purple-600 mb-1">
                        {asset.designConditions.fluidType}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Design Fluid</div>
                    </div>
                  </div>
                </div>
                {/* Notes Section */}
                {asset.notes && asset.notes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Notes</h3>
                    <div className="space-y-3">
                      {asset.notes.map((note, index) => (
                        <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">
                              {formatDate(note.date)}
                            </div>
                            <div className="text-sm text-gray-700">{note.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wear-components' && (
              <div className="space-y-4">
                {asset.wearComponents.length > 0 ? (
                  <>
                    {wearStatus.hasMaintenanceDue && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                          <div>
                            <h4 className="text-sm font-medium text-yellow-800">Maintenance Attention Required</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              {wearStatus.overdueCount > 0 && `${wearStatus.overdueCount} component(s) overdue for replacement`}
                              {wearStatus.overdueCount > 0 && wearStatus.dueSoonCount > 0 && ', '}
                              {wearStatus.dueSoonCount > 0 && `${wearStatus.dueSoonCount} component(s) due soon`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {asset.wearComponents.map((component, index) => (
                        <WearComponentCard 
                          key={`${component.partNumber}-${index}`} 
                          component={component}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Wear Components Designated</h4>
                    <p className="text-gray-500">No wear components have been designated for this asset by your distributor.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documentation' && (
              <div className="space-y-4">
                {asset.documentation.length > 0 ? (
                  asset.documentation.map((doc) => (
                    <DocumentItem 
                      key={doc.id} 
                      document={doc}
                      showActions={false}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Documentation Available</h4>
                    <p className="text-gray-500">No documentation has been uploaded for this asset.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="-mx-6">
                <OrdersSection assetId={asset.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetDetailDrawer;