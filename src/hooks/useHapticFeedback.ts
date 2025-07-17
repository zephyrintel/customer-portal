import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Check if the device supports haptic feedback
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([10, 50, 10]);
          break;
        case 'warning':
          navigator.vibrate([20, 100, 20]);
          break;
        case 'error':
          navigator.vibrate([50, 100, 50, 100, 50]);
          break;
        default:
          navigator.vibrate(10);
      }
    }
  }, []);

  return { triggerHaptic };
};