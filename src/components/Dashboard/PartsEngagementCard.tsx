import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import BaseCard from './BaseCard';
import MetricDisplay from './MetricDisplay';
import ProgressBar from './ProgressBar';
// import StatusIndicator from './StatusIndicator';
import { getInverseStatusType } from '../../utils/dashboardMetrics';

interface PartsEngagementCardProps {
  totalAssets: number;
  assetsWithNoPartsActivity: number;
  onViewOpportunities: () => void;
  isLoading?: boolean;
}

const PartsEngagementCard: React.FC<PartsEngagementCardProps> = ({
  totalAssets,
  assetsWithNoPartsActivity,
  onViewOpportunities,
  isLoading = false
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
  const getProgressColor = (): 'green' | 'yellow' | 'red' => {
    switch (statusType) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
    }
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
        variant: getButtonVariant(),
        isLoading: isLoading
      }}
      isLoading={isLoading}
    >
      {/* Consistent layout structure with fixed heights */}
      <div className="h-full flex flex-col justify-between">
        {/* Metric Section - Fixed height: 80px */}
        <div className="h-20 flex items-center justify-center">
          <MetricDisplay
            value={assetsWithNoPartsActivity}
            subtitle={`of ${totalAssets} assets with no parts history`}
            valueColor={getMetricColor()}
            cautionSymbol={getCautionSymbol()}
            isLoading={isLoading}
          />
        </div>
        
        {/* Progress Bar Section - Fixed height: 24px */}
        <div className="h-6 flex items-center">
          <ProgressBar
            percentage={engagementPercentage}
            color={getProgressColor()}
            showLabel={false}
            isLoading={isLoading}
          />
        </div>

        {/* Status Section - Fixed height: 32px */}
        <div className="h-8 flex items-center justify-center">
          {/* Empty space to maintain alignment with other cards */}
        </div>
      </div>
    </BaseCard>
  );
};

export default PartsEngagementCard;
