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
    return assetsWithNoPartsActivity === 0 ? 'Review History' : 'Review Assets';
  };

  const getButtonVariant = () => {
    switch (statusType) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
    }
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
      <div className="space-y-4">
        <MetricDisplay
          value={totalAssets - assetsWithNoPartsActivity}
          subtitle={`of ${totalAssets} assets with parts activity`}
        />
        
        <ProgressBar
          percentage={engagementPercentage}
          color={getProgressColor() as any}
          showLabel={false}
        />

        <StatusIndicator
          message={getStatusMessage()}
          type={statusType}
          detail={getDetailMessage()}
          icon={assetsWithNoPartsActivity > 0 ? Package : undefined}
        />
      </div>
    </BaseCard>
  );
};

export default PartsEngagementCard;