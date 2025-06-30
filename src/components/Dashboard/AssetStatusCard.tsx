import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Eye, Power } from 'lucide-react';

interface AssetStatusCardProps {
  totalAssets: number;
  assetsNotOperating: number;
  onUpdateAssets: () => void;
}

const AssetStatusCard: React.FC<AssetStatusCardProps> = ({
  totalAssets,
  assetsNotOperating,
  onUpdateAssets
}) => {
  const operatingAssets = totalAssets - assetsNotOperating;
  const operatingPercentage = totalAssets > 0 ? Math.round((operatingAssets / totalAssets) * 100) : 0;

  const getStatusColor = () => {
    if (assetsNotOperating === 0) return 'text-green-600';
    if (assetsNotOperating <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (assetsNotOperating === 0) return 'bg-green-600';
    if (assetsNotOperating <= 2) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getStatusIcon = () => {
    if (assetsNotOperating === 0) return <CheckCircle className="w-5 h-5" />;
    if (assetsNotOperating <= 2) return <AlertTriangle className="w-5 h-5" />;
    return <Power className="w-5 h-5" />;
  };

  const getStatusMessage = () => {
    if (assetsNotOperating === 0) {
      return '✅ All equipment is operational';
    }
    if (assetsNotOperating === 1) {
      return '⚠️ 1 asset not in operation';
    }
    return `⚠️ ${assetsNotOperating} assets not in operation`;
  };

  const getDetailMessage = () => {
    if (assetsNotOperating === 0) {
      return 'Excellent equipment utilization!';
    }
    if (assetsNotOperating <= 2) {
      return 'Some equipment may need commissioning';
    }
    return 'Multiple assets need status updates';
  };

  const getButtonText = () => {
    if (assetsNotOperating === 0) {
      return 'Review Status';
    }
    return 'Update Equipment Status';
  };

  const getButtonStyle = () => {
    if (assetsNotOperating === 0) {
      return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
    }
    if (assetsNotOperating <= 2) {
      return 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500';
    }
    return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="text-center flex-1">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className={`p-2 rounded-lg bg-gray-50 ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <h3 className="text-sm font-medium text-gray-600">Equipment Status</h3>
        </div>
        
        <div className="space-y-1 mb-4">
          <p className="text-3xl font-bold text-gray-900">{operatingAssets}</p>
          <p className="text-sm text-gray-500">
            of {totalAssets} assets operating
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Operational Rate</span>
            <span>{operatingPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ease-out ${getStatusBgColor()}`}
              style={{ width: `${operatingPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusMessage()}
            </span>
          </div>

          <div className="text-xs text-gray-600">
            {getDetailMessage()}
          </div>

          {assetsNotOperating > 0 && (
            <div className={`text-xs rounded-lg p-2 mt-2 ${
              assetsNotOperating <= 2 
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center justify-center space-x-1">
                <Activity className="w-3 h-3" />
                <span>
                  {assetsNotOperating === 1 
                    ? 'Asset status needs updating'
                    : 'Asset statuses need updating'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-100 text-center">
        <button
          onClick={onUpdateAssets}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonStyle()}`}
        >
          <Eye className="w-4 h-4 mr-2" />
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default AssetStatusCard;