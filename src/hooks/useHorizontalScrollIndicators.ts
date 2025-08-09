import { useRef, useState, useEffect, useCallback } from 'react';

interface UseHorizontalScrollIndicatorsReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  showLeftScroll: boolean;
  showRightScroll: boolean;
  handleScroll: () => void;
}

/**
 * Reusable hook for managing horizontal scroll indicators
 * Provides scroll state tracking and methods for detecting when content is scrollable
 * in either direction, commonly used with chevron gradient overlays
 */
export const useHorizontalScrollIndicators = (
  dependencies: unknown[] = []
): UseHorizontalScrollIndicatorsReturn => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Check scroll position to show/hide scroll indicators
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  // Initialize scroll indicators on mount and when dependencies change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Initial check
      handleScroll();
      
      // Add scroll listener
      container.addEventListener('scroll', handleScroll);
      
      // Add resize listener to handle container size changes
      const handleResize = () => {
        handleScroll();
      };
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [handleScroll, ...dependencies]);

  return {
    scrollContainerRef,
    showLeftScroll,
    showRightScroll,
    handleScroll
  };
};

export default useHorizontalScrollIndicators;
