import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import BaseCard from './BaseCard';
import MetricDisplay from './MetricDisplay';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'text-blue-600',
  trend,
  action,
  className = ''
}) => {
  return (
    <BaseCard
      title={title}
      icon={icon}
      iconColor={iconColor}
      action={action}
      className={className}
    >
      {/* Consistent layout structure matching other cards */}
      <div className="h-full flex flex-col justify-between">
        {/* Metric Section - Fixed height: 96px */}
        <div className="h-24 flex items-center justify-center">
          <MetricDisplay
            value={value}
            subtitle={subtitle}
            trend={trend}
          />
        </div>
        
        {/* Progress Bar Placeholder - Fixed height: 32px for alignment */}
        <div className="h-8 flex items-center justify-center">
          {/* Empty space to maintain alignment with other cards */}
        </div>

        {/* Status Section - Fixed height: 48px */}
        <div className="h-12 flex items-center justify-center">
          {/* Empty space to maintain alignment with other cards */}
        </div>
      </div>
    </BaseCard>
  );
};

export default StatCard;