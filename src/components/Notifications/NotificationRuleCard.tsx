import React from 'react';
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Mail, 
  MessageSquare, 
  Bell,
  Clock,
  AlertTriangle,
  Wrench,
  Package,
  Settings,
  Calendar
} from 'lucide-react';
import { NotificationRule } from '../../types/Notification';

interface NotificationRuleCardProps {
  rule: NotificationRule;
  onToggle: (ruleId: string) => void;
  onDelete: (ruleId: string) => void;
}

const NotificationRuleCard: React.FC<NotificationRuleCardProps> = ({
  rule,
  onToggle,
  onDelete
}) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'paused':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'expired':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance_due':
        return <Wrench className="w-4 h-4" />;
      case 'maintenance_overdue':
        return <AlertTriangle className="w-4 h-4" />;
      case 'part_reorder':
        return <Package className="w-4 h-4" />;
      case 'equipment_status':
        return <Settings className="w-4 h-4" />;
      case 'custom_reminder':
        return <Clock className="w-4 h-4" />;
      case 'system_alert':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelIcons = (channels: string[]) => {
    return channels.map((channel, index) => {
      switch (channel) {
        case 'email':
          return <Mail key={index} className="w-4 h-4 text-gray-500" />;
        case 'sms':
          return <MessageSquare key={index} className="w-4 h-4 text-gray-500" />;
        case 'in_app':
          return <Bell key={index} className="w-4 h-4 text-gray-500" />;
        default:
          return <Bell key={index} className="w-4 h-4 text-gray-500" />;
      }
    });
  };

  const formatCondition = (condition: string, conditionValue?: string | number) => {
    switch (condition) {
      case 'days_before':
        return `${conditionValue} days before`;
      case 'days_after':
        return `${conditionValue} days after`;
      case 'on_date':
        return 'On specific date';
      case 'when_status_changes':
        return 'When status changes';
      case 'when_below_threshold':
        return `When below ${conditionValue}`;
      default:
        return condition;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
            {getTypeIcon(rule.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {rule.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {rule.description}
            </p>
            <div className="flex items-center space-x-2">
              <span className={getStatusBadge(rule.status)}>
                {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
              </span>
              <span className="text-xs text-gray-500">
                {formatCondition(rule.condition, rule.conditionValue)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggle(rule.id)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              rule.status === 'active'
                ? 'text-yellow-600 hover:bg-yellow-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={rule.status === 'active' ? 'Pause rule' : 'Activate rule'}
          >
            {rule.status === 'active' ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            title="Edit rule"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(rule.id)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete rule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Channels:</span>
            <div className="flex items-center space-x-2 mt-1">
              {getChannelIcons(rule.channels)}
              <span className="text-gray-600 ml-2">
                {rule.channels.join(', ')}
              </span>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Recipients:</span>
            <p className="text-gray-600 mt-1 truncate">
              {rule.recipients.length > 0 ? rule.recipients[0] : 'None'}
              {rule.recipients.length > 1 && (
                <span className="text-xs text-gray-500 ml-1">
                  +{rule.recipients.length - 1} more
                </span>
              )}
            </p>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Frequency:</span>
            <div className="flex items-center mt-1">
              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-gray-600 capitalize">
                {rule.frequency}
              </span>
            </div>
          </div>
        </div>

        {rule.nextTrigger && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Next trigger: {new Date(rule.nextTrigger).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationRuleCard;
