import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Package,
  Calendar,
  DollarSign,
  Filter,
  X
} from 'lucide-react';
import { getMockOrders } from '../data/mockData';
import { Order } from '../types/Asset';
import { useDeviceType } from '../hooks/useTouch';
import OrderDetailModal from '../components/Orders/OrderDetailModal';
import ManualOrderModal from '../components/Orders/ManualOrderModal';
import EmptyOrderState from '../components/EmptyStates/EmptyOrderState';
import NotificationToast from '../components/BulkActions/NotificationToast';

type OrderTab = 'all' | 'pending' | 'completed';
type OrderFilter = 'all' | 'parts' | 'maintenance' | 'emergency';

const PartsOrderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>(getMockOrders());
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deviceType = useDeviceType();

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab filter
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'pending' && ['pending', 'approved', 'shipped'].includes(order.status)) ||
        (activeTab === 'completed' && ['delivered', 'cancelled'].includes(order.status));

      // Type filter
      const matchesType = orderFilter === 'all' || order.type === orderFilter;

      // Search filter
      const matchesSearch = searchTerm === '' || 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesTab && matchesType && matchesSearch;
    });
  }, [orders, activeTab, orderFilter, searchTerm]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalSpent = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const pendingValue = orders
      .filter(order => ['pending', 'approved', 'shipped'].includes(order.status))
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return { totalSpent, pendingValue };
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

  const handleAddManualOrder = async (orderData: any) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newOrder: Order = {
        id: `MANUAL-${Date.now()}`,
        orderNumber: `MANUAL-${String(orders.filter(o => o.isManualEntry).length + 1).padStart(3, '0')}`,
        assetId: orderData.assetId || 'GENERAL',
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
      
    } catch (error) {
      console.error('Failed to add manual order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssociateAsset = async (orderId: string, assetId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the order with new asset association
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, assetId }
          : order
      ));
      
      const asset = assetId !== 'GENERAL' 
        ? getMockAssets().find(a => a.id === assetId)
        : null;
      
      const message = asset 
        ? `Order successfully associated with ${asset.name}`
        : 'Order association removed';
      
      setSuccessMessage(message);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
    } catch (error) {
      console.error('Failed to associate asset:', error);
      setErrorMessage('Failed to update asset association');
      
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const tabs = [
    { 
      id: 'all' as OrderTab, 
      label: 'All Orders', 
      count: orders.length 
    },
    { 
      id: 'pending' as OrderTab, 
      label: 'Pending', 
      count: orders.filter(o => ['pending', 'approved', 'shipped'].includes(o.status)).length 
    },
    { 
      id: 'completed' as OrderTab, 
      label: 'Completed', 
      count: orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length 
    }
  ];

  const typeFilters = [
    { id: 'all' as OrderFilter, label: 'All Types' },
    { id: 'parts' as OrderFilter, label: 'Parts' },
    { id: 'maintenance' as OrderFilter, label: 'Maintenance' },
    { id: 'emergency' as OrderFilter, label: 'Emergency' }
  ];

  // Mobile card view
  const renderMobileCard = (order: Order) => (
    <div
      key={order.id}
      onClick={() => setSelectedOrder(order)}
      className="p-4 bg-white border border-gray-200 rounded-lg mb-3 transition-all duration-150 ease-in-out active:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getTypeIcon(order.type)}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{order.orderNumber}</h3>
            <p className="text-xs text-gray-500">{order.vendor}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-1">{order.status}</span>
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
            {order.priority}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <div>
          <span className="font-medium text-gray-700">Date:</span>
          <p className="text-gray-900">{formatDate(order.orderDate)}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Total:</span>
          <p className="text-gray-900 font-semibold">{formatCurrency(order.totalAmount)}</p>
        </div>
      </div>
      
      <div className="text-xs text-gray-600">
        <span className="font-medium">Items:</span> {order.items.length} item{order.items.length > 1 ? 's' : ''}
        {order.isManualEntry && (
          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
            Manual Entry
          </span>
        )}
      </div>
    </div>
  );

  // Desktop table row
  const renderDesktopRow = (order: Order) => (
    <tr
      key={order.id}
      onClick={() => setSelectedOrder(order)}
      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          {getTypeIcon(order.type)}
          <div>
            <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
            <div className="text-xs text-gray-500">{formatDate(order.orderDate)}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{order.vendor}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="ml-1">{order.status}</span>
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
          {order.priority}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{order.items.length} item{order.items.length > 1 ? 's' : ''}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {order.isManualEntry && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Manual
          </span>
        )}
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-pt">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className={`font-bold text-gray-900 mb-2 flex items-center ${
                deviceType === 'mobile' ? 'text-xl' : 'text-3xl'
              }`}>
                <ShoppingCart className={`mr-3 text-green-600 ${
                  deviceType === 'mobile' ? 'w-6 h-6' : 'w-8 h-8'
                }`} />
                Parts Orders & Consumption
              </h1>
              <p className={`text-gray-600 ${
                deviceType === 'mobile' ? 'text-sm' : ''
              }`}>
                Track and manage all parts procurement activities
              </p>
            </div>
            
            {/* Summary Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(summaryStats.totalSpent)}
                </div>
                <div className="text-gray-500">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(summaryStats.pendingValue)}
                </div>
                <div className="text-gray-500">Pending Orders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders, parts, vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full ${
                      deviceType === 'mobile' ? 'py-3 min-h-[44px]' : 'py-2'
                    }`}
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Type Filter */}
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value as OrderFilter)}
                  className={`border border-gray-300 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    deviceType === 'mobile' ? 'py-3 min-h-[44px]' : 'py-2'
                  }`}
                >
                  {typeFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>{filter.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Add Manual Order Button */}
              <button
                onClick={() => setShowManualModal(true)}
                className={`inline-flex items-center px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  deviceType === 'mobile' ? 'py-3 min-h-[44px] w-full justify-center' : 'py-2'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Manual Entry
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Orders Content */}
          <div className="p-6">
            {filteredOrders.length > 0 ? (
              <>
                {/* Mobile View */}
                {deviceType === 'mobile' && (
                  <div className="space-y-3">
                    {filteredOrders.map(renderMobileCard)}
                  </div>
                )}

                {/* Desktop/Tablet View */}
                {deviceType !== 'mobile' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map(renderDesktopRow)}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <EmptyOrderState
                type={searchTerm || orderFilter !== 'all' ? 'no-results' : 'no-orders'}
                searchTerm={searchTerm}
                onClearSearch={clearSearch}
                onAddOrder={() => setShowManualModal(true)}
              />
            )}
          </div>
        </div>

        {/* Order Detail Modal */}
        <OrderDetailModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAssociateAsset={handleAssociateAsset}
        />

        {/* Manual Order Modal */}
        <ManualOrderModal
          isOpen={showManualModal}
          onClose={() => setShowManualModal(false)}
          onSave={handleAddManualOrder}
          isLoading={isLoading}
          assetId="GENERAL"
        />

        {/* Success Toast */}
        <NotificationToast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
        
        {/* Error Toast */}
        <NotificationToast
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage(null)}
        />
      </div>
    </div>
  );
};

export default PartsOrderPage;