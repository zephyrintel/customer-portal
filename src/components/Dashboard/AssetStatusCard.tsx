import React from 'react';
import { AlertTriangle, CheckCircle, Power } from 'lucide-react';
import BaseCard from './BaseCard';
import MetricDisplay from './MetricDisplay';
import ProgressBar from './ProgressBar';
// import StatusIndicator from './StatusIndicator';
import { getInverseStatusType } from '../../utils/dashboardMetrics';

interface AssetStatusCardProps {
  totalAssets: number;
  assetsNotOperating: number;
  onUpdateAssets: () => void;
  isLoading?: boolean;
}

const AssetStatusCard: React.FC<AssetStatusCardProps> = ({
  totalAssets,
  assetsNotOperating,
  onUpdateAssets,
  isLoading = false
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
  const getProgressColor = (): 'green' | 'yellow' | 'red' => {
    switch (statusType) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
    }
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

  const getMetricColor = () => {
    if (operatingPercentage >= 70) return 'text-green-600';
    if (operatingPercentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCautionSymbol = () => {
    if (assetsNotOperating === 0) return '✅';
    return '⚠️';
  };

  return (
    <BaseCard
      title="Equipment Status"
      icon={getStatusIcon()}
      iconColor={getStatusColor()}
      action={{
        label: getButtonText(),
        onClick: onUpdateAssets,
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
            value={assetsNotOperating}
            subtitle={`of ${totalAssets} assets not operating`}
            valueColor={getMetricColor()}
            cautionSymbol={getCautionSymbol()}
            isLoading={isLoading}
          />
        </div>
        
        {/* Progress Bar Section - Fixed height: 24px */}
        <div className="h-6 flex items-center">
          <ProgressBar
            percentage={operatingPercentage}
            color={getProgressColor()}
            label="Operational Rate"
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

export default AssetStatusCard;
