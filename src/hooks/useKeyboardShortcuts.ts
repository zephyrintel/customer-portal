import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onFocusSearch: () => void;
  onSelectAll: () => void;
  onClearSearch: () => void;
  onClearSelection: () => void;
  onOpenFirstAsset?: () => void;
  searchTerm: string;
  resultCount: number;
  hasSelection: boolean;
}

export const useKeyboardShortcuts = ({
  onFocusSearch,
  onSelectAll,
  onClearSearch,
  onClearSelection,
  onOpenFirstAsset,
  searchTerm,
  resultCount,
  hasSelection
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                          document.activeElement?.tagName === 'TEXTAREA';
    
    // Cmd/Ctrl + F: Focus search
    if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
      event.preventDefault();
      onFocusSearch();
      return;
    }
    
    // Cmd/Ctrl + A: Select all visible assets
    if ((event.metaKey || event.ctrlKey) && event.key === 'a' && !isInputFocused) {
      event.preventDefault();
      onSelectAll();
      return;
    }
    
    // Escape: Clear search or selection
    if (event.key === 'Escape') {
      if (hasSelection) {
        onClearSelection();
      } else if (searchTerm) {
        onClearSearch();
      }
      return;
    }
    
    // Enter: Open first asset if only one result and search is focused
    if (event.key === 'Enter' && isInputFocused && resultCount === 1 && onOpenFirstAsset) {
      event.preventDefault();
      onOpenFirstAsset();
      return;
    }
  }, [
    onFocusSearch,
    onSelectAll,
    onClearSearch,
    onClearSelection,
    onOpenFirstAsset,
    searchTerm,
    resultCount,
    hasSelection
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};