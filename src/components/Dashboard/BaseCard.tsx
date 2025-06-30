import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Fixed structure with consistent heights */}
      <div className="h-full flex flex-col">
        {/* Header Section - Fixed height: 80px */}
        <div className="h-20 flex items-center justify-center px-6 pt-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gray-50 ${iconColor} flex-shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 text-center">{title}</h3>
          </div>
        </div>

        {/* Content Section - Flexible height with consistent internal structure */}
        <div className="flex-1 px-6 pb-6">
          {children}
        </div>

        {/* Action Section - Fixed height: 72px */}
        {action && (
          <div className="h-18 px-6 pb-6">
            <button
              onClick={action.onClick}
              className={`w-full h-10 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonVariant(action.variant)}`}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseCard;