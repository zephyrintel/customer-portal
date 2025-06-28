import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  MapPin, 
  Gauge, 
  Calendar, 
  User, 
  Hash, 
  AlertCircle, 
  Settings, 
  Package, 
  Wrench,
  FileText,
  AlertTriangle,
  CheckCircle,
  Upload,
  Plus,
  X
} from 'lucide-react';
import { mockAssets } from '../data/mockData';
import { Asset, Documentation, DocumentType } from '../types/Asset';
import WearComponentCard from './WearComponents/WearComponentCard';
import DocumentItem from './Documentation/DocumentItem';
import DocumentUpload from './Documentation/DocumentUpload';
import DocumentEditModal from './Documentation/DocumentEditModal';
import EmptyDocumentationState from './Documentation/EmptyDocumentationState';
import AssetEditModal from './AssetEdit/AssetEditModal';
import OrdersSection from './Orders/OrdersSection';
import BOMTable from './BillOfMaterials/BOMTable';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'wear-components' | 'documentation' | 'bom'>('overview');
  const [showUpload, setShowUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Documentation[]>([]);
  const [editingDocument, setEditingDocument] = useState<Documentation | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAssetEditLoading, setIsAssetEditLoading] = useState(false);
  const [asset, setAsset] = useState<Asset | undefined>();
  
  // Find the asset from mock data
  React.useEffect(() => {
    const foundAsset = mockAssets.find(a => a.id === id);
    setAsset(foundAsset);
  }, [id]);

  // Initialize documents from asset data
  React.useEffect(() => {
    if (asset) {
      setDocuments(asset.documentation);
    }
  }, [asset]);

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/assets" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assets
          </Link>
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Asset Not Found</h1>
            <p className="text-gray-600">The asset with ID "{id}" could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const getWearComponentsStatus = () => {
    if (asset.wearComponents.length === 0) return null;
    
    let overdueCount = 0;
    let dueSoonCount = 0;
    
    asset.wearComponents.forEach(component => {
      if (!component.lastReplaced || !component.recommendedReplacementInterval) return;
      
      const lastReplacedDate = new Date(component.lastReplaced);
      const intervalMonths = parseInt(component.recommendedReplacementInterval.split(' ')[0]);
      const nextDueDate = new Date(lastReplacedDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);
      
      const today = new Date();
      const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        overdueCount++;
      } else if (daysUntilDue <= 30) {
        dueSoonCount++;
      }
    });
    
    return { overdueCount, dueSoonCount };
  };

  const wearStatus = getWearComponentsStatus();

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleAssetSave = async (updatedAsset: Asset) => {
    setIsAssetEditLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the asset
      setAsset(updatedAsset);
      setShowEditModal(false);
      
      console.log('Asset updated:', updatedAsset);
      
    } catch (error) {
      console.error('Failed to update asset:', error);
      // TODO: Show error message to user
    } finally {
      setIsAssetEditLoading(false);
    }
  };

  const handleUpload = async (files: File[], documentType: DocumentType, customType?: string) => {
    setIsUploading(true);
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new document entries
      const newDocuments: Documentation[] = files.map((file, index) => ({
        id: `DOC-${Date.now()}-${index}`,
        title: file.name,
        type: documentType === 'Other' ? (customType as DocumentType) : documentType,
        url: URL.createObjectURL(file), // In real app, this would be the uploaded file URL
        uploadDate: new Date().toISOString(),
        fileSize: file.size,
        tags: []
      }));
      
      // Add to documents list
      setDocuments(prev => [...prev, ...newDocuments]);
      setShowUpload(false);
      
      console.log('Documents uploaded:', newDocuments);
      
    } catch (error) {
      console.error('Upload failed:', error);
      // TODO: Show error message to user
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditDocument = (document: Documentation) => {
    setEditingDocument(document);
  };

  const handleSaveDocument = async (updatedDocument: Documentation) => {
    setIsEditLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the document in the list
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === updatedDocument.id ? updatedDocument : doc
        )
      );
      
      setEditingDocument(null);
      console.log('Document updated:', updatedDocument);
      
    } catch (error) {
      console.error('Failed to update document:', error);
      // TODO: Show error message to user
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    console.log('Document deleted:', documentId);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { 
      id: 'wear-components', 
      label: 'Wear Components', 
      count: asset.wearComponents.length,
      hasAlert: wearStatus && (wearStatus.overdueCount > 0 || wearStatus.dueSoonCount > 0)
    },
    { id: 'documentation', label: 'Documentation', count: documents.length },
    { id: 'bom', label: 'Bill of Materials', count: asset.billOfMaterials.length }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            to="/assets" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assets
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="text-blue-600 mr-3">
                    {getEquipmentTypeIcon(asset.equipmentType)}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{asset.name}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                  <span className={getStatusBadge(asset.currentStatus)}>
                    {asset.currentStatus}
                  </span>
                  <span className="text-sm text-gray-500">ID: {asset.id}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {asset.brand} • {asset.modelCode} • {asset.equipmentType}
                </div>
              </div>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Asset
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="px-4 sm:px-6">
            <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Hash className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
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
              <div className="bg-white rounded-lg shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Location
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
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
              <div className="bg-white rounded-lg shadow-lg lg:col-span-2">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Gauge className="w-5 h-5 mr-2 text-purple-600" />
                    Operating Conditions
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {asset.operatingConditions.flowRate}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Flow Rate</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {asset.operatingConditions.pressure}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Pressure</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {asset.operatingConditions.temperature}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Temperature</div>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${getFluidTypeColor(asset.operatingConditions.fluidType)}`}>
                      <div className="text-2xl font-bold mb-1">
                        {asset.operatingConditions.fluidType}
                      </div>
                      <div className="text-sm font-medium">Fluid Type</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {asset.notes && asset.notes.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg lg:col-span-2">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Maintenance Notes</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {asset.notes.map((note, index) => (
                        <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
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
                </div>
              )}
            </div>

            {/* Orders Section */}
            <OrdersSection assetId={asset.id} />
          </div>
        )}

        {activeTab === 'wear-components' && (
          <div className="space-y-6">
            {asset.wearComponents.length > 0 ? (
              <>
                {wearStatus && (wearStatus.overdueCount > 0 || wearStatus.dueSoonCount > 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">Maintenance Attention Required</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          {wearStatus.overdueCount > 0 && `${wearStatus.overdueCount} component(s) overdue for replacement`}
                          {wearStatus.overdueCount > 0 && wearStatus.dueSoonCount > 0 && ', '}
                          {wearStatus.dueSoonCount > 0 && `${wearStatus.dueSoonCount} component(s) due soon`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {asset.wearComponents.map((component, index) => (
                    <WearComponentCard key={`${component.partNumber}-${index}`} component={component} />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Wear Components Designated</h3>
                <p className="text-gray-500">No wear components have been designated for this asset by your distributor.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documentation' && (
          <div className="space-y-6">
            {documents.length > 0 || showUpload ? (
              <>
                {/* Header with Upload Button */}
                {documents.length > 0 && !showUpload && (
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Documentation ({documents.length})
                    </h3>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Documentation
                    </button>
                  </div>
                )}

                {/* Upload Component */}
                {showUpload && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Upload New Documentation</h3>
                      <button
                        onClick={() => setShowUpload(false)}
                        disabled={isUploading}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <DocumentUpload
                      onUpload={handleUpload}
                      isUploading={isUploading}
                    />
                  </div>
                )}

                {/* Documents List */}
                {documents.length > 0 && (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <DocumentItem 
                        key={doc.id} 
                        document={doc}
                        onEdit={handleEditDocument}
                        onDelete={handleDeleteDocument}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <EmptyDocumentationState
                onUploadClick={() => setShowUpload(true)}
              />
            )}
          </div>
        )}

        {activeTab === 'bom' && (
          <BOMTable items={asset.billOfMaterials} />
        )}

        {/* Asset Edit Modal */}
        <AssetEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          asset={asset}
          onSave={handleAssetSave}
          isLoading={isAssetEditLoading}
        />

        {/* Document Edit Modal */}
        <DocumentEditModal
          isOpen={!!editingDocument}
          onClose={() => setEditingDocument(null)}
          document={editingDocument}
          onSave={handleSaveDocument}
          isLoading={isEditLoading}
        />
      </div>
    </div>
  );
};

export default AssetDetail;