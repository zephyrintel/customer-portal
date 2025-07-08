/**
 * Centralized date formatting utilities
 */

/**
 * Formats a date string for display in the UI
 */
export function formatDate(dateString: string | null, options?: {
  includeTime?: boolean;
  format?: 'short' | 'long' | 'numeric';
}): string {
  if (!dateString) return 'Not set';
  
  const { includeTime = false, format = 'long' } = options || {};
  
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  if (format === 'numeric') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  if (includeTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
  }
  
  return date.toLocaleDateString('en-US', dateOptions);
}

/**
 * Calculates days between two dates
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Checks if a date is in the past
 */
export function isDateInPast(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date < today;
}

/**
 * Gets relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (Math.abs(diffInHours) < 1) {
    return diffInMs > 0 ? 'In less than an hour' : 'Just now';
  }
  
  if (Math.abs(diffInHours) < 24) {
    return diffInHours > 0 
      ? `In ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`
      : `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) > 1 ? 's' : ''} ago`;
  }
  
  return diffInDays > 0
    ? `In ${diffInDays} day${diffInDays > 1 ? 's' : ''}`
    : `${Math.abs(diffInDays)} day${Math.abs(diffInDays) > 1 ? 's' : ''} ago`;
}