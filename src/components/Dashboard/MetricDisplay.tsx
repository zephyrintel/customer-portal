import React from 'react';

interface MetricDisplayProps {
  value: string | number;
  subtitle?: string;
  valueColor?: string;
  cautionSymbol?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  value,
  subtitle,
  valueColor = 'text-gray-900',
  cautionSymbol,
  trend,
  className = ''
}) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="space-y-1 mb-4">
        <div className="flex items-center justify-center space-x-2">
          {cautionSymbol && (
            <span className="text-2xl">{cautionSymbol}</span>
          )}
          <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center justify-center">
          <span className={`text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-gray-500 ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default MetricDisplay;