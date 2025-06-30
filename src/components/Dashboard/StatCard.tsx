import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

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
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
  action,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full ${className}`}>
      <div className="text-center flex-1">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        
        <div className="space-y-1 mb-4">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        
        {trend && (
          <div className="flex items-center justify-center mb-4">
            <span className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-sm text-gray-500 ml-1">{trend.label}</span>
          </div>
        )}
      </div>
      
      {action && (
        <div className="mt-auto pt-4 border-t border-gray-100 text-center">
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default StatCard;