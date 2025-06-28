import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmptyStateCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel: string;
  onAction: () => void;
  iconColor?: string;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  iconColor = 'text-gray-400'
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow duration-200">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4 ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      
      <button
        onClick={onAction}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {actionLabel}
      </button>
    </div>
  );
};

export default EmptyStateCard;