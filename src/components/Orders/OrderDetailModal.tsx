import React from 'react';
import { 
  X, 
  Package, 
  Calendar, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  User,
  MapPin,
  Link,
  Edit3
} from 'lucide-react';
import { Order } from '../../types/Asset';
import { getMockAssets } from '../../data/mockData';
import AssetAssociationModal from './AssetAssociationModal';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onAssociateAsset?: (orderId: string, assetId: string) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onAssociateAsset
}) => {
  const [showAssetAssociation, setShowAssetAssociation] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  if (!isOpen || !order) return null;

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get associated asset information
  const associatedAsset = order.assetId !== 'GENERAL' 
    ? getMockAssets().find(asset => asset.id === order.assetId)
    : null;

  const handleAssociateAsset = async (assetId: string) => {
    if (!onAssociateAsset) return;
    
    setIsUpdating(true);
    try {
      await onAssociateAsset(order.id, assetId);
      setShowAssetAssociation(false);
    } catch (error) {
      console.error('Failed to associate asset:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <>
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-500">Order Details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Order Date:</span>
                    <p className="text-sm text-gray-900">{formatDate(order.orderDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Vendor:</span>
                    <p className="text-sm text-gray-900">{order.vendor}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Priority:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                    {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                  </span>
                </div>
              </div>

              {/* Delivery Information */}
              {(order.expectedDelivery || order.deliveredDate) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.expectedDelivery && order.status !== 'delivered' && (
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Expected Delivery:</span>
                          <p className="text-sm text-gray-900">{formatDate(order.expectedDelivery)}</p>
                        </div>
                      </div>
                    )}
                    
                    {order.deliveredDate && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Delivered:</span>
                          <p className="text-sm text-gray-900">{formatDate(order.deliveredDate)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Associated Asset */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Associated Equipment:</span>
                  </div>
                  {onAssociateAsset && (
                    <button
                      onClick={() => setShowAssetAssociation(true)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      disabled={isUpdating}
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      {associatedAsset ? 'Change' : 'Associate'}
                    </button>
                  )}
                </div>
                {associatedAsset ? (
                <div className="mt-2">
                  <p className="text-sm text-gray-900 mt-1">{associatedAsset.name}</p>
                  <p className="text-xs text-gray-500">
                    {associatedAsset.location.facility} - {associatedAsset.location.area}
                  </p>
                </div>
                ) : (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        This order is not associated with specific equipment
                      </p>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Link it to equipment for better tracking and maintenance history
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-mono text-gray-600">{item.partNumber}</span>
                        {item.isWearItem && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Wear Item
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">{item.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-gray-900">
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

            {/* Order Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span className="text-lg font-medium text-gray-900">Order Total:</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              
              {/* Source Indicator */}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Order Source:</span>
                <div className="flex items-center space-x-2">
                  {order.isManualEntry && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Manual Entry
                    </span>
                  )}
                  {order.hasApiIntegration && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      ERP Integration
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Asset Association Modal */}
      {showAssetAssociation && (
        <AssetAssociationModal
          isOpen={showAssetAssociation}
          onClose={() => setShowAssetAssociation(false)}
          onAssociate={handleAssociateAsset}
          currentAssetId={order.assetId !== 'GENERAL' ? order.assetId : undefined}
          orderNumber={order.orderNumber}
          isLoading={isUpdating}
        />
      )}
    </>
  );
};

export default OrderDetailModal;