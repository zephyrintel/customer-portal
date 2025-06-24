import { useState, useCallback, useMemo } from 'react';
import { Asset } from '../types/Asset';

export interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
}

export const useAssetSelection = (assets: Asset[]) => {
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
        const assetIds = assets.map(asset => asset.id);
        const lastIndex = assetIds.indexOf(prev.lastSelectedId);
        const currentIndex = assetIds.indexOf(id);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          // Add all assets in range to selection
          for (let i = start; i <= end; i++) {
            newSelectedIds.add(assetIds[i]);
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
  }, [assets]);

  // Select all assets
  const selectAll = useCallback(() => {
    setSelectionState({
      selectedIds: new Set(assets.map(asset => asset.id)),
      lastSelectedId: null
    });
  }, [assets]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectionState({
      selectedIds: new Set(),
      lastSelectedId: null
    });
  }, []);

  // Check if asset is selected
  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Get selected assets
  const selectedAssets = useMemo(() => {
    return assets.filter(asset => selectedIds.has(asset.id));
  }, [assets, selectedIds]);

  // Selection state helpers
  const selectedCount = selectedIds.size;
  const totalCount = assets.length;
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