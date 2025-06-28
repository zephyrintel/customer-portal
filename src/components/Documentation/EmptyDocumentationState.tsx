import React from 'react';
import { FileText, Upload, BookOpen } from 'lucide-react';

interface EmptyDocumentationStateProps {
  onUploadClick: () => void;
}

const EmptyDocumentationState: React.FC<EmptyDocumentationStateProps> = ({
  onUploadClick
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
          Documentation
        </h2>
      </div>
      
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No Documentation Available
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Upload manuals, technical data sheets, and other important documentation for this asset to keep everything organized and accessible.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={onUploadClick}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Documentation
          </button>
          
          <div className="text-sm text-gray-500">
            <p className="font-medium mb-2">Commonly uploaded documents:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Operating Manual',
                'Maintenance Guide',
                'Safety Instructions',
                'Parts Catalog',
                'Technical Data',
                'BOM'
              ].map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyDocumentationState;