import React from 'react';
import { Calendar } from 'lucide-react';
import BaseCard from '../../Dashboard/BaseCard';
import MaintenanceCalendar from '../../Calendar/MaintenanceCalendar';

import type { Asset } from '../../../types/Asset';

export interface MaintenanceEvent {
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

interface MaintenanceScheduleSectionProps {
  events: MaintenanceEvent[];
  assets: Asset[];
  onEventClick: (event: MaintenanceEvent) => void;
  onDateClick: (date: Date) => void;
  onScheduleNew: (date: Date, equipmentId?: string) => void;
  onReschedule?: (event: MaintenanceEvent, newDate: Date) => void;
}

const MaintenanceScheduleSection: React.FC<MaintenanceScheduleSectionProps> = ({
  events,
  assets,
  onEventClick,
  onDateClick,
  onScheduleNew,
  onReschedule
}) => {
  return (
    <BaseCard title="Maintenance Schedule" icon={Calendar} iconColor="text-blue-600">
      <MaintenanceCalendar
        events={events}
        assets={assets}
        onEventClick={onEventClick}
        onDateClick={onDateClick}
        onScheduleNew={onScheduleNew}
        onReschedule={onReschedule}
      />
    </BaseCard>
  );
};

export default MaintenanceScheduleSection;

