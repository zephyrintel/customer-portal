import React from 'react';
import { Package, AlertTriangle, CheckCircle, Eye, Clock } from 'lucide-react';

interface PartsEngagementCardProps {
  totalAssets: number;
  assetsWithNoPartsActivity: number;
  onViewOpportunities: () => void;
}

const PartsEngagementCard: React.FC<PartsEngagementCardProps> = ({
  totalAssets,
  assetsWithNoPartsActivity,
  onViewOpportunities
}) => {
  const engagementPercentage = totalAssets > 0 
    ? Math.round(((totalAssets - assetsWithNoPartsActivity) / totalAssets) * 100) 
    : 0;
  
  const getStatusColor = () => {
    if (assetsWithNoPartsActivity === 0) return 'text-green-600';
    if (assetsWithNoPartsActivity <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (assetsWithNoPartsActivity === 0) return 'bg-green-600';
    if (assetsWithNoPartsActivity <= 2) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getStatusIcon = () => {
    if (assetsWithNoPartsActivity === 0) return <CheckCircle className="w-5 h-5" />;
    if (assetsWithNoPartsActivity <= 2) return <Clock className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getStatusMessage = () => {
    if (assetsWithNoPartsActivity === 0) {
      return '✅ All equipment has maintenance history';
    }
    if (assetsWithNoPartsActivity === 1) {
      return '⚠️ 1 asset has no parts history';
    }
    return `⚠️ ${assetsWithNoPartsActivity} assets have no parts history`;
  };

  const getDetailMessage = () => {
    if (assetsWithNoPartsActivity === 0) {
      return 'Great maintenance practices!';
    }
    if (assetsWithNoPartsActivity <= 2) {
      return 'Consider reviewing maintenance needs';
    }
    return 'Multiple assets may need attention';
  };

  const getButtonText = () => {
    if (assetsWithNoPartsActivity === 0) {
      return 'Review History';
    }
    return 'Review Assets';
  };

  const getButtonStyle = () => {
    if (assetsWithNoPartsActivity === 0) {
      return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
    }
    if (assetsWithNoPartsActivity <= 2) {
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
          <h3 className="text-sm font-medium text-gray-600">Parts History</h3>
        </div>
        
        <div className="space-y-1 mb-4">
          <p className="text-3xl font-bold text-gray-900">{totalAssets - assetsWithNoPartsActivity}</p>
          <p className="text-sm text-gray-500">
            of {totalAssets} assets with parts activity
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ease-out ${getStatusBgColor()}`}
              style={{ width: `${engagementPercentage}%` }}
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

          {assetsWithNoPartsActivity > 0 && (
            <div className={`text-xs rounded-lg p-2 mt-2 ${
              assetsWithNoPartsActivity <= 2 
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center justify-center space-x-1">
                <Package className="w-3 h-3" />
                <span>
                  {assetsWithNoPartsActivity === 1 
                    ? 'Asset may need maintenance review'
                    : 'Assets may need maintenance review'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-100 text-center">
        <button
          onClick={onViewOpportunities}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonStyle()}`}
        >
          <Eye className="w-4 h-4 mr-2" />
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default PartsEngagementCard;