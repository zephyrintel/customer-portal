import React, { useState, useMemo } from 'react';
import { X, Calendar, User, Wrench, AlertCircle, Save, Package } from 'lucide-react';
import { Asset } from '../../types/Asset';

interface MaintenanceSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onSchedule: () => void;
}

const MaintenanceSchedulingModal: React.FC<MaintenanceSchedulingModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSchedule
}) => {
  const [formData, setFormData] = useState({
    maintenanceType: 'preventive',
    dueDate: '',
    assignTo: '',
    priority: 'medium',
    description: '',
    estimatedDuration: '2',
    requiredParts: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const maintenanceTypes = [
    { value: 'preventive', label: 'Preventive Maintenance' },
    { value: 'corrective', label: 'Corrective Maintenance' },
    { value: 'emergency', label: 'Emergency Repair' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'calibration', label: 'Calibration' }
  ];

  const technicians = [
    { value: 'john-smith', label: 'John Smith - Senior Technician' },
    { value: 'sarah-johnson', label: 'Sarah Johnson - Maintenance Lead' },
    { value: 'mike-wilson', label: 'Mike Wilson - Specialist' },
    { value: 'team-alpha', label: 'Team Alpha - General Maintenance' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  // Generate available parts from asset's wear components and BOM
  const availableParts = useMemo(() => {
    const parts = new Map<string, { partNumber: string; description: string; isWearItem: boolean }>();
    
    // Add wear components
    asset.wearComponents.forEach(component => {
      parts.set(component.partNumber, {
        partNumber: component.partNumber,
        description: component.description,
        isWearItem: true
      });
    });
    
    // Add BOM items
    asset.billOfMaterials.forEach(item => {
      if (!parts.has(item.partNumber)) {
        parts.set(item.partNumber, {
          partNumber: item.partNumber,
          description: item.description,
          isWearItem: item.isWearItem
        });
      }
    });
    
    return Array.from(parts.values()).sort((a, b) => {
      // Sort wear items first, then alphabetically
      if (a.isWearItem && !b.isWearItem) return -1;
      if (!a.isWearItem && b.isWearItem) return 1;
      return a.description.localeCompare(b.description);
    });
  }, [asset]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.dueDate) {
      newErrors.push('Due date is required');
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.push('Due date cannot be in the past');
      }
    }

    if (!formData.assignTo) {
      newErrors.push('Please assign a technician');
    }

    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Scheduling maintenance:', {
        assetId: asset.id,
        ...formData
      });

      onSchedule();
      
      // Reset form
      setFormData({
        maintenanceType: 'preventive',
        dueDate: '',
        assignTo: '',
        priority: 'medium',
        description: '',
        estimatedDuration: '2',
        requiredParts: []
      });
      setErrors([]);
      
    } catch (error) {
      console.error('Failed to schedule maintenance:', error);
      setErrors(['Failed to schedule maintenance. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handlePartToggle = (partNumber: string) => {
    setFormData(prev => ({
      ...prev,
      requiredParts: prev.requiredParts.includes(partNumber)
        ? prev.requiredParts.filter(p => p !== partNumber)
        : [...prev.requiredParts, partNumber]
    }));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-blue-600" />
                Schedule Maintenance for {asset.name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Asset Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Equipment:</span>
                  <span className="ml-2 text-gray-900">{asset.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Serial:</span>
                  <span className="ml-2 text-gray-900 font-mono">{asset.serialNumber}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="ml-2 text-gray-900">{asset.location.facility} - {asset.location.area}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-gray-900">{asset.currentStatus}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
              {/* Maintenance Type and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="maintenanceType" className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Type *
                  </label>
                  <select
                    id="maintenanceType"
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceType: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    {maintenanceTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date and Assign To */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    min={getMinDate()}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="assignTo" className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To *
                  </label>
                  <select
                    id="assignTo"
                    value={formData.assignTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignTo: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="">Select technician...</option>
                    {technicians.map(tech => (
                      <option key={tech.value} value={tech.value}>{tech.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estimated Duration */}
              <div>
                <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Duration (hours)
                </label>
                <input
                  type="number"
                  id="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  min="0.5"
                  step="0.5"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the maintenance work to be performed..."
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
              </div>

              {/* Required Parts */}
              {availableParts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Package className="w-4 h-4 inline mr-1" />
                    Required Parts (Optional)
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                    <div className="space-y-2">
                      {availableParts.map((part) => (
                        <label key={part.partNumber} className="flex items-start space-x-3 cursor-pointer hover:bg-white p-2 rounded transition-colors duration-150">
                          <input
                            type="checkbox"
                            checked={formData.requiredParts.includes(part.partNumber)}
                            onChange={() => handlePartToggle(part.partNumber)}
                            className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={isLoading}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-mono text-gray-600">{part.partNumber}</span>
                              {part.isWearItem && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Wear Item
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-900 mt-1">{part.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.requiredParts.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {formData.requiredParts.length} part{formData.requiredParts.length > 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              )}

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
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Schedule Maintenance
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
              Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to cancel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSchedulingModal;