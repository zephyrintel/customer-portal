import React from 'react';
import { Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import BaseCard from './BaseCard';
import MetricDisplay from './MetricDisplay';
import ProgressBar from './ProgressBar';
import StatusIndicator from './StatusIndicator';
import { getStatusType } from '../../utils/dashboardMetrics';

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
  const statusType = getStatusType(percentage, { good: 70, warning: 30 });
  
  const getStatusIcon = () => {
    switch (statusType) {
      case 'success': return CheckCircle;
      case 'warning': return Clock;
      case 'error': return AlertTriangle;
    }
  };

  const getStatusColor = () => {
    switch (statusType) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
    }
  };

  const getProgressColor = () => {
    switch (statusType) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
    }
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
    if (percentage === 100) return 'Review Schedule';
    if (percentage >= 70) return 'Complete Remaining';
    return 'Schedule Maintenance';
  };

  const getButtonVariant = () => {
    switch (statusType) {
      case 'success': return 'success';
      case 'warning': return 'primary';
      case 'error': return 'danger';
    }
  };

  return (
    <BaseCard
      title="Maintenance Scheduled"
      icon={getStatusIcon()}
      iconColor={getStatusColor()}
      action={{
        label: getButtonText(),
        onClick: onScheduleMaintenance,
        variant: getButtonVariant()
      }}
    >
      {/* Consistent layout structure with fixed heights */}
      <div className="h-full flex flex-col justify-between">
        {/* Metric Section - Fixed height: 96px */}
        <div className="h-24 flex items-center justify-center">
          <MetricDisplay
            value={`${percentage}%`}
            subtitle={`${assetsWithMaintenance} of ${totalAssets} assets`}
          />
        </div>
        
        {/* Progress Bar Section - Fixed height: 32px */}
        <div className="h-8 flex items-center">
          <ProgressBar
            percentage={percentage}
            color={getProgressColor() as any}
            showLabel={false}
          />
        </div>

        {/* Status Section - Fixed height: 48px */}
        <div className="h-12 flex items-center justify-center">
          <StatusIndicator
            message={getStatusMessage()}
            type={statusType}
          />
        </div>
      </div>
    </BaseCard>
  );
};

export default MaintenanceSchedulingCard;