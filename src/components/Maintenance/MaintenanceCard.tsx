import React, { memo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  MapPin,
  Droplets,
  Wind,
  Wrench,
  Zap,
  Flame,
  Cylinder,
  Settings
} from 'lucide-react';
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
        return <Droplets />;
      case 'Compressor':
        return <Wind />;
      case 'Valve':
        return <Wrench />;
      case 'Motor':
        return <Zap />;
      case 'Heat Exchanger':
        return <Flame />;
      case 'Tank':
        return <Cylinder />;
      default:
        return <Settings />;
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


  // Unified table row view for all devices
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