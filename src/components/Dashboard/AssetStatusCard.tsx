import React from 'react';
import { Heart, Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface AssetStatusCardProps {
  totalAssets: number;
  assetsNeedingUpdate: number;
  lastUpdateDays: number;
  onUpdateAssets: () => void;
}

const AssetStatusCard: React.FC<AssetStatusCardProps> = ({
  totalAssets,
  assetsNeedingUpdate,
  lastUpdateDays,
  onUpdateAssets
}) => {
  const getStatusColor = () => {
    if (assetsNeedingUpdate === 0) return 'text-green-600';
    if (assetsNeedingUpdate <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusMessage = () => {
    if (assetsNeedingUpdate === 0) {
      return 'All equipment status current';
    }
    return `${assetsNeedingUpdate} asset${assetsNeedingUpdate > 1 ? 's' : ''} need status update`;
  };

  const getHeartAnimation = () => {
    if (assetsNeedingUpdate > 0) {
      return 'animate-pulse';
    }
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className={`p-2 rounded-lg bg-gray-50 ${getStatusColor()}`}>
            <Heart className={`w-5 h-5 ${getHeartAnimation()}`} />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Equipment Status</h3>
        </div>
        
        <div className="space-y-1 mb-4">
          <p className="text-3xl font-bold text-gray-900">{totalAssets - assetsNeedingUpdate}/{totalAssets}</p>
          <p className="text-sm text-gray-500">Assets with current status</p>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </span>
        </div>

        {lastUpdateDays > 0 && (
          <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
            <Clock className="w-3 h-3 mr-1" />
            <span>Last update: {lastUpdateDays} day{lastUpdateDays > 1 ? 's' : ''} ago</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <button
          onClick={onUpdateAssets}
          className={`text-sm font-medium transition-colors duration-200 ${
            assetsNeedingUpdate > 0 
              ? 'text-red-600 hover:text-red-700' 
              : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          {assetsNeedingUpdate > 0 ? 'Update Status Now' : 'Review Equipment'} →
        </button>
      </div>
    </div>
  );
};

export default AssetStatusCard;