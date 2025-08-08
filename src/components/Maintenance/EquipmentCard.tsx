import React, { useMemo, useState } from 'react';
import { formatDate } from '../../utils/dateUtils';
import { EquipmentType } from '../../types/equipment';
import { useDeviceType } from '../../hooks/useTouch';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';
import {
  Droplets,
  Wind,
  Cog,
  BadgeAlert,
  CalendarClock,
  Wrench,
  Eye
} from 'lucide-react';

export type EquipmentHealth = 'operational' | 'warning' | 'critical';

export interface EquipmentCardProps {
  equipmentId: string;
  name: string;
  type: EquipmentType;
  health: EquipmentHealth;
  nextMaintenanceDate?: string | null;
  onScheduleMaintenance?: (equipmentId: string) => void;
  onQuickInspect?: (equipmentId: string) => void;
  onViewDetails?: (equipmentId: string) => void;
  className?: string;
  isScheduling?: boolean;
  isInspecting?: boolean;
}

const typeIconMap: Record<EquipmentType, React.ComponentType<any>> = {
  [EquipmentType.Pump]: Droplets,
  [EquipmentType.Compressor]: Wind,
  [EquipmentType.Motor]: Cog,
};

const healthStyles: Record<EquipmentHealth, { badge: string; dot: string; text: string; ring: string }> = {
  operational: {
    badge: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
    text: 'text-green-700',
    ring: 'ring-green-500/20',
  },
  warning: {
    badge: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-500',
    text: 'text-yellow-700',
    ring: 'ring-yellow-500/20',
  },
  critical: {
    badge: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
    text: 'text-red-700',
    ring: 'ring-red-500/20',
  },
};

const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipmentId,
  name,
  type,
  health,
  nextMaintenanceDate,
  onScheduleMaintenance,
  onQuickInspect,
  onViewDetails,
  className = '',
  isScheduling = false,
  isInspecting = false,
}) => {
  const Icon = typeIconMap[type] ?? Cog;
  const styles = healthStyles[health];
  const deviceType = useDeviceType();
  const [showActions, setShowActions] = useState(false);

  const swipeHandlers = useSwipeGestures(
    {
      onSwipeLeft: () => deviceType === 'mobile' && setShowActions(true),
      onSwipeRight: () => deviceType === 'mobile' && setShowActions(false),
    },
    { threshold: 30 }
  );

  const cardClasses = useMemo(
    () =>
      `group border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all duration-200 ${
        deviceType === 'mobile' ? 'relative overflow-hidden' : ''
      } ${className}`,
    [className, deviceType]
  );

  return (
    <div
      className={cardClasses}
      role="region"
      aria-label={`${name} (${equipmentId}) card`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ kind: 'equipment', equipmentId }));
        e.dataTransfer.effectAllowed = 'copyMove';
      }}
      {...(deviceType === 'mobile' ? swipeHandlers : {})}
    >
      {/* Slide content left on mobile when actions are shown */}
      <div
        className={`${deviceType === 'mobile' ? 'transform transition-transform duration-200' : ''} ${
          showActions && deviceType === 'mobile' ? '-translate-x-24' : 'translate-x-0'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gray-50 ${styles.ring} ring-2`}>
              <Icon className={`w-5 h-5 ${styles.text}`} aria-hidden="true" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{name}</div>
              <div className="text-xs text-gray-500">ID: {equipmentId}</div>
            </div>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${styles.badge}`}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${styles.dot}`} aria-hidden="true" />
            {health}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <CalendarClock className="w-4 h-4 text-gray-500 mr-2" aria-hidden="true" />
            <div>
              <div className="text-gray-500">Next maintenance</div>
              <div className="font-medium text-gray-900">{formatDate(nextMaintenanceDate ?? null, { format: 'short' })}</div>
            </div>
          </div>
          <div className="flex items-center">
            <BadgeAlert className={`w-4 h-4 mr-2 ${styles.text}`} aria-hidden="true" />
            <div>
              <div className="text-gray-500">Health</div>
              <div className={`font-semibold ${styles.text} capitalize`}>{health}</div>
            </div>
          </div>
          <div className="flex items-center">
            <Icon className="w-4 h-4 text-gray-500 mr-2" aria-hidden="true" />
            <div>
              <div className="text-gray-500">Type</div>
              <div className="font-medium text-gray-900 capitalize">{type}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onScheduleMaintenance?.(equipmentId)}
            disabled={!onScheduleMaintenance || isScheduling}
            className={`btn-touch touch-active w-full min-h-[44px] h-11 inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`}
            aria-label="Schedule maintenance"
          >
            {isScheduling ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Scheduling...
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 mr-2" aria-hidden="true" />
                Schedule
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onQuickInspect?.(equipmentId)}
            disabled={!onQuickInspect || isInspecting}
            className={`btn-touch touch-active w-full min-h-[44px] h-11 inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500`}
            aria-label="Log quick inspection"
          >
            {isInspecting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Logging...
              </>
            ) : (
              <>
                <BadgeAlert className="w-4 h-4 mr-2" aria-hidden="true" />
                Quick Inspect
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onViewDetails?.(equipmentId)}
            disabled={!onViewDetails}
            className={`btn-touch touch-active w-full min-h-[44px] h-11 inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300`}
            aria-label="View equipment details"
          >
            <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
            Details
          </button>
        </div>
      </div>

      {deviceType === 'mobile' && (
        <div className={`absolute top-0 right-0 h-full w-24 flex flex-col justify-center space-y-2 p-2 bg-gray-50 border-l border-gray-200 transition-transform duration-200 ${showActions ? 'translate-x-0' : 'translate-x-24'}`}>
          <button
            type="button"
            className="btn-touch touch-active bg-blue-600 text-white rounded-lg text-xs font-medium px-2 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onScheduleMaintenance?.(equipmentId);
              setShowActions(false);
            }}
            aria-label="Quick schedule"
          >
            <Wrench className="w-4 h-4 mx-auto" />
          </button>
          <button
            type="button"
            className="btn-touch touch-active bg-gray-700 text-white rounded-lg text-xs font-medium px-2 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onQuickInspect?.(equipmentId);
              setShowActions(false);
            }}
            aria-label="Quick inspect"
          >
            <BadgeAlert className="w-4 h-4 mx-auto" />
          </button>
          <button
            type="button"
            className="btn-touch touch-active bg-white text-gray-700 border border-gray-200 rounded-lg text-xs font-medium px-2 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(equipmentId);
              setShowActions(false);
            }}
            aria-label="Quick details"
          >
            <Eye className="w-4 h-4 mx-auto" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EquipmentCard;

