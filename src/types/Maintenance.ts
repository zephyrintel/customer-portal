import { Asset } from './Asset';

/**
 * Represents a maintenance item that needs attention
 */
export interface MaintenanceItem {
  id: string;
  name: string;
  status: string;
  lastMaint: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  equipmentType: string;
  location: string;
  asset: Asset;
  daysOverdue?: number;
  nextDueDate?: Date;
  maintenanceDetails: string;
}

/**
 * Filters for maintenance item queries
 */
export interface MaintenanceFilters {
  priorityFilter: 'all' | 'critical' | 'high' | 'medium' | 'low';
  searchTerm: string;
}

/**
 * Generic interface for items that can be selected
 */
export interface SelectableItem {
  id: string;
}

/**
 * Options for the useAssetSelection hook
 */
export interface UseAssetSelectionOptions<T> {
  keySelector?: (item: T) => string;
}

/**
 * Props for the useVirtualList hook
 */
export interface UseVirtualListProps<T = unknown> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  keySelector?: (item: T) => string;
}

/**
 * Virtual list item wrapper
 */
export interface VirtualListItem<T> {
  item: T;
  index: number;
  key: string;
}

/**
 * Return type for useVirtualList hook
 */
export interface UseVirtualListReturn<T> {
  visibleItems: VirtualListItem<T>[];
  allItems: T[];
  totalHeight: number;
  offsetY: number;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * Return type for useMaintenanceFiltering hook
 */
export interface UseMaintenanceFilteringReturn {
  maintenanceItems: MaintenanceItem[];
  allMaintenanceItems: MaintenanceItem[];
  filteredAndSortedItems: MaintenanceItem[];
}

/**
 * Selection state for useAssetSelection hook
 */
export interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
}

/**
 * Return type for useAssetSelection hook
 */
export interface UseAssetSelectionReturn<T> {
  selectedIds: Set<string>;
  selectedAssets: T[];
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  hasSelection: boolean;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string, shiftKey?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
}
