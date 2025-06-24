import React from 'react';
import { FileText, Download, File, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Documentation } from '../../types/Asset';

interface DocumentItemProps {
  document: Documentation;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ document }) => {
  const getDocumentIcon = () => {
    const extension = document.title.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDocumentTypeColor = () => {
    switch (document.type) {
      case 'Manual':
        return 'bg-blue-100 text-blue-800';
      case 'BOM':
        return 'bg-green-100 text-green-800';
      case 'Technical Data':
        return 'bg-purple-100 text-purple-800';
      case 'Service Bulletin':
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
      'xls': '156 KB'
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
      console.log('Downloading document:', document.title);
      // TODO: Implement actual download functionality
      // In a real app, this would handle the download with proper error handling
      
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
      // TODO: Show user-friendly error message
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
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
              {document.type}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{formatFileSize(document.url)}</span>
            <span>Uploaded {formatDate(document.uploadDate)}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleDownload}
        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`Download ${document.title}`}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Download</span>
      </button>
    </div>
  );
};

export default DocumentItem;