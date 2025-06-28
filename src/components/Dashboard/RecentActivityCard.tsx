import React from 'react';
import { Calendar, Wrench, Package, User } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'maintenance' | 'order' | 'inspection';
  title: string;
  description: string;
  timestamp: string;
  asset?: string;
  user?: string;
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
  onViewAll: () => void;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities, onViewAll }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'order':
        return <Package className="w-4 h-4 text-green-600" />;
      case 'inspection':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div className="flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </h4>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                {activity.asset && (
                  <span className="flex items-center space-x-1">
                    <Package className="w-3 h-3" />
                    <span>{activity.asset}</span>
                  </span>
                )}
                {activity.user && (
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{activity.user}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivityCard;