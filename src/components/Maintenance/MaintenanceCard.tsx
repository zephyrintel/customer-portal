import React, { memo } from 'react';
import { AlertTriangle, Clock, CheckCircle, Package, MapPin } from 'lucide-react';
import { MaintenanceItem } from '../../hooks/useMaintenanceFiltering';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useDeviceType } from '../../hooks/useTouch';
import { formatDate } from '../../utils/dateUtils';

interface MaintenanceCardProps {
  item: MaintenanceItem;
  isSelected: boolean;
  onToggleSelection: (id: string, shiftKey: boolean) => void;
  onRowClick: (id: string, event: React.MouseEvent) => void;
  showSelection: boolean;
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = memo(({
  item,
  isSelected,
  onToggleSelection,
  onRowClick,
  showSelection
}) => {
  const deviceType = useDeviceType();
  const { triggerHaptic } = useHapticFeedback();

  const handleComplete = () => {
    triggerHaptic('success');
    // TODO: Implement complete action
    console.log('Complete maintenance for:', item.name);
  };

  const handleReschedule = () => {
    triggerHaptic('medium');
    // TODO: Implement reschedule action
    console.log('Reschedule maintenance for:', item.name);
  };

  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: handleComplete,
    onSwipeRight: handleReschedule
  });

  const getPriorityIcon = () => {
    switch (item.priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusBadge = () => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide";
    
    switch (item.status) {
      case 'In Operation':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Intermittent Operation':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Not Commissioned':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Not In Use':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Unknown':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getEquipmentTypeIcon = () => {
    switch (item.equipmentType) {
      case 'Pump':
        return '🔄';
      case 'Compressor':
        return '💨';
      case 'Valve':
        return '🔧';
      case 'Motor':
        return '⚡';
      case 'Heat Exchanger':
        return '🔥';
      case 'Tank':
        return '🛢️';
      default:
        return '⚙️';
    }
  };

  const formatMaintenanceDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return formatDate(dateString, { format: 'short' });
  };

  const handleCheckboxClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    triggerHaptic('light');
    onToggleSelection(item.id, event.shiftKey);
  };

  const handleCardClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    onRowClick(item.id, event);
  };

  // Mobile card view
  if (deviceType === 'mobile') {
    return (
      <div
        {...swipeHandlers}
        onClick={handleCardClick}
        className={`p-4 bg-white border border-gray-200 rounded-lg mb-3 transition-all duration-150 ease-in-out active:bg-gray-50 cursor-pointer relative overflow-hidden ${
          isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'hover:shadow-md'
        }`}
      >
        {/* Swipe indicators */}
        <div className="absolute inset-y-0 left-0 w-16 bg-green-500 flex items-center justify-center opacity-0 transition-opacity duration-200">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <div className="absolute inset-y-0 right-0 w-16 bg-blue-500 flex items-center justify-center opacity-0 transition-opacity duration-200">
          <Clock className="w-6 h-6 text-white" />
        </div>

        {showSelection && (
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxClick}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`Select ${item.name}`}
            />
          </div>
        )}
        
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{getEquipmentTypeIcon()}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {item.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <p className="text-sm text-gray-500 truncate">{item.location}</p>
              </div>
            </div>
          </div>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor()}`}>
            {getPriorityIcon()}
            <span className="ml-1 capitalize">{item.priority}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <p className="text-gray-900 text-xs mt-1">{item.equipmentType}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Maintenance:</span>
            <p className="text-gray-900 text-xs mt-1">{formatMaintenanceDate(item.lastMaint)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={getStatusBadge()}>
            {item.status}
          </span>
          {item.daysOverdue && (
            <div className="text-xs text-red-600 font-medium">
              {item.daysOverdue} days overdue
            </div>
          )}
        </div>

        {/* Swipe hint */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          ← Swipe to complete • Swipe to reschedule →
        </div>
      </div>
    );
  }

  // Desktop/tablet row view
  return (
    <tr 
      onClick={handleCardClick}
      className={`transition-colors duration-150 ease-in-out cursor-pointer ${
        isSelected 
          ? 'bg-blue-50 border-blue-200' 
          : 'hover:bg-gray-50'}`}>
      {showSelection && (
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxClick}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            aria-label={`Select ${item.name}`}
          />
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-lg mr-3">{getEquipmentTypeIcon()}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">{item.equipmentType}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{item.location}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor()}`}>
          {getPriorityIcon()}
          <span className="ml-1 capitalize">{item.priority}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={getStatusBadge()}>
          {item.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatMaintenanceDate(item.lastMaint)}</div>
        {item.daysOverdue && (
          <div className="text-xs text-red-600 font-medium">
            {item.daysOverdue} days overdue
          </div>
        )}
      </td>
    </tr>
  );
});

MaintenanceCard.displayName = 'MaintenanceCard';

export default MaintenanceCard;