import React from 'react';
import { PlayCircle } from 'lucide-react';
import BaseCard from '../../Dashboard/BaseCard';

export interface ActiveTaskItem {
  id: string;
  title: string;
  assetName: string;
  startedAt: string; // ISO date
  assignee?: string;
  progress?: number; // 0-100
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface ActiveTasksSectionProps {
  tasks: ActiveTaskItem[];
  onOpenTask?: (taskId: string) => void;
}

const priorityBadge: Record<NonNullable<ActiveTaskItem['priority']>, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const ActiveTasksSection: React.FC<ActiveTasksSectionProps> = ({ tasks, onOpenTask }) => {
  return (
    <BaseCard title="Active Tasks" icon={PlayCircle} iconColor="text-green-600">
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-6">No active tasks.</div>
        ) : (
          tasks.map(task => (
            <button
              key={task.id}
              onClick={() => onOpenTask?.(task.id)}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:shadow-sm transition bg-white"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900">{task.title}</div>
                  <div className="text-xs text-gray-500">{task.assetName} {task.assignee ? `• ${task.assignee}` : ''}</div>
                </div>
                {task.priority && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityBadge[task.priority]}`}>
                    {task.priority}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                <span>Started {new Date(task.startedAt).toLocaleString()}</span>
                {typeof task.progress === 'number' && (
                  <span className="ml-2">{task.progress}%</span>
                )}
              </div>
              {typeof task.progress === 'number' && (
                <div className="mt-2 h-2 bg-gray-100 rounded">
                  <div className="h-2 bg-green-500 rounded" style={{ width: `${Math.max(0, Math.min(100, task.progress))}%` }} />
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </BaseCard>
  );
};

export default ActiveTasksSection;

