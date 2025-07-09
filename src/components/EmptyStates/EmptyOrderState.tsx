import React from 'react';
import { ShoppingCart, Search, Plus, Package } from 'lucide-react';

interface EmptyOrderStateProps {
  type: 'no-orders' | 'no-results';
  searchTerm?: string;
  onClearSearch?: () => void;
  onAddOrder?: () => void;
}

const EmptyOrderState: React.FC<EmptyOrderStateProps> = ({
  type,
  searchTerm,
  onClearSearch,
  onAddOrder
}) => {
  if (type === 'no-results') {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No orders found
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {searchTerm 
            ? `No orders match your search for "${searchTerm}". Try adjusting your search terms or filters.`
            : 'No orders match your current filters.'
          }
        </p>
        
        <div className="space-y-3">
          <div className="text-sm text-gray-500 mb-4">
            <p className="font-medium mb-2">Search suggestions:</p>
            <ul className="space-y-1">
              <li>• Try searching by order number (e.g., "PO-2024-1234")</li>
              <li>• Search by vendor name (e.g., "IPEC Parts Supply")</li>
              <li>• Look for specific part numbers or descriptions</li>
            </ul>
          </div>
          
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingCart className="w-8 h-8 text-green-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        No orders yet
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Start tracking your parts procurement by adding your first order. You can record orders placed through any vendor or system.
      </p>
      
      <div className="space-y-4">
        {onAddOrder && (
          <button
            onClick={onAddOrder}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Order
          </button>
        )}
        
        <div className="text-sm text-gray-500">
          <p className="font-medium mb-2">You can track orders from:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'IPEC Parts Supply',
              'Local Vendors',
              'OEM Direct',
              'Emergency Purchases',
              'Maintenance Supplies'
            ].map((source) => (
              <span
                key={source}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                <Package className="w-3 h-3 mr-1" />
                {source}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyOrderState;