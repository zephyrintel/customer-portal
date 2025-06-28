import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Plus, FileText, AlertCircle } from 'lucide-react';

export type DocumentType = 
  | 'Operating Manual'
  | 'Maintenance Guide'
  | 'Safety Instructions'
  | 'Installation Manual'
  | 'Parts Catalog'
  | 'Technical Data'
  | 'BOM'
  | 'Other';

interface DocumentUploadProps {
  onUpload: (files: File[], type: DocumentType, customType?: string) => void;
  isUploading?: boolean;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  isUploading = false,
  maxFileSize = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', '.png']
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<DocumentType>('Technical Data');
  const [customType, setCustomType] = useState('');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File "${file.name}" exceeds ${maxFileSize}MB limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type "${fileExtension}" is not supported`;
    }

    return null;
  }, [maxFileSize, acceptedTypes]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0 && !showTypeSelector) {
      setShowTypeSelector(true);
    }
  }, [validateFile, showTypeSelector]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setShowTypeSelector(false);
    }
  }, [selectedFiles.length]);

  const handleUpload = useCallback(() => {
    if (selectedFiles.length === 0) return;
    
    const finalType = documentType === 'Other' ? customType : documentType;
    if (documentType === 'Other' && !customType.trim()) {
      setErrors(['Please specify a custom document type']);
      return;
    }

    onUpload(selectedFiles, documentType, finalType);
    
    // Reset form
    setSelectedFiles([]);
    setShowTypeSelector(false);
    setDocumentType('Technical Data');
    setCustomType('');
    setErrors([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedFiles, documentType, customType, onUpload]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className={`w-6 h-6 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Documentation
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Choose Files
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Supported formats: {acceptedTypes.join(', ')}</p>
            <p>Maximum file size: {maxFileSize}MB</p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Type Selector */}
      {showTypeSelector && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Document Type</h4>
          
          <div className="space-y-3">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isUploading}
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {documentType === 'Other' && (
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter custom document type"
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isUploading}
              />
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedFiles([]);
                  setShowTypeSelector(false);
                  setDocumentType('Technical Data');
                  setCustomType('');
                  setErrors([]);
                }}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0 || (documentType === 'Other' && !customType.trim())}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload Documents'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;