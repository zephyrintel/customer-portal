import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Package, Calendar, Truck, CheckCircle, Clock, AlertCircle, Plus} from 'lucide-react';
import { getMockOrders } from '../../data/mockData';
import { Order } from '../../types/Asset';
import ManualOrderModal from './ManualOrderModal';

interface OrdersSectionProps {
  assetId: string;
}

const OrdersSection: React.FC<OrdersSectionProps> = ({ assetId }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [showManualModal, setShowManualModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState<number>(0);

  // Filter orders for this specific asset
  useEffect(() => {
    const assetOrders = getMockOrders().filter(order => order.assetId === assetId);
    setOrders(assetOrders);
  }, [assetId]);

  // Calculate minimum height to prevent jolting
  useEffect(() => {
    if (contentRef.current) {
      const allOrdersHeight = contentRef.current.scrollHeight;
      setMinHeight(Math.max(allOrdersHeight, 400)); // Minimum 400px
    }
  }, [orders]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Order['type']) => {
    switch (type) {
      case 'parts':
        return <Package className="w-4 h-4" />;
      case 'maintenance':
        return <Calendar className="w-4 h-4" />;
      case 'emergency':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <ShoppingCart className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'pending':
        return ['pending', 'approved', 'shipped'].includes(order.status);
      case 'completed':
        return ['delivered', 'cancelled'].includes(order.status);
      default:
        return true;
    }
  });

  const totalSpent = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const pendingValue = orders
    .filter(order => ['pending', 'approved', 'shipped'].includes(order.status))
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const handleAddManualOrder = async (orderData: any) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newOrder: Order = {
        id: `MANUAL-${Date.now()}`,
        orderNumber: `MANUAL-${String(orders.filter(o => o.isManualEntry).length + 1).padStart(3, '0')}`,
        assetId: assetId,
        type: orderData.type,
        status: orderData.status,
        orderDate: orderData.orderDate,
        deliveredDate: orderData.status === 'delivered' ? orderData.deliveredDate : undefined,
        totalAmount: orderData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
        items: orderData.items,
        vendor: orderData.vendor,
        priority: orderData.priority,
        isManualEntry: true,
        hasApiIntegration: false
      };
      
      setOrders(prev => [newOrder, ...prev]);
      setShowManualModal(false);
      
      console.log('Manual order added:', newOrder);
      
    } catch (error) {
      console.error('Failed to add manual order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
            Parts Orders & Consumption
          </h2>
          
          <div className="flex items-center space-x-4">
            {/* Summary Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{formatCurrency(totalSpent)}</div>
                <div className="text-gray-500">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">{formatCurrency(pendingValue)}</div>
                <div className="text-gray-500">Pending Orders</div>
              </div>
            </div>
            
            {/* Add Manual Order Button */}
            <button
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Entry
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-4">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              { id: 'pending', label: 'Pending', count: orders.filter(o => ['pending', 'approved', 'shipped'].includes(o.status)).length },
              { id: 'completed', label: 'Completed', count: orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                  activeTab === tab.id ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content with fixed minimum height to prevent jolting */}
      <div 
        ref={contentRef}
        className="p-6 transition-all duration-300 ease-in-out"
        style={{ minHeight: `${minHeight}px` }}
      >
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(order.type)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          {order.isManualEntry && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Manual Entry
                            </span>
                          )}
                          {order.hasApiIntegration && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              ERP Sync
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Ordered {formatDate(order.orderDate)} • {order.vendor}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                      {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-3">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs text-gray-600">{item.partNumber}</span>
                            {item.isWearItem && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Wear Item
                              </span>
                            )}
                          </div>
                          <p className="text-gray-900 mt-1">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                          <p className="text-xs text-gray-500">
                            = {formatCurrency(item.quantity * item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {order.expectedDelivery && order.status !== 'delivered' && (
                      <span className="flex items-center space-x-1">
                        <Truck className="w-3 h-3" />
                        <span>Expected: {formatDate(order.expectedDelivery)}</span>
                      </span>
                    )}
                    {order.deliveredDate && (
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Delivered: {formatDate(order.deliveredDate)}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'pending' ? 'No Pending Orders' : 
               activeTab === 'completed' ? 'No Completed Orders' : 'No Orders Found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'pending' 
                ? 'All orders for this asset have been completed.'
                : activeTab === 'completed'
                ? 'No orders have been completed for this asset yet.'
                : 'No parts orders have been placed for this asset.'
              }
            </p>
            
            {activeTab === 'all' && (
              <button
                onClick={() => setShowManualModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Order
              </button>
            )}
          </div>
        )}
      </div>

      {/* Manual Order Modal */}
      <ManualOrderModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSave={handleAddManualOrder}
        isLoading={isLoading}
        assetId={assetId}
      />
    </div>
  );
};

export default OrdersSection;