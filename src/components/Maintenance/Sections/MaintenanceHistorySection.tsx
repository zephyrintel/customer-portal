import React from 'react';
import { History } from 'lucide-react';
import BaseCard from '../../Dashboard/BaseCard';

export interface HistoryRecordItem {
  id: string;
  completedAt: string; // ISO
  title: string;
  assetName: string;
  technician?: string;
  durationHours?: number;
  outcome?: 'success' | 'partial' | 'failed';
}

interface MaintenanceHistorySectionProps {
  records: HistoryRecordItem[];
  onOpenRecord?: (recordId: string) => void;
}

const outcomeBadge: Record<NonNullable<HistoryRecordItem['outcome']>, string> = {
  success: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800'
};

const MaintenanceHistorySection: React.FC<MaintenanceHistorySectionProps> = ({ records, onOpenRecord }) => {
  return (
    <BaseCard title="Maintenance History" icon={History} iconColor="text-gray-700">
      <div className="divide-y divide-gray-200">
        {records.length === 0 ? (
          <div className="text-center text-gray-500 py-6">No history records.</div>
        ) : (
          records.map(r => (
            <button
              key={r.id}
              onClick={() => onOpenRecord?.(r.id)}
              className="w-full text-left px-3 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.assetName} {r.technician ? `• ${r.technician}` : ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{new Date(r.completedAt).toLocaleString()}</div>
                  {r.outcome && (
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${outcomeBadge[r.outcome]}`}>
                      {r.outcome}
                    </span>
                  )}
                </div>
              </div>
              {typeof r.durationHours === 'number' && (
                <div className="mt-2 text-xs text-gray-600">Duration: {r.durationHours}h</div>
              )}
            </button>
          ))
        )}
      </div>
    </BaseCard>
  );
};

export default MaintenanceHistorySection;

