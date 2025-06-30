import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Eye, Power } from 'lucide-react';
import BaseCard from './BaseCard';
import MetricDisplay from './MetricDisplay';
import ProgressBar from './ProgressBar';
import StatusIndicator from './StatusIndicator';
import { getInverseStatusType } from '../../utils/dashboardMetrics';

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
  const statusType = getInverseStatusType(assetsNotOperating, { good: 0, warning: 2 });

  const getStatusIcon = () => {
    switch (statusType) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return Power;
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
    if (assetsNotOperating === 0) {
      return '✅ All equipment is operational';
    }
    if (assetsNotOperating === 1) {
      return '⚠️ 1 asset not in operation';
    }
    return `⚠️ ${assetsNotOperating} assets not in operation`;
  };

  const getButtonText = () => {
    return assetsNotOperating === 0 ? 'Review Status' : 'Update Equipment Status';
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
      title="Equipment Status"
      icon={getStatusIcon()}
      iconColor={getStatusColor()}
      action={{
        label: getButtonText(),
        onClick: onUpdateAssets,
        variant: getButtonVariant()
      }}
    >
      {/* Consistent layout structure with fixed heights */}
      <div className="h-full flex flex-col justify-between">
        {/* Metric Section - Fixed height: 96px */}
        <div className="h-24 flex items-center justify-center">
          <MetricDisplay
            value={operatingAssets}
            subtitle={`of ${totalAssets} assets operating`}
          />
        </div>
        
        {/* Progress Bar Section - Fixed height: 32px */}
        <div className="h-8 flex items-center">
          <ProgressBar
            percentage={operatingPercentage}
            color={getProgressColor() as any}
            label="Operational Rate"
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

export default AssetStatusCard;