import { useState, useCallback, useMemo } from 'react';
import {
  SelectionState,
  SelectableItem,
  UseAssetSelectionOptions,
  UseAssetSelectionReturn
} from '../types/Maintenance';

export const useAssetSelection = <T extends SelectableItem>(
  items: T[],
  options: UseAssetSelectionOptions<T> = {}
): UseAssetSelectionReturn<T> => {
  const { keySelector = (item: T) => item.id } = options;
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedIds: new Set(),
    lastSelectedId: null
  });

  const { selectedIds, lastSelectedId } = selectionState;

  // Toggle single asset selection
  const toggleSelection = useCallback((id: string, shiftKey = false) => {
    setSelectionState(prev => {
      const newSelectedIds = new Set(prev.selectedIds);
      
      if (shiftKey && prev.lastSelectedId && prev.lastSelectedId !== id) {
        // Range selection with Shift+click
        const itemIds = items.map(item => keySelector(item));
        const lastIndex = itemIds.indexOf(prev.lastSelectedId);
        const currentIndex = itemIds.indexOf(id);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          // Add all items in range to selection
          for (let i = start; i <= end; i++) {
            newSelectedIds.add(itemIds[i]);
          }
        }
      } else {
        // Regular toggle
        if (newSelectedIds.has(id)) {
          newSelectedIds.delete(id);
        } else {
          newSelectedIds.add(id);
        }
      }
      
      return {
        selectedIds: newSelectedIds,
        lastSelectedId: id
      };
    });
  }, [items, keySelector]);

  // Select all items
  const selectAll = useCallback(() => {
    setSelectionState({
      selectedIds: new Set(items.map(item => keySelector(item))),
      lastSelectedId: null
    });
  }, [items, keySelector]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectionState({
      selectedIds: new Set(),
      lastSelectedId: null
    });
  }, []);

  // Check if item is selected
  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Get selected items
  const selectedAssets = useMemo(() => {
    return items.filter(item => selectedIds.has(keySelector(item)));
  }, [items, selectedIds, keySelector]);

  // Selection state helpers
  const selectedCount = selectedIds.size;
  const totalCount = items.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;
  const hasSelection = selectedCount > 0;

  return {
    selectedIds,
    selectedAssets,
    selectedCount,
    totalCount,
    isAllSelected,
    isIndeterminate,
    hasSelection,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection
  };
};