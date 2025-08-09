import React from 'react';

interface StatusIndicatorProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  message,
  type,
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
    } as const;
    return styles[type];
  };

  const styles = getTypeStyles();

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-center text-center">
        <span className={`text-xs font-medium ${styles.text} leading-tight px-2`}>
          {message}
        </span>
      </div>
    </div>
  );
};

export default StatusIndicator;
