import React, { ReactNode } from 'react';

interface InfoCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accentColorClass?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  label,
  value,
  icon,
  accentColorClass
}) => {
  // Base classes following the project's Tailwind guidelines
  const baseClasses = "bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4 sm:p-6";
  
  // Apply accent color classes for ring and background tint if provided
  const accentClasses = accentColorClass 
    ? `ring-2 ${accentColorClass.includes('ring-') ? accentColorClass : `ring-${accentColorClass}-500`} ${accentColorClass.includes('bg-') ? accentColorClass.replace('ring-', 'bg-').replace('-500', '-50') : `bg-${accentColorClass}-50`}`
    : '';

  const combinedClasses = `${baseClasses} ${accentClasses}`.trim();

  return (
    <div className={combinedClasses}>
      <div className="flex items-start space-x-3">
        {icon && (
          <div className="flex-shrink-0 mt-1">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-600 leading-tight">
              {label}
            </label>
            <div className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
              {value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
