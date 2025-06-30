import React from 'react';
import { Search, Package, Plus, Eye } from 'lucide-react';

interface AssetKnowledgeCardProps {
  knownAssets: number;
  estimatedTotal: number;
  completionPercentage: number;
  onDiscoverAssets: () => void;
}

const AssetKnowledgeCard: React.FC<AssetKnowledgeCardProps> = ({
  knownAssets,
  estimatedTotal,
  completionPercentage,
  onDiscoverAssets
}) => {
  const getCompletionColor = () => {
    if (completionPercentage >= 80) return 'text-green-600';
    if (completionPercentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = () => {
    if (completionPercentage >= 80) return 'bg-green-600';
    if (completionPercentage >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className={`p-2 rounded-lg bg-gray-50 ${getCompletionColor()}`}>
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Equipment Discovery</h3>
        </div>
        
        <div className="space-y-1 mb-4">
          <p className="text-3xl font-bold text-gray-900">{knownAssets}</p>
          <p className="text-sm text-gray-500">of ~{estimatedTotal} assets tracked</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Plant Coverage</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ease-out ${getCompletionBgColor()}`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <span className={`text-sm font-medium ${getCompletionColor()}`}>
            {completionPercentage < 80 ? 'Missing equipment?' : 'Great coverage!'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <button
          onClick={onDiscoverAssets}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          {completionPercentage < 80 ? 'Find More Assets' : 'Review Coverage'} →
        </button>
      </div>
    </div>
  );
};

export default AssetKnowledgeCard;