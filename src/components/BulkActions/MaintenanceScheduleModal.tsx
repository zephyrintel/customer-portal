import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Asset } from '../../types/Asset';
import { MaintenanceScheduleData } from '../../hooks/useBulkOperations';

interface MaintenanceScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
  onSchedule: (data: MaintenanceScheduleData) => void;
  isLoading: boolean;
}

const MaintenanceScheduleModal: React.FC<MaintenanceScheduleModalProps> = ({
  isOpen,
  onClose,
  selectedAssets,
  onSchedule,
  isLoading
}) => {
  const [scheduleData, setScheduleData] = useState<MaintenanceScheduleData>({
    date: '',
    type: 'routine',
    notes: ''
  });

  const [conflicts, setConflicts] = useState<Asset[]>([]);

  // Check for maintenance conflicts
  React.useEffect(() => {
    if (scheduleData.date) {
      const conflictingAssets = selectedAssets.filter(asset => {
        if (!asset.lastMaintenance) return false;
        
        const lastMaintenance = new Date(asset.lastMaintenance);
        const scheduledDate = new Date(scheduleData.date);
        const daysDiff = Math.abs((scheduledDate.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24));
        
        // Consider it a conflict if maintenance was done within 7 days
        return daysDiff < 7;
      });
      
      setConflicts(conflictingAssets);
    } else {
      setConflicts([]);
    }
  }, [scheduleData.date, selectedAssets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleData.date) {
      onSchedule(scheduleData);
    }
  };

  const handleClose = () => {
    setScheduleData({ date: '', type: 'routine', notes: '' });
    setConflicts([]);
    onClose();
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Schedule Maintenance
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Assets Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Selected Assets ({selectedAssets.length})
              </h4>
              <div className="max-h-32 overflow-y-auto">
                {selectedAssets.map(asset => (
                  <div key={asset.id} className="flex items-center justify-between py-1 text-sm">
                    <span className="text-gray-900">{asset.name}</span>
                    <span className="text-gray-500">{asset.serialNumber}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date Selection */}
              <div>
                <label htmlFor="maintenance-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance Date
                </label>
                <input
                  type="date"
                  id="maintenance-date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                  min={minDate}
                  required
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Maintenance Type */}
              <div>
                <label htmlFor="maintenance-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance Type
                </label>
                <select
                  id="maintenance-type"
                  value={scheduleData.type}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, type: e.target.value as MaintenanceScheduleData['type'] }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="routine">Routine Maintenance</option>
                  <option value="preventive">Preventive Maintenance</option>
                  <option value="emergency">Emergency Maintenance</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="maintenance-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="maintenance-notes"
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Add any specific instructions or notes..."
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Conflict Warning */}
              {conflicts.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Maintenance Conflict Detected</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        {conflicts.length} asset{conflicts.length > 1 ? 's have' : ' has'} recent maintenance within 7 days:
                      </p>
                      <ul className="mt-2 text-sm text-yellow-700">
                        {conflicts.map(asset => (
                          <li key={asset.id} className="flex justify-between">
                            <span>{asset.name}</span>
                            <span className="text-xs">
                              Last: {asset.lastMaintenance ? new Date(asset.lastMaintenance).toLocaleDateString() : 'N/A'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Indicator */}
              {conflicts.length === 0 && scheduleData.date && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">No scheduling conflicts detected</span>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!scheduleData.date || isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Scheduling...
                </>
              ) : (
                'Schedule Maintenance'
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
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScheduleModal;