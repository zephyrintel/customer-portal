import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseVirtualListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualList = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: UseVirtualListProps) => {
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
      index: visibleRange.startIndex + index
    }));
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY: visibleRange.offsetY,
    handleScroll
  };
};