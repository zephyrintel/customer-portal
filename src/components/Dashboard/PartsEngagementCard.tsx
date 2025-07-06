import React from 'react';
import { Package, AlertTriangle, CheckCircle, Eye, Clock } from 'lucide-react';
import BaseCard from './BaseCard';
import MetricDisplay from './MetricDisplay';
import ProgressBar from './ProgressBar';
import StatusIndicator from './StatusIndicator';
import { getInverseStatusType } from '../../utils/dashboardMetrics';

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
  
  const statusType = getInverseStatusType(assetsWithNoPartsActivity, { good: 0, warning: 2 });
  
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
      case 'warning': return 'text-yellow-600';
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
    if (assetsWithNoPartsActivity === 0) {
      return 'All equipment has maintenance history';
    }
    if (assetsWithNoPartsActivity === 1) {
      return '1 asset has no parts history';
    }
    return `${assetsWithNoPartsActivity} assets have no parts history`;
  };

  const getButtonText = () => {
    return assetsWithNoPartsActivity === 0 ? 'Review History' : 'Review Assets';
  };

  const getButtonVariant = () => {
    switch (statusType) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
    }
  };

  const getMetricColor = () => {
    if (engagementPercentage >= 70) return 'text-green-600';
    if (engagementPercentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCautionSymbol = () => {
    if (assetsWithNoPartsActivity === 0) return '✅';
    return '⚠️';
  };

  return (
    <BaseCard
      title="Parts History"
      icon={getStatusIcon()}
      iconColor={getStatusColor()}
      action={{
        label: getButtonText(),
        onClick: onViewOpportunities,
        variant: getButtonVariant()
      }}
    >
      {/* Consistent layout structure with fixed heights */}
      <div className="h-full flex flex-col justify-between">
        {/* Metric Section - Fixed height: 96px */}
        <div className="h-24 flex items-center justify-center">
          <MetricDisplay
            value={assetsWithNoPartsActivity}
            valueColor={getMetricColor()}
            cautionSymbol={getCautionSymbol()}
          />
        </div>
        
        {/* Progress Bar Section - Fixed height: 32px */}
        <div className="h-8 flex items-center">
          <ProgressBar
            percentage={engagementPercentage}
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

export default PartsEngagementCard;