import React from 'react';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, Eye } from 'lucide-react';

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
    if (engagementPercentage >= 70) return 'text-green-600';
    if (engagementPercentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (engagementPercentage >= 70) return 'bg-green-600';
    if (engagementPercentage >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getStatusIcon = () => {
    if (engagementPercentage >= 70) return <TrendingUp className="w-5 h-5" />;
    if (engagementPercentage >= 40) return <ShoppingCart className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getStatusMessage = () => {
    if (assetsWithNoPartsActivity === 0) {
      return '🎉 Excellent! All assets have parts activity';
    }
    if (assetsWithNoPartsActivity === 1) {
      return '1 asset has never ordered parts';
    }
    return `${assetsWithNoPartsActivity} assets have never ordered parts`;
  };

  const getButtonText = () => {
    if (assetsWithNoPartsActivity === 0) {
      return 'Review Activity';
    }
    if (assetsWithNoPartsActivity <= 2) {
      return 'View Opportunities';
    }
    return 'Identify Opportunities';
  };

  const getButtonStyle = () => {
    if (assetsWithNoPartsActivity === 0) {
      return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
    }
    if (assetsWithNoPartsActivity <= 2) {
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }
    return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
  };

  const getOpportunityValue = () => {
    // Estimate potential revenue per asset (this would be configurable in production)
    const avgPartsValuePerAsset = 1500;
    return assetsWithNoPartsActivity * avgPartsValuePerAsset;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="text-center flex-1">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className={`p-2 rounded-lg bg-gray-50 ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <h3 className="text-sm font-medium text-gray-600">Parts Engagement</h3>
        </div>
        
        <div className="space-y-1 mb-4">
          <p className="text-3xl font-bold text-gray-900">{engagementPercentage}%</p>
          <p className="text-sm text-gray-500">
            {totalAssets - assetsWithNoPartsActivity} of {totalAssets} assets active
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

          {assetsWithNoPartsActivity > 0 && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-center space-x-1">
                <Package className="w-3 h-3" />
                <span>Potential opportunity: {formatCurrency(getOpportunityValue())}</span>
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