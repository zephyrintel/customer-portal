import React, { useState, useCallback, useEffect } from 'react';
import { X, Search, Package, CheckCircle, Circle, Target, Zap } from 'lucide-react';
import { Documentation, Asset, EquipmentType } from '../../types/Asset';

interface AssetAssignmentModalProps {
  document: Documentation;
  assets: Asset[];
  onAssign: (documentId: string, assetIds: string[]) => void;
  onClose: () => void;
}

const AssetAssignmentModal: React.FC<AssetAssignmentModalProps> = ({
  document,
  assets,
  onAssign,
  onClose
}) => {
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    document.assignedAssets || []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<EquipmentType | 'all'>('all');
  const [draggedDocumentId, setDraggedDocumentId] = useState<string | null>(null);
  const [dropTargetAssetId, setDropTargetAssetId] = useState<string | null>(null);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || asset.equipmentType === filterType;
    return matchesSearch && matchesType;
  });

  const equipmentTypes: EquipmentType[] = [
    'Pump', 'Compressor', 'Valve', 'Motor', 'Heat Exchanger', 'Tank', 'Other'
  ];

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredAssets.map(asset => asset.id);
    setSelectedAssetIds(allFilteredIds);
  };

  const handleDeselectAll = () => {
    setSelectedAssetIds([]);
  };

  const handleSave = () => {
    onAssign(document.id, selectedAssetIds);
  };

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, documentId: string) => {
    setDraggedDocumentId(documentId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', documentId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, assetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetAssetId(assetId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDropTargetAssetId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, assetId: string) => {
    e.preventDefault();
    const documentId = e.dataTransfer.getData('text/plain');
    
    if (documentId === document.id) {
      // Toggle the assignment
      handleAssetToggle(assetId);
    }
    
    setDraggedDocumentId(null);
    setDropTargetAssetId(null);
  }, [document.id, handleAssetToggle]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const getEquipmentIcon = (type: EquipmentType) => {
    switch (type) {
      case 'Pump':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'Compressor':
        return <Package className="w-5 h-5 text-green-600" />;
      case 'Valve':
        return <Target className="w-5 h-5 text-purple-600" />;
      case 'Motor':
        return <Zap className="w-5 h-5 text-orange-600" />;
      case 'Heat Exchanger':
        return <Package className="w-5 h-5 text-red-600" />;
      case 'Tank':
        return <Package className="w-5 h-5 text-gray-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Document to Assets</h2>
            <p className="text-sm text-gray-600 mt-1">
              Document: {document.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[60vh]">
          {/* Document Panel */}
          <div className="w-1/3 border-r border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Document</h3>
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, document.id)}
              className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4 cursor-move hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <Package className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-900">{document.title}</p>
                <p className="text-xs text-blue-700 mt-1">Drag to assign to assets</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Instructions:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Drag the document to an asset to assign</li>
                <li>• Click assets to select/deselect</li>
                <li>• Use search and filters to find assets</li>
              </ul>
            </div>
          </div>

          {/* Assets Panel */}
          <div className="flex-1 flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as EquipmentType | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {equipmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm text-gray-600">
                  {selectedAssetIds.length} of {filteredAssets.length} assets selected
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredAssets.map(asset => {
                  const isSelected = selectedAssetIds.includes(asset.id);
                  const isDropTarget = dropTargetAssetId === asset.id;
                  
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleAssetToggle(asset.id)}
                      onDragOver={(e) => handleDragOver(e, asset.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, asset.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } ${
                        isDropTarget
                          ? 'border-green-500 bg-green-50 transform scale-105'
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          {getEquipmentIcon(asset.equipmentType)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {asset.name}
                            </h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {asset.equipmentType}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>S/N: {asset.serialNumber}</span>
                            <span>{asset.brand} {asset.modelCode}</span>
                            <span>{asset.location.facility} - {asset.location.area}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedAssetIds.length} asset(s) will be assigned to this document
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAssignmentModal;
