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

  const getButtonStyle = () => {
    if (assetsNeedingUpdate === 0) {
      return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
    }
    if (assetsNeedingUpdate <= 2) {
      return 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500';
    }
    return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="text-center flex-1">
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
      
      <div className="mt-auto pt-4 border-t border-gray-100 text-center">
        <button
          onClick={onUpdateAssets}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonStyle()}`}
        >
          <Heart className="w-4 h-4 mr-2" />
          {assetsNeedingUpdate > 0 ? 'Update Status Now' : 'Review Equipment'}
        </button>
      </div>
    </div>
  );
};

export default AssetStatusCard;