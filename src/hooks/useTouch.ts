import { useEffect, useRef, useState } from 'react';

interface TouchHandlers {
  onTouchStart?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent) => void;
  onLongPress?: (e: TouchEvent) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchOptions {
  longPressDelay?: number;
  swipeThreshold?: number;
  preventScroll?: boolean;
}

export const useTouch = (handlers: TouchHandlers, options: TouchOptions = {}) => {
  const {
    longPressDelay = 500,
    swipeThreshold = 50,
    preventScroll = false
  } = options;

  const touchRef = useRef<HTMLElement>(null);
  const [touchState, setTouchState] = useState({
    startX: 0,
    startY: 0,
    startTime: 0,
    isLongPress: false,
    longPressTimer: null as NodeJS.Timeout | null
  });

  useEffect(() => {
    const element = touchRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const startTime = Date.now();
      
      setTouchState(prev => ({
        ...prev,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime,
        isLongPress: false
      }));

      // Set up long press timer
      const timer = setTimeout(() => {
        setTouchState(prev => ({ ...prev, isLongPress: true }));
        handlers.onLongPress?.(e);
      }, longPressDelay);

      setTouchState(prev => ({ ...prev, longPressTimer: timer }));
      
      if (preventScroll) {
        e.preventDefault();
      }
      
      handlers.onTouchStart?.(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (preventScroll) {
        e.preventDefault();
      }
      
      handlers.onTouchMove?.(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const endTime = Date.now();
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;
      const deltaTime = endTime - touchState.startTime;

      // Clear long press timer
      if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
      }

      // Handle swipe gestures
      if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            handlers.onSwipeRight?.();
          } else {
            handlers.onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            handlers.onSwipeDown?.();
          } else {
            handlers.onSwipeUp?.();
          }
        }
      }

      handlers.onTouchEnd?.(e);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
      }
    };
  }, [handlers, longPressDelay, swipeThreshold, preventScroll, touchState.startX, touchState.startY, touchState.startTime, touchState.longPressTimer]);

  return touchRef;
};

// Hook for detecting device type
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024 && isTouchDevice) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
};

// Hook for pull-to-refresh functionality
export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const touchHandlers = {
    onTouchStart: (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setPullDistance(0);
      }
    },
    onTouchMove: (e: TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        const touch = e.touches[0];
        const startY = touch.clientY;
        const currentY = touch.clientY;
        const distance = Math.max(0, currentY - startY);
        
        if (distance > 0) {
          setPullDistance(Math.min(distance, 100));
          e.preventDefault();
        }
      }
    },
    onTouchEnd: async () => {
      if (pullDistance > 60 && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    }
  };

  const touchRef = useTouch(touchHandlers, { preventScroll: pullDistance > 0 });

  return {
    touchRef,
    isRefreshing,
    pullDistance,
    showRefreshIndicator: pullDistance > 30 || isRefreshing
  };
};