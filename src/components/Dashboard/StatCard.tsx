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
      {/* Centered metric display with consistent height */}
      <div className="h-32 flex items-center justify-center">
        <MetricDisplay
          value={value}
          subtitle={subtitle}
          trend={trend}
        />
      </div>
    </BaseCard>
  );
};

export default StatCard;