import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnHover?: boolean;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  position = 'top',
  showOnHover = true
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
  };

  return (
    <div className="relative inline-block">
      <button
        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
        onMouseEnter={() => showOnHover && setIsVisible(true)}
        onMouseLeave={() => showOnHover && setIsVisible(false)}
        onClick={() => !showOnHover && setIsVisible(!isVisible)}
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 max-w-xs shadow-lg">
            {!showOnHover && (
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-1 right-1 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            
            <div className="font-medium mb-1">{title}</div>
            <div className="text-gray-300 text-xs leading-relaxed">{content}</div>
          </div>
          
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;