import React, { useState, useCallback } from 'react';
import { 
  Package, 
  FileText, 
  Target, 
  Zap, 
  CheckCircle, 
  Move,
  ArrowRight
} from 'lucide-react';
import { Documentation, Asset, EquipmentType } from '../../types/Asset';
import DocumentItem from './DocumentItem';

interface DocumentationManagerProps {
  documents: Documentation[];
  assets: Asset[];
  onAssignDocument: (documentId: string, assetIds: string[]) => void;
  onRemoveAssignment: (documentId: string, assetId: string) => void;
}

const DocumentationManager: React.FC<DocumentationManagerProps> = ({
  documents,
  assets,
  onAssignDocument,
  onRemoveAssignment
}) => {
  const [draggedDocument, setDraggedDocument] = useState<Documentation | null>(null);
  const [dragOverAsset, setDragOverAsset] = useState<string | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<{[key: string]: string[]}>({});

  // Get unassigned documents
  const unassignedDocuments = documents.filter(doc => 
    !doc.assignedAssets || doc.assignedAssets.length === 0
  );

  // Group assets by equipment type for better organization
  const assetsByType = assets.reduce((acc, asset) => {
    if (!acc[asset.equipmentType]) {
      acc[asset.equipmentType] = [];
    }
    acc[asset.equipmentType].push(asset);
    return acc;
  }, {} as Record<EquipmentType, Asset[]>);

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

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, document: Documentation) => {
    setDraggedDocument(document);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', document.id);
    
    // Add a visual indication
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(-5deg)';
    dragImage.style.opacity = '0.8';
    e.dataTransfer.setDragImage(dragImage, 20, 20);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedDocument(null);
    setDragOverAsset(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, assetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverAsset(assetId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverAsset(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, assetId: string) => {
    e.preventDefault();
    const documentId = e.dataTransfer.getData('text/plain');
    
    if (draggedDocument && documentId === draggedDocument.id) {
      const currentAssignments = draggedDocument.assignedAssets || [];
      const newAssignments = currentAssignments.includes(assetId) 
        ? currentAssignments.filter(id => id !== assetId)
        : [...currentAssignments, assetId];
      
      onAssignDocument(documentId, newAssignments);
      
      // Track recent assignment for visual feedback
      setRecentAssignments(prev => ({
        ...prev,
        [documentId]: [assetId]
      }));
      
      // Clear recent assignment after animation
      setTimeout(() => {
        setRecentAssignments(prev => {
          const { [documentId]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);
    }
    
    setDraggedDocument(null);
    setDragOverAsset(null);
  }, [draggedDocument, onAssignDocument]);

  const getDocumentsByAsset = (assetId: string) => {
    return documents.filter(doc => 
      doc.assignedAssets?.includes(assetId)
    );
  };

  return (
    <div className="space-y-6">
      {/* Drag and Drop Instructions */}
      {unassignedDocuments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Move className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-900">Quick Assignment</h3>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Drag documents from the "Unassigned Documents" section below and drop them onto assets to create assignments quickly.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned Documents Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Unassigned Documents
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({unassignedDocuments.length})
                </span>
              </h2>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {unassignedDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">All documents are assigned!</p>
                </div>
              ) : (
                unassignedDocuments.map(document => (
                  <div
                    key={document.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, document)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 border border-gray-200 rounded-lg cursor-move transition-all duration-200 hover:shadow-md hover:border-blue-300 ${
                      draggedDocument?.id === document.id ? 'opacity-50 transform rotate-2' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {document.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {document.type}
                        </p>
                      </div>
                      <Move className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Assets Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-gray-600" />
                Assets by Equipment Type
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Drop documents onto assets to assign them
              </p>
            </div>
            
            <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
              {Object.entries(assetsByType).map(([equipmentType, typeAssets]) => (
                <div key={equipmentType}>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    {getEquipmentIcon(equipmentType as EquipmentType)}
                    <span className="ml-2">{equipmentType} ({typeAssets.length})</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {typeAssets.map(asset => {
                      const assignedDocs = getDocumentsByAsset(asset.id);
                      const isDropTarget = dragOverAsset === asset.id;
                      const hasRecentAssignment = Object.values(recentAssignments).some(
                        assignments => assignments.includes(asset.id)
                      );
                      
                      return (
                        <div
                          key={asset.id}
                          onDragOver={(e) => handleDragOver(e, asset.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, asset.id)}
                          className={`p-3 border rounded-lg transition-all duration-200 ${
                            isDropTarget
                              ? 'border-green-400 bg-green-50 transform scale-105 shadow-lg'
                              : hasRecentAssignment
                              ? 'border-blue-400 bg-blue-50'
                              : assignedDocs.length > 0
                              ? 'border-blue-200 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getEquipmentIcon(asset.equipmentType)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {asset.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {asset.serialNumber}
                                </p>
                              </div>
                            </div>
                            
                            {assignedDocs.length > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {assignedDocs.length} doc{assignedDocs.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          
                          {/* Show assigned documents */}
                          {assignedDocs.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {assignedDocs.slice(0, 2).map(doc => (
                                <div
                                  key={doc.id}
                                  className="flex items-center space-x-2 p-1 bg-white rounded text-xs"
                                >
                                  <FileText className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-700 truncate flex-1">
                                    {doc.title}
                                  </span>
                                </div>
                              ))}
                              {assignedDocs.length > 2 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{assignedDocs.length - 2} more
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Drop zone indicator */}
                          {isDropTarget && (
                            <div className="mt-2 flex items-center justify-center p-2 border-2 border-dashed border-green-400 rounded-md bg-green-100">
                              <ArrowRight className="w-4 h-4 text-green-600 mr-1" />
                              <span className="text-xs font-medium text-green-700">
                                Drop to assign
                              </span>
                            </div>
                          )}
                          
                          {/* Recent assignment feedback */}
                          {hasRecentAssignment && (
                            <div className="mt-2 flex items-center justify-center p-1 bg-blue-100 rounded-md">
                              <CheckCircle className="w-3 h-3 text-blue-600 mr-1" />
                              <span className="text-xs font-medium text-blue-700">
                                Document assigned!
                              </span>
                            </div>
                          )}
                          
                          {/* Empty state for assets with no documents */}
                          {assignedDocs.length === 0 && !isDropTarget && !hasRecentAssignment && (
                            <div className="mt-2 text-center py-2">
                              <Target className="w-4 h-4 text-gray-300 mx-auto mb-1" />
                              <p className="text-xs text-gray-400">
                                No documents assigned
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationManager;
