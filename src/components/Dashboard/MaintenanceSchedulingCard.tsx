import React from 'react';
import { Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface MaintenanceSchedulingCardProps {
  totalAssets: number;
  assetsWithMaintenance: number;
  onScheduleMaintenance: () => void;
}

const MaintenanceSchedulingCard: React.FC<MaintenanceSchedulingCardProps> = ({
  totalAssets,
  assetsWithMaintenance,
  onScheduleMaintenance
}) => {
  const percentage = totalAssets > 0 ? Math.round((assetsWithMaintenance / totalAssets) * 100) : 0;
  
  const getStatusColor = () => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (percentage >= 70) return 'bg-green-600';
    if (percentage >= 30) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getStatusIcon = () => {
    if (percentage >= 70) return <CheckCircle className="w-5 h-5" />;
    if (percentage >= 30) return <Clock className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getStatusMessage = () => {
    if (percentage === 100) {
      return '🎉 Perfect! All equipment has maintenance scheduled';
    }
    if (percentage >= 70) {
      return 'Great progress on maintenance planning';
    }
    if (percentage >= 30) {
      return 'Good start - keep scheduling maintenance';
    }
    return 'Most equipment needs maintenance scheduling';
  };

  const getButtonText = () => {
    if (percentage === 100) {
      return 'Review Schedule';
    }
    if (percentage >= 70) {
      return 'Complete Remaining';
    }
    return 'Schedule Maintenance';
  };

  const getButtonStyle = () => {
    if (percentage === 100) {
      return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
    }
    if (percentage >= 70) {
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
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
          <h3 className="text-sm font-medium text-gray-600">Maintenance Scheduled</h3>
        </div>
        
        <div className="space-y-1 mb-4">
          <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
          <p className="text-sm text-gray-500">{assetsWithMaintenance} of {totalAssets} assets</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ease-out ${getStatusBgColor()}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </span>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-100 text-center">
        <button
          onClick={onScheduleMaintenance}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonStyle()}`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default MaintenanceSchedulingCard;