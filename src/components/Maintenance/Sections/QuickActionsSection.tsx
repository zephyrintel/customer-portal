import React from 'react';
import { Wrench, Plus, Calendar, AlertCircle } from 'lucide-react';
import BaseCard from '../../Dashboard/BaseCard';

interface QuickActionsSectionProps {
  onCreateWorkOrder?: () => void;
  onScheduleMaintenance?: () => void;
  onReportIssue?: () => void;
  extraActions?: { label: string; onClick: () => void; icon?: React.ComponentType<{ className?: string }>; }[];
}

const ActionButton: React.FC<{
  label: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = ({ label, onClick, icon: Icon, color }) => (
  <button
    onClick={onClick}
    className={`btn-touch w-full px-3 py-3 border border-gray-200 rounded-lg hover:shadow-sm transition flex items-center justify-center space-x-2 ${color}`}
  >
    <Icon className="w-4 h-4" />
    <span className="font-medium">{label}</span>
  </button>
);

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onCreateWorkOrder,
  onScheduleMaintenance,
  onReportIssue,
  extraActions = []
}) => {
  return (
    <BaseCard title="Quick Actions" icon={Wrench} iconColor="text-indigo-600">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <ActionButton label="New Work Order" onClick={onCreateWorkOrder} icon={Plus} color="bg-white" />
        <ActionButton label="Schedule Maintenance" onClick={onScheduleMaintenance} icon={Calendar} color="bg-white" />
        <ActionButton label="Report Issue" onClick={onReportIssue} icon={AlertCircle} color="bg-white" />
        {extraActions.map((a, idx) => (
          <ActionButton key={idx} label={a.label} onClick={a.onClick} icon={a.icon || Wrench} color="bg-white" />
        ))}
      </div>
    </BaseCard>
  );
};

export default QuickActionsSection;

