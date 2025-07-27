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
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  value,
  subtitle,
  valueColor = 'text-gray-900',
  cautionSymbol,
  trend,
  className = '',
  size = 'lg',
  isLoading = false
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xl';
      case 'md':
        return 'text-2xl';
      case 'lg':
      default:
        return 'text-3xl sm:text-4xl';
    }
  };

  if (isLoading) {
    return (
      <div className={`text-center ${className}`}>
        <div className="space-y-2 mb-4">
          <div className={`h-8 sm:h-10 bg-gray-200 rounded animate-pulse mx-auto ${
            size === 'sm' ? 'w-16' : size === 'md' ? 'w-20' : 'w-24'
          }`}></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="space-y-1 mb-4">
        <div className="flex items-center justify-center space-x-2">
          {cautionSymbol && (
            <span className="text-xl sm:text-2xl">{cautionSymbol}</span>
          )}
          <p className={`${getSizeClasses()} font-bold ${valueColor} leading-none`}>{value}</p>
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 leading-tight">{subtitle}</p>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center justify-center space-x-1">
          <span className={`text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs sm:text-sm text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default MetricDisplay;