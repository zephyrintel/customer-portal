import React from 'react';
import { HeartPulse, AlertTriangle } from 'lucide-react';
import BaseCard from '../../Dashboard/BaseCard';

export interface EquipmentItem {
  id: string;
  name: string;
  model?: string;
  location?: string;
  health: 'good' | 'warning' | 'critical';
  healthScore?: number; // 0-100
  lastServiceDate?: string; // ISO date
  nextServiceDate?: string; // ISO date
}

interface EquipmentOverviewSectionProps {
  equipment: EquipmentItem[];
  onSelect?: (equipmentId: string) => void;
}

const healthStyles: Record<EquipmentItem['health'], { badge: string; dot: string; text: string }> = {
  good: { badge: 'bg-green-100 text-green-800', dot: 'bg-green-500', text: 'text-green-700' },
  warning: { badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500', text: 'text-yellow-700' },
  critical: { badge: 'bg-red-100 text-red-800', dot: 'bg-red-500', text: 'text-red-700' }
};

const EquipmentCard: React.FC<{ item: EquipmentItem; onClick?: () => void }> = ({ item, onClick }) => {
  const style = healthStyles[item.health];
  return (
    <div
      onClick={onClick}
      className="group border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gray-50">
            <HeartPulse className={`w-5 h-5 ${style.text}`} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-xs text-gray-500">
              {item.model || '—'}{item.location ? ` • ${item.location}` : ''}
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${style.badge}`}>{item.health}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Health</div>
          <div className={`font-semibold ${style.text}`}>{item.healthScore ?? '—'}{typeof item.healthScore === 'number' ? '%' : ''}</div>
        </div>
        <div>
          <div className="text-gray-500">Last Service</div>
          <div className="font-medium text-gray-900">{item.lastServiceDate ? new Date(item.lastServiceDate).toLocaleDateString() : '—'}</div>
        </div>
        <div>
          <div className="text-gray-500">Next Service</div>
          <div className="font-medium text-gray-900">{item.nextServiceDate ? new Date(item.nextServiceDate).toLocaleDateString() : '—'}</div>
        </div>
      </div>

      {item.health === 'critical' && (
        <div className="mt-3 flex items-center text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 mr-1" /> Attention required
        </div>
      )}
    </div>
  );
};

const EquipmentOverviewSection: React.FC<EquipmentOverviewSectionProps> = ({ equipment, onSelect }) => {
  return (
    <BaseCard
      title="Equipment Overview"
      icon={HeartPulse}
      iconColor="text-blue-600"
      className=""
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">No equipment found.</div>
        ) : (
          equipment.map(item => (
            <EquipmentCard key={item.id} item={item} onClick={() => onSelect?.(item.id)} />
          ))
        )}
      </div>
    </BaseCard>
  );
};

export default EquipmentOverviewSection;

