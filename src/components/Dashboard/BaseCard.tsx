import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BaseCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
  className?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-blue-600',
  children,
  action,
  className = ''
}) => {
  const getButtonVariant = (variant: string = 'primary') => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };
    return variants[variant as keyof typeof variants] || variants.primary;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 text-center">{title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4 flex-1 flex flex-col justify-center">
        {children}
      </div>

      {/* Action */}
      {action && (
        <div className="p-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <button
              onClick={action.onClick}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full ${getButtonVariant(action.variant)}`}
            >
              {action.label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseCard;