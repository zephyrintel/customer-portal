import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatusIndicatorProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  icon?: LucideIcon;
  detail?: string;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  message,
  type,
  icon: Icon,
  detail,
  className = ''
}) => {
  const getTypeStyles = () => {
    const styles = {
      success: {
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
      },
      warning: {
        text: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      },
      error: {
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      },
      info: {
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      }
    };
    return styles[type];
  };

  const styles = getTypeStyles();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-center">
        <span className={`text-sm font-medium ${styles.text}`}>
          {message}
        </span>
      </div>

      {/* Yellow box removed - no detail section displayed */}
    </div>
  );
};

export default StatusIndicator;