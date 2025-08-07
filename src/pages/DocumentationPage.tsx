import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  BookOpen, 
  FileText, 
  Tag,
  Bell,
  X
} from 'lucide-react';
import DocumentItem from '../components/Documentation/DocumentItem';
import DocumentUpload from '../components/Documentation/DocumentUpload';
import TechnicalBulletinCard from '../components/Documentation/TechnicalBulletinCard';
import AssetAssignmentModal from '../components/Documentation/AssetAssignmentModal';
import { Documentation, TechnicalBulletin, DocumentType } from '../types/Asset';
import { mockAssets } from '../data/mockData';

// Mock data for documentation and technical bulletins
const mockDocumentation: Documentation[] = [
  {
    id: '1',
    title: 'Centrifugal Pump Operating Manual.pdf',
    type: 'Operating Manual',
    url: '/docs/pump-manual.pdf',
    uploadDate: '2024-01-15',
    fileSize: 2400000,
    tags: ['pump', 'operation', 'manual'],
    assignedAssets: ['asset-1', 'asset-3']
  },
  {
    id: '2',
    title: 'Safety Protocols - Chemical Handling.pdf',
    type: 'Safety Instructions',
    url: '/docs/safety-chemical.pdf',
    uploadDate: '2024-01-10',
    fileSize: 1200000,
    tags: ['safety', 'chemical', 'handling'],
    assignedAssets: ['asset-2', 'asset-4']
  },
  {
    id: '3',
    title: 'Motor Maintenance Schedule.xlsx',
    type: 'Maintenance Guide',
    url: '/docs/motor-maintenance.xlsx',
    uploadDate: '2024-01-08',
    fileSize: 156000,
    tags: ['motor', 'maintenance', 'schedule'],
    assignedAssets: ['asset-1']
  }
];

const mockTechnicalBulletins: TechnicalBulletin[] = [
  {
    id: 'tb-1',
    title: 'Critical Safety Update: Pump Model XYZ-100 Seal Replacement',
    description: 'Immediate action required for all XYZ-100 series pumps. New seal design prevents potential catastrophic failure. Please schedule maintenance within 30 days.',
    severity: 'critical',
    type: 'safety_update',
    publishDate: '2024-01-20',
    expiryDate: '2024-02-20',
    isRead: false,
    affectedEquipmentTypes: ['Pump'],
    vendorInfo: {
      company: 'ABC Pumps Inc.',
      contactEmail: 'support@abcpumps.com',
      contactPhone: '+1-555-0123'
    },
    attachments: [
      {
        id: 'att-1',
        name: 'Seal_Replacement_Instructions.pdf',
        url: '/bulletins/seal-replacement.pdf',
        fileSize: 850000
      }
    ],
    tags: ['pump', 'seal', 'safety', 'urgent']
  },
  {
    id: 'tb-2',
    title: 'Equipment Change Notice: Heat Exchanger HX-200 Series',
    description: 'New improved design available for HX-200 series heat exchangers. Enhanced efficiency and reduced maintenance requirements.',
    severity: 'medium',
    type: 'equipment_change',
    publishDate: '2024-01-18',
    isRead: true,
    affectedEquipmentTypes: ['Heat Exchanger'],
    vendorInfo: {
      company: 'ThermalTech Solutions',
      contactEmail: 'info@thermaltech.com'
    },
    tags: ['heat-exchanger', 'upgrade', 'efficiency']
  }
];

const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'bulletins'>('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [showAssignment, setShowAssignment] = useState<Documentation | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Documentation[]>(mockDocumentation);
  const [bulletins, setBulletins] = useState<TechnicalBulletin[]>(mockTechnicalBulletins);

  const documentTypes: DocumentType[] = [
    'Operating Manual',
    'Maintenance Guide',
    'Safety Instructions',
    'Installation Manual',
    'Parts Catalog',
    'Technical Data',
    'BOM',
    'Other'
  ];

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || doc.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, selectedType]);

  const filteredBulletins = useMemo(() => {
    return bulletins.filter(bulletin => {
      const matchesSearch = bulletin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bulletin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bulletin.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSeverity = selectedSeverity === 'all' || bulletin.severity === selectedSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [bulletins, searchTerm, selectedSeverity]);

  const unreadBulletinsCount = bulletins.filter(b => !b.isRead).length;

  const handleDocumentUpload = async (files: File[], type: DocumentType, customType?: string) => {
    setIsUploading(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDocuments: Documentation[] = files.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        title: file.name,
        type: type === 'Other' && customType ? customType as DocumentType : type,
        url: URL.createObjectURL(file),
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: file.size,
        tags: [type.toLowerCase().replace(' ', '-')],
        assignedAssets: []
      }));

      setDocuments(prev => [...newDocuments, ...prev]);
      setShowUpload(false);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAssetAssignment = (documentId: string, assetIds: string[]) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, assignedAssets: assetIds }
        : doc
    ));
    setShowAssignment(null);
  };

  const markBulletinAsRead = (bulletinId: string) => {
    setBulletins(prev => prev.map(bulletin =>
      bulletin.id === bulletinId
        ? { ...bulletin, isRead: true }
        : bulletin
    ));
  };

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUpload) {
          setShowUpload(false);
        }
        if (showAssignment) {
          setShowAssignment(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showUpload, showAssignment]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
              Documentation Center
            </h1>
            <p className="mt-2 text-gray-600">
              Manage equipment documentation and stay updated with technical bulletins
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Documents ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('bulletins')}
              className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                activeTab === 'bulletins'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Technical Bulletins ({bulletins.length})
              {unreadBulletinsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadBulletinsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={activeTab === 'documents' ? 'Search documents...' : 'Search bulletins...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            {activeTab === 'documents' ? (
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            ) : (
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'documents' ? (
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || selectedType !== 'all' ? 'No matching documents' : 'No documents uploaded'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedType !== 'all' 
                  ? 'Try adjusting your search criteria or filters'
                  : 'Upload your first document to get started'
                }
              </p>
              {!searchTerm && selectedType === 'all' && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </button>
              )}
            </div>
          ) : (
            filteredDocuments.map(doc => (
              <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <DocumentItem
                  document={doc}
                  showActions={true}
                  onEdit={(document) => console.log('Edit document:', document)}
                  onDelete={(documentId) => {
                    setDocuments(prev => prev.filter(d => d.id !== documentId));
                  }}
                />
                
                {/* Asset Assignment Section */}
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Assigned to {doc.assignedAssets?.length || 0} asset(s)
                      </span>
                      {doc.assignedAssets && doc.assignedAssets.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {doc.assignedAssets.slice(0, 3).map(assetId => {
                            const asset = mockAssets.find(a => a.id === assetId);
                            return asset ? (
                              <span
                                key={assetId}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {asset.name}
                              </span>
                            ) : null;
                          })}
                          {doc.assignedAssets.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{doc.assignedAssets.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAssignment(doc)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Manage Assets
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBulletins.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No technical bulletins
              </h3>
              <p className="text-gray-600">
                Technical bulletins from your vendors will appear here
              </p>
            </div>
          ) : (
            filteredBulletins.map(bulletin => (
              <TechnicalBulletinCard
                key={bulletin.id}
                bulletin={bulletin}
                onMarkAsRead={markBulletinAsRead}
                assets={mockAssets}
              />
            ))
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowUpload(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upload Documentation</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg p-1"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <DocumentUpload
                onUpload={handleDocumentUpload}
                isUploading={isUploading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Asset Assignment Modal */}
      {showAssignment && (
        <AssetAssignmentModal
          document={showAssignment}
          assets={mockAssets}
          onAssign={handleAssetAssignment}
          onClose={() => setShowAssignment(null)}
        />
      )}
    </div>
  );
};

export default DocumentationPage;
