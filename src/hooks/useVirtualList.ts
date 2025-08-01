import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UseVirtualListProps,
  UseVirtualListReturn,
  VirtualListItem
} from '../types/Maintenance';

export const useVirtualList = <T = any>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  keySelector = (item: any) => item.id || String(items.indexOf(item))
}: UseVirtualListProps<T>): UseVirtualListReturn<T> => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length
    );

    const visibleStartIndex = Math.max(0, startIndex - overscan);
    const visibleEndIndex = Math.min(endIndex + overscan, items.length);

    return {
      startIndex: visibleStartIndex,
      endIndex: visibleEndIndex,
      offsetY: visibleStartIndex * itemHeight
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      key: keySelector(item)
    }));
  }, [items, visibleRange.startIndex, visibleRange.endIndex, keySelector]);

  // Return the full items array for compatibility with selection hooks
  const allItems = useMemo(() => items, [items]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    allItems,
    totalHeight,
    offsetY: visibleRange.offsetY,
    handleScroll
  };
};