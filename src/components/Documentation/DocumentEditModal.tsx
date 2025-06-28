import React, { useState, useEffect } from 'react';
import { X, Save, Tag, FileText } from 'lucide-react';
import { Documentation, DocumentType } from '../../types/Asset';

interface DocumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Documentation | null;
  onSave: (updatedDocument: Documentation) => void;
  isLoading?: boolean;
}

const DocumentEditModal: React.FC<DocumentEditModalProps> = ({
  isOpen,
  onClose,
  document,
  onSave,
  isLoading = false
}) => {
  const [fileName, setFileName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('Technical Data');
  const [customType, setCustomType] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

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

  // Initialize form when document changes
  useEffect(() => {
    if (document) {
      setFileName(document.title);
      
      // Check if the document type is in our predefined list
      if (documentTypes.includes(document.type)) {
        setDocumentType(document.type);
        setCustomType('');
      } else {
        setDocumentType('Other');
        setCustomType(document.type);
      }
    }
  }, [document]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setErrors([]);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!fileName.trim()) {
      newErrors.push('File name is required');
    }

    if (documentType === 'Other' && !customType.trim()) {
      newErrors.push('Custom document type is required');
    }

    // Check for valid file extension
    const hasExtension = fileName.includes('.');
    if (!hasExtension) {
      newErrors.push('File name must include a file extension (e.g., .pdf, .doc)');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (!document || !validateForm()) return;

    const finalType = documentType === 'Other' ? customType.trim() : documentType;
    
    const updatedDocument: Documentation = {
      ...document,
      title: fileName.trim(),
      type: finalType as DocumentType
    };

    onSave(updatedDocument);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getDocumentTypeColor = (type: DocumentType) => {
    switch (type) {
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

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Edit Document
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Document Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Current Document</h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 font-mono">{document.title}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(document.type)}`}>
                  <Tag className="w-3 h-3 mr-1" />
                  {document.type}
                </span>
              </div>
            </div>

            <form onKeyDown={handleKeyDown} className="space-y-4">
              {/* File Name */}
              <div>
                <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name with extension"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Include the file extension (e.g., manual.pdf, guide.doc)
                </p>
              </div>

              {/* Document Type */}
              <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Custom Type Input */}
              {documentType === 'Other' && (
                <div>
                  <label htmlFor="customType" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Document Type
                  </label>
                  <input
                    type="text"
                    id="customType"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Enter custom document type"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Preview */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-800 font-mono">
                    {fileName || 'Enter file name...'}
                  </span>
                  {(documentType !== 'Other' || customType) && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(documentType === 'Other' ? customType as DocumentType : documentType)}`}>
                      <Tag className="w-3 h-3 mr-1" />
                      {documentType === 'Other' ? customType : documentType}
                    </span>
                  )}
                </div>
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</h4>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || !fileName.trim() || (documentType === 'Other' && !customType.trim())}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">⌘ + Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to cancel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditModal;