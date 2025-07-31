import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Package, AlertCircle } from 'lucide-react';

interface OrderItem {
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  isWearItem: boolean;
}

interface ManualOrderData {
  type: 'parts' | 'maintenance' | 'emergency';
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveredDate?: string;
  vendor: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  items: OrderItem[];
}

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: ManualOrderData) => void;
  isLoading?: boolean;
  assetId: string;
}

const ManualOrderModal: React.FC<ManualOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  assetId
}) => {
  const [formData, setFormData] = useState<ManualOrderData>({
    type: 'parts',
    status: 'delivered',
    orderDate: new Date().toISOString().split('T')[0],
    deliveredDate: new Date().toISOString().split('T')[0],
    vendor: '',
    priority: 'medium',
    items: [
      {
        partNumber: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        isWearItem: false
      }
    ]
  });
  const [errors, setErrors] = useState<string[]>([]);

  const orderTypes = [
    { value: 'parts', label: 'Parts Order' },
    { value: 'maintenance', label: 'Maintenance Order' },
    { value: 'emergency', label: 'Emergency Order' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.vendor.trim()) {
      newErrors.push('Vendor name is required');
    }

    if (!formData.orderDate) {
      newErrors.push('Order date is required');
    }

    if (formData.status === 'delivered' && !formData.deliveredDate) {
      newErrors.push('Delivery date is required for delivered orders');
    }

    if (formData.items.length === 0) {
      newErrors.push('At least one item is required');
    }

    formData.items.forEach((item, index) => {
      if (!item.partNumber.trim()) {
        newErrors.push(`Part number is required for item ${index + 1}`);
      }
      if (!item.description.trim()) {
        newErrors.push(`Description is required for item ${index + 1}`);
      }
      if (item.quantity <= 0) {
        newErrors.push(`Quantity must be greater than 0 for item ${index + 1}`);
      }
      if (item.unitPrice < 0) {
        newErrors.push(`Unit price cannot be negative for item ${index + 1}`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const orderData: ManualOrderData = {
      ...formData,
      vendor: formData.vendor.trim(),
      items: formData.items.map(item => ({
        ...item,
        partNumber: item.partNumber.trim(),
        description: item.description.trim()
      }))
    };

    onSave(orderData);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          partNumber: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          isWearItem: false
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'parts',
      status: 'delivered',
      orderDate: new Date().toISOString().split('T')[0],
      deliveredDate: new Date().toISOString().split('T')[0],
      vendor: '',
      priority: 'medium',
      items: [
        {
          partNumber: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          isWearItem: false
        }
      ]
    });
    setErrors([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                Add Manual Order Entry
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Manual Entry</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Use this form to record purchases made outside of IPEC's system. This helps maintain a complete record of all parts and maintenance for this asset.
                  </p>
                </div>
              </div>
            </div>

            <form onKeyDown={handleKeyDown} className="space-y-6">
              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 mb-1">
                    Order Type *
                  </label>
                  <select
                    id="orderType"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    {orderTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vendor and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor/Supplier *
                  </label>
                  <input
                    type="text"
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="Enter vendor name"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date *
                  </label>
                  <input
                    type="date"
                    id="orderDate"
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                    disabled={isLoading}
                  />
                </div>

                {formData.status === 'delivered' && (
                  <div>
                    <label htmlFor="deliveredDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      id="deliveredDate"
                      value={formData.deliveredDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveredDate: e.target.value }))}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Order Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-900">Item {index + 1}</h5>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Part Number *
                          </label>
                          <input
                            type="text"
                            value={item.partNumber}
                            onChange={(e) => updateItem(index, 'partNumber', e.target.value)}
                            placeholder="Enter part number"
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description *
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Enter item description"
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.isWearItem}
                            onChange={(e) => updateItem(index, 'isWearItem', e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            disabled={isLoading}
                          />
                          <span className="ml-2 text-sm text-gray-700">Wear Item</span>
                        </label>
                        
                        <div className="text-sm font-medium text-gray-900">
                          Total: {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Order Total:</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</h4>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || formData.items.length === 0}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding Order...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Order
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">⌘ + Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to cancel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualOrderModal;