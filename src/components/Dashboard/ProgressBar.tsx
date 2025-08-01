import React from 'react';

interface ProgressBarProps {
  percentage: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
  isLoading?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'blue',
  size = 'md',
  showLabel = true,
  label = 'Progress',
  className = '',
  isLoading = false
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        {showLabel && (
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-8"></div>
          </div>
        )}
        <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]} animate-pulse`}></div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span className="truncate">{label}</span>
          <span className="ml-2 flex-shrink-0">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${sizeClasses[size]} rounded-full transition-all duration-700 ease-out ${colorClasses[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;