import React, { useState } from 'react';
import { FileText, Download, File, FileSpreadsheet, Edit3, Trash2, Tag } from 'lucide-react';
import { Documentation } from '../../types/Asset';

interface DocumentItemProps {
  document: Documentation;
  onEdit?: (document: Documentation) => void;
  onDelete?: (documentId: string) => void;
  showActions?: boolean;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ 
  document, 
  onEdit, 
  onDelete, 
  showActions = false 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const getDocumentIcon = () => {
    const extension = document.title.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="w-5 h-5 text-purple-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDocumentTypeColor = () => {
    switch (document.type) {
      case 'Operating Manual':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance Guide':
        return 'bg-green-100 text-green-800';
      case 'Safety Instructions':
        return 'bg-red-100 text-red-800';
      case 'Installation Manual':
        return 'bg-purple-100 text-purple-800';
      case 'Parts Catalog':
        return 'bg-yellow-100 text-yellow-800';
      case 'Technical Data':
        return 'bg-indigo-100 text-indigo-800';
      case 'BOM':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (url: string) => {
    // Mock file size calculation - in real app, this would come from API
    const mockSizes: { [key: string]: string } = {
      'pdf': '2.4 MB',
      'xlsx': '156 KB',
      'xls': '156 KB',
      'doc': '1.2 MB',
      'docx': '1.2 MB',
      'jpg': '850 KB',
      'jpeg': '850 KB',
      'png': '1.1 MB'
    };
    
    const extension = url.split('.').pop()?.toLowerCase();
    return mockSizes[extension || ''] || '1.2 MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      console.log('Downloading document:', document.title);
      
      // Mock download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a temporary link for download simulation
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(document);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      onDelete(document.id);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {getDocumentIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {decodeURIComponent(document.title)}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor()}`}>
              <Tag className="w-3 h-3 mr-1" />
              {document.type}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{formatFileSize(document.url)}</span>
            <span>Uploaded {formatDate(document.uploadDate)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {showActions && (
          <>
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Edit ${document.title}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Delete ${document.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
        
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Download ${document.title}`}
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentItem;