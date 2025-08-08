import React from 'react';
import { AlertTriangle, Clock, CheckCircle, Package, RefreshCw } from 'lucide-react';
import { WearComponent } from '../../types/Asset';
import { getStockDisplayInfo, formatLastUpdated } from '../../utils/stockUtils';
import { calculateMaintenanceStatus } from '../../utils/maintenanceUtils';
import { formatDate } from '../../utils/dateUtils';

interface WearComponentCardProps {
  component: WearComponent;
  onRefreshStock?: (partNumber: string) => void;
}

const WearComponentCard: React.FC<WearComponentCardProps> = ({ 
  component, 
  onRefreshStock 
}) => {
  const maintenanceStatus = calculateMaintenanceStatus(component);
  const stockInfo = getStockDisplayInfo(component);
  const { status, daysUntilDue, nextDueDate } = maintenanceStatus;

  const getStatusIcon = () => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'due-soon':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'overdue':
        return 'border-red-200 bg-red-50';
      case 'due-soon':
        return 'border-yellow-200 bg-yellow-50';
      case 'good':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusText = () => {
    if (status === 'overdue') {
      return `Overdue by ${Math.abs(daysUntilDue!)} days`;
    } else if (status === 'due-soon') {
      return `Due in ${daysUntilDue} days`;
    } else if (status === 'good') {
      return `Next due: ${nextDueDate?.toLocaleDateString()}`;
    } else {
      return 'Schedule not available';
    }
  };

  const formatLastReplaced = (dateString: string | null) => {
    if (!dateString) return 'Never replaced';
    return formatDate(dateString);
  };

  const handleRefreshStock = () => {
    if (onRefreshStock) {
      onRefreshStock(component.partNumber);
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div className="flex flex-col items-start">
            <h3 className="font-semibold text-gray-900 text-sm">
              Part #{component.partNumber}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {getStatusText()}
            </p>
          </div>
        </div>
        
        {/* Stock Indicator */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockInfo.colorClass}`}>
            <Package className={`w-3 h-3 mr-1 ${stockInfo.iconClass}`} />
            {stockInfo.displayText}
          </div>
          
          {component.stockInfo && onRefreshStock && (
            <button
              onClick={handleRefreshStock}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded"
              title="Refresh stock data"
              aria-label="Refresh stock data"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-sm text-gray-900 font-medium">
            {component.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex flex-col">
            <span className="font-medium">Interval:</span>
            <span>{component.recommendedReplacementInterval || 'Not specified'}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Last Replaced:</span>
            <span>{formatLastReplaced(component.lastReplaced)}</span>
          </div>
        </div>
        
        {/* Stock Details */}
        {component.stockInfo && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span>
                On Hand: {component.stockInfo.quantityOnHand} | 
                Available: {component.stockInfo.quantityAvailable}
              </span>
              <span className="text-gray-400">
                {formatLastUpdated(component.stockInfo.lastUpdated)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WearComponentCard;