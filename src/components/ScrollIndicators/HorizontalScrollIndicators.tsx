import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollIndicatorsProps {
  showLeftScroll: boolean;
  showRightScroll: boolean;
  className?: string;
  chevronSize?: string;
  gradientWidth?: string;
}

/**
 * Reusable horizontal scroll indicators with chevron gradient overlays
 * Should be positioned absolutely within a relative container that wraps the scrollable content
 */
const HorizontalScrollIndicators: React.FC<HorizontalScrollIndicatorsProps> = ({
  showLeftScroll,
  showRightScroll,
  className = '',
  chevronSize = 'w-5 h-5',
  gradientWidth = 'pl-2 pr-8'
}) => {
  return (
    <>
      {/* Left scroll indicator */}
      {showLeftScroll && (
        <div 
          className={`absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-white via-white to-transparent ${gradientWidth} pointer-events-none ${className}`}
        >
          <ChevronLeft className={`text-gray-600 ${chevronSize}`} />
        </div>
      )}
      
      {/* Right scroll indicator */}
      {showRightScroll && (
        <div 
          className={`absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-white via-white to-transparent pr-2 pl-8 pointer-events-none ${className}`}
        >
          <ChevronRight className={`text-gray-600 ${chevronSize}`} />
        </div>
      )}
    </>
  );
};

export default HorizontalScrollIndicators;
