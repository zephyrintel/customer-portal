/**
 * Utility functions for stock management and NetSuite integration
 */

import { WearComponent } from '../types/Asset';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'unknown';

export interface StockDisplayInfo {
  status: StockStatus;
  displayText: string;
  colorClass: string;
  iconClass: string;
  showQuantity: boolean;
}

/**
 * Determines stock status based on quantity and reorder point
 */
export function getStockStatus(component: WearComponent): StockStatus {
  if (!component.stockInfo) return 'unknown';
  
  const { quantityAvailable, reorderPoint } = component.stockInfo;
  
  if (quantityAvailable === 0) return 'out-of-stock';
  if (quantityAvailable <= reorderPoint) return 'low-stock';
  return 'in-stock';
}

/**
 * Gets display information for stock status
 */
export function getStockDisplayInfo(component: WearComponent): StockDisplayInfo {
  const status = getStockStatus(component);
  
  switch (status) {
    case 'in-stock':
      return {
        status,
        displayText: `${component.stockInfo?.quantityAvailable || 0} in stock`,
        colorClass: 'bg-green-100 text-green-800',
        iconClass: 'text-green-600',
        showQuantity: true
      };
    case 'low-stock':
      return {
        status,
        displayText: `${component.stockInfo?.quantityAvailable || 0} remaining`,
        colorClass: 'bg-yellow-100 text-yellow-800',
        iconClass: 'text-yellow-600',
        showQuantity: true
      };
    case 'out-of-stock':
      return {
        status,
        displayText: 'Out of stock',
        colorClass: 'bg-red-100 text-red-800',
        iconClass: 'text-red-600',
        showQuantity: false
      };
    case 'unknown':
    default:
      return {
        status,
        displayText: 'Stock unknown',
        colorClass: 'bg-gray-100 text-gray-800',
        iconClass: 'text-gray-600',
        showQuantity: false
      };
  }
}

/**
 * Formats the last updated timestamp for display
 */
export function formatLastUpdated(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Updated just now';
  if (diffInHours < 24) return `Updated ${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Updated yesterday';
  if (diffInDays < 7) return `Updated ${diffInDays} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Simulates NetSuite API call to refresh stock data
 * In production, this would make an actual API call
 */
export async function refreshStockData(partNumbers: string[]): Promise<Record<string, WearComponent['stockInfo']>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response - in production this would come from NetSuite
  const mockStockData: Record<string, WearComponent['stockInfo']> = {};
  
  partNumbers.forEach(partNumber => {
    mockStockData[partNumber] = {
      quantityOnHand: Math.floor(Math.random() * 20),
      quantityAvailable: Math.floor(Math.random() * 15),
      reorderPoint: Math.floor(Math.random() * 5) + 2,
      lastUpdated: new Date().toISOString(),
      source: 'netsuite'
    };
  });
  
  return mockStockData;
}

/**
 * Checks if stock data is stale and needs refreshing
 */
export function isStockDataStale(lastUpdated: string, maxAgeHours: number = 4): boolean {
  const lastUpdateTime = new Date(lastUpdated).getTime();
  const now = new Date().getTime();
  const ageInHours = (now - lastUpdateTime) / (1000 * 60 * 60);
  
  return ageInHours > maxAgeHours;
}