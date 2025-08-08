import { Asset } from '../types/Asset';

// Base classes for all badges
const BASE_BADGE_CLASSES = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
const SMALL_BADGE_CLASSES = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";

// Status badge generator with consistent colors
export const getStatusBadge = (status: Asset['currentStatus']) => {
  switch (status) {
    case 'In Operation':
      return `${BASE_BADGE_CLASSES} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100`;
    case 'Intermittent Operation':
      return `${BASE_BADGE_CLASSES} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100`;
    case 'Not Commissioned':
      return `${BASE_BADGE_CLASSES} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100`;
    case 'Not In Use':
      return `${BASE_BADGE_CLASSES} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100`;
    case 'Unknown':
      return `${BASE_BADGE_CLASSES} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100`;
    default:
      return `${BASE_BADGE_CLASSES} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100`;
  }
};

// Priority badge color map with consistent colors
export const PRIORITY_COLOR_MAP = {
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    darkBg: 'dark:bg-red-900',
    darkText: 'dark:text-red-100',
    icon: 'text-red-600 dark:text-red-400'
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    darkBg: 'dark:bg-orange-900',
    darkText: 'dark:text-orange-100',
    icon: 'text-orange-600 dark:text-orange-400'
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    darkBg: 'dark:bg-yellow-900',
    darkText: 'dark:text-yellow-100',
    icon: 'text-yellow-600 dark:text-yellow-400'
  },
  low: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    darkBg: 'dark:bg-green-900',
    darkText: 'dark:text-green-100',
    icon: 'text-green-600 dark:text-green-400'
  }
} as const;

// Priority badge generator with consistent styling
export const getPriorityBadge = (priority: 'critical' | 'high' | 'medium' | 'low', size: 'small' | 'default' = 'default') => {
  const colors = PRIORITY_COLOR_MAP[priority];
  const baseClasses = size === 'small' ? SMALL_BADGE_CLASSES : BASE_BADGE_CLASSES;
  
  return `${baseClasses} ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`;
};

// Criticality badge generator (uses same logic as priority)
export const getCriticalityBadge = (criticality: Asset['criticalityLevel']) => {
  const normalizedCriticality = criticality.toLowerCase() as keyof typeof PRIORITY_COLOR_MAP;
  return getPriorityBadge(normalizedCriticality, 'small');
};

// Maintenance status badge
export const getMaintenanceBadge = (isOverdue: boolean) => {
  if (isOverdue) {
    return `${SMALL_BADGE_CLASSES} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100`;
  }
  return `${SMALL_BADGE_CLASSES} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100`;
};

// Maintenance status pill for multi-state (overdue, due-soon, good, unknown)
export const getMaintenanceStatusBadge = (status: 'overdue' | 'due-soon' | 'good' | 'unknown') => {
  switch (status) {
    case 'overdue':
      return `${SMALL_BADGE_CLASSES} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100`;
    case 'due-soon':
      return `${SMALL_BADGE_CLASSES} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100`;
    case 'good':
      return `${SMALL_BADGE_CLASSES} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100`;
    default:
      return `${SMALL_BADGE_CLASSES} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100`;
  }
};

// Row selection and hover state classes - optimized for snappy interactions
export const getRowStateClasses = (isSelected: boolean, showSelection: boolean) => {
  const baseClasses = "cursor-pointer";
  
  if (isSelected) {
    return `${baseClasses} bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700`;
  }
  
  if (showSelection) {
    return `${baseClasses} hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/20 dark:active:bg-blue-800/30`;
  }
  
  return `${baseClasses} hover:bg-blue-50 dark:hover:bg-blue-900/20`;
};

// Card state classes for mobile/tablet views
export const getCardStateClasses = (isSelected: boolean, showSelection: boolean) => {
  const baseClasses = "transition-all duration-150 ease-in-out";
  
  if (isSelected) {
    return `${baseClasses} ring-2 ring-blue-500 border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 dark:ring-blue-400`;
  }
  
  if (showSelection) {
    return `${baseClasses} hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/20 dark:active:bg-blue-800/30`;
  }
  
  return `${baseClasses} hover:bg-blue-50 hover:shadow-md dark:hover:bg-blue-900/20 dark:hover:shadow-gray-900/20`;
};

// Export badge classes for custom implementations
export const BADGE_CLASSES = {
  base: BASE_BADGE_CLASSES,
  small: SMALL_BADGE_CLASSES,
  priority: PRIORITY_COLOR_MAP
};
