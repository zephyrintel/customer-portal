import React, { useState } from 'react';
import { X, Calendar, User, Clock, AlertCircle, CheckCircle, Settings, MapPin, Edit3, Trash2, Save } from 'lucide-react';
import { Asset } from '../../types/Asset';

interface MaintenanceEvent {
  id: string;
  assetId: string;
  assetName: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'calibration';
  date: Date;
  title: string;
  description?: string;
  technician?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  estimatedDuration: number;
}

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MaintenanceEvent | null;
  asset?: Asset;
  onEdit?: (event: MaintenanceEvent) => void;
  onComplete?: (event: MaintenanceEvent) => void;
  onReschedule?: (event: MaintenanceEvent, newDate: Date) => void;
  onCancel?: (event: MaintenanceEvent) => void;
  onUpdate?: (event: MaintenanceEvent) => void;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  event,
  asset,
  onEdit,
  onComplete,
  onReschedule,
  onCancel,
  onUpdate
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [editForm, setEditForm] = useState({
    date: '',
    title: '',
    description: '',
    priority: event?.priority || 'medium',
    estimatedDuration: event?.estimatedDuration || 2
  });

  // Initialize edit form when event changes
  React.useEffect(() => {
    if (event) {
      setEditForm({
        date: event.date.toISOString().split('T')[0],
        title: event.title,
        description: event.description || '',
        priority: event.priority,
        estimatedDuration: event.estimatedDuration
      });
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const maintenanceTypes = {
    preventive: { 
      label: 'Preventive Maintenance', 
      color: 'bg-blue-500', 
      lightColor: 'bg-blue-100', 
      textColor: 'text-blue-800'
    },
    corrective: { 
      label: 'Corrective Maintenance', 
      color: 'bg-orange-500', 
      lightColor: 'bg-orange-100', 
      textColor: 'text-orange-800'
    },
    emergency: { 
      label: 'Emergency Repair', 
      color: 'bg-red-500', 
      lightColor: 'bg-red-100', 
      textColor: 'text-red-800'
    },
    inspection: { 
      label: 'Inspection', 
      color: 'bg-purple-500', 
      lightColor: 'bg-purple-100', 
      textColor: 'text-purple-800'
    },
    calibration: { 
      label: 'Calibration', 
      color: 'bg-green-500', 
      lightColor: 'bg-green-100', 
      textColor: 'text-green-800'
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  };

  const typeConfig = maintenanceTypes[event.type];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleComplete = async () => {
    if (!onComplete) return;
    
    setIsCompleting(true);
    try {
      await onComplete(event);
      onClose();
    } catch (error) {
      console.error('Failed to complete maintenance:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const canComplete = event.status === 'scheduled' || event.status === 'in-progress';
  const isOverdue = event.status === 'overdue';
  const canEdit = event.status !== 'completed';
  const canCancel = event.status === 'scheduled';

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!onUpdate) return;
    
    const updatedEvent: MaintenanceEvent = {
      ...event,
      date: new Date(editForm.date + 'T' + event.date.toTimeString().split(' ')[0]),
      title: editForm.title,
      description: editForm.description,
      priority: editForm.priority as MaintenanceEvent['priority'],
      estimatedDuration: editForm.estimatedDuration
    };
    
    await onUpdate(updatedEvent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    setEditForm({
      date: event.date.toISOString().split('T')[0],
      title: event.title,
      description: event.description || '',
      priority: event.priority,
      estimatedDuration: event.estimatedDuration
    });
  };

  const handleCancelMaintenance = async () => {
    if (!onCancel) return;
    
    if (window.confirm('Are you sure you want to cancel this maintenance? This action cannot be undone.')) {
      setIsCancelling(true);
      try {
        await onCancel(event);
        onClose();
      } catch (error) {
        console.error('Failed to cancel maintenance:', error);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${typeConfig.lightColor}`}>
                  <Settings className={`w-5 h-5 ${typeConfig.textColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-lg font-medium"
                      />
                    ) : (
                      event.title
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">{typeConfig.label}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status and Priority Badges */}
            <div className="flex items-center space-x-2 mb-6">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                {event.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                {event.status === 'overdue' && <AlertCircle className="w-3 h-3 mr-1" />}
                {event.status.charAt(0).toUpperCase() + event.status.slice(1).replace('-', ' ')}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[event.priority]}`}>
                {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
              </span>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              {/* Date and Time */}
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{formatDate(event.date)}</p>
                  )}
                  <p className="text-sm text-gray-500">{formatTime(event.date)}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Duration:</span>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={editForm.estimatedDuration}
                        onChange={(e) => setEditForm(prev => ({ ...prev, estimatedDuration: parseFloat(e.target.value) || 1 }))}
                        className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                      />
                      <span className="text-sm text-gray-700">hours</span>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      Estimated Duration: {event.estimatedDuration} hour{event.estimatedDuration !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Priority (Edit Mode Only) */}
              {isEditing && (
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Priority:</span>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as MaintenanceEvent['priority'] }))}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Technician */}
              {event.technician && (
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assigned to: {event.technician}</p>
                  </div>
                </div>
              )}

              {/* Asset Information */}
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.assetName}</p>
                  {asset && (
                    <div className="text-sm text-gray-500">
                      <p>{asset.brand} • {asset.equipmentType}</p>
                      <div className="flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{asset.location.facility} - {asset.location.area}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {(event.description || isEditing) && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
                      placeholder="Add maintenance description..."
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{event.description}</p>
                  )}
                </div>
              )}

              {/* Overdue Warning */}
              {isOverdue && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Maintenance Overdue</h4>
                      <p className="text-sm text-red-700 mt-1">
                        This maintenance was scheduled for {formatDate(event.date)} and is now overdue.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {canComplete && onComplete && (
                  <button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </button>
                )}

                {canEdit && onUpdate && (
                  <button
                    onClick={handleEdit}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}

                {canCancel && onCancel && (
                  <button
                    onClick={handleCancelMaintenance}
                    disabled={isCancelling}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {!isEditing && (
              <button
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarEventModal;