import React, { useState, useEffect } from 'react';
import { X, Save, Package, AlertCircle } from 'lucide-react';
import { Asset, EquipmentStatus } from '../../types/Asset';

interface AssetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onSave: (updatedAsset: Asset) => void;
  isLoading?: boolean;
}

const AssetEditModal: React.FC<AssetEditModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    currentStatus: 'In Operation' as EquipmentStatus,
    operatingConditions: {
      flowRate: '',
      pressure: '',
      temperature: '',
      fluidType: 'Water' as const
    }
  });
  const [errors, setErrors] = useState<string[]>([]);

  const statusOptions: EquipmentStatus[] = [
    'In Operation',
    'Intermittent Operation',
    'Not Commissioned',
    'Not In Use',
    'Unknown'
  ];

  const fluidTypes = [
    'Water',
    'Oil',
    'Chemical',
    'Steam',
    'Air',
    'Gas',
    'Other'
  ] as const;

  // Initialize form when asset changes
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        id: asset.id,
        currentStatus: asset.currentStatus,
        operatingConditions: { ...asset.operatingConditions }
      });
    }
  }, [asset]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setErrors([]);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Asset name is required');
    }

    if (!formData.id.trim()) {
      newErrors.push('Asset ID/Tag ID is required');
    }

    // Validate operating conditions format
    if (formData.operatingConditions.flowRate && !formData.operatingConditions.flowRate.match(/^\d+(\.\d+)?\s*(GPM|LPM|CFM|L\/min|gal\/min)$/i)) {
      newErrors.push('Flow rate must include units (e.g., "500 GPM", "1200 LPM")');
    }

    if (formData.operatingConditions.pressure && !formData.operatingConditions.pressure.match(/^\d+(\.\d+)?\s*(PSI|bar|kPa|MPa)$/i)) {
      newErrors.push('Pressure must include units (e.g., "150 PSI", "10 bar")');
    }

    if (formData.operatingConditions.temperature && !formData.operatingConditions.temperature.match(/^\d+(\.\d+)?\s*°?(F|C|K)$/i)) {
      newErrors.push('Temperature must include units (e.g., "140°F", "60°C")');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (!asset || !validateForm()) return;

    const updatedAsset: Asset = {
      ...asset,
      name: formData.name.trim(),
      id: formData.id.trim(),
      currentStatus: formData.currentStatus,
      operatingConditions: {
        ...formData.operatingConditions
      }
    };

    onSave(updatedAsset);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'In Operation':
        return 'bg-green-100 text-green-800';
      case 'Intermittent Operation':
        return 'bg-blue-100 text-blue-800';
      case 'Not Commissioned':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not In Use':
        return 'bg-red-100 text-red-800';
      case 'Unknown':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Edit Asset Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onKeyDown={handleKeyDown} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assetName" className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    id="assetName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter asset name"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">
                    Asset ID / Tag ID *
                  </label>
                  <input
                    type="text"
                    id="assetId"
                    value={formData.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="Enter asset ID or tag"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                <select
                  id="status"
                  value={formData.currentStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStatus: e.target.value as EquipmentStatus }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(formData.currentStatus)}`}>
                    {formData.currentStatus}
                  </span>
                </div>
              </div>

              {/* Operating Conditions */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <span>Current Operating Conditions</span>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Current
                  </span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="flowRate" className="block text-sm font-medium text-gray-700 mb-1">
                      Flow Rate
                    </label>
                    <input
                      type="text"
                      id="flowRate"
                      value={formData.operatingConditions.flowRate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        operatingConditions: { ...prev.operatingConditions, flowRate: e.target.value }
                      }))}
                      placeholder="e.g., 500 GPM"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="pressure" className="block text-sm font-medium text-gray-700 mb-1">
                      Pressure
                    </label>
                    <input
                      type="text"
                      id="pressure"
                      value={formData.operatingConditions.pressure}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        operatingConditions: { ...prev.operatingConditions, pressure: e.target.value }
                      }))}
                      placeholder="e.g., 150 PSI"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature
                    </label>
                    <input
                      type="text"
                      id="temperature"
                      value={formData.operatingConditions.temperature}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        operatingConditions: { ...prev.operatingConditions, temperature: e.target.value }
                      }))}
                      placeholder="e.g., 140°F"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="fluidType" className="block text-sm font-medium text-gray-700 mb-1">
                      Fluid Type
                    </label>
                    <select
                      id="fluidType"
                      value={formData.operatingConditions.fluidType}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        operatingConditions: { ...prev.operatingConditions, fluidType: e.target.value as any }
                      }))}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    >
                      {fluidTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
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

              {/* Help Text */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Formatting Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Flow Rate: Include units like GPM, LPM, CFM (e.g., "500 GPM")</li>
                  <li>• Pressure: Include units like PSI, bar, kPa (e.g., "150 PSI")</li>
                  <li>• Temperature: Include units like °F, °C, K (e.g., "140°F")</li>
                </ul>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || !formData.name.trim() || !formData.id.trim()}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
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

export default AssetEditModal;