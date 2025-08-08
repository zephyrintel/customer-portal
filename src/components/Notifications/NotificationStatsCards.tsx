import React from 'react';
import { BarChart3, Bell, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { NotificationStats } from '../../types/Notification';

interface NotificationStatsCardsProps {
  stats: NotificationStats;
}

const NotificationStatsCards: React.FC<NotificationStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Rules',
      value: stats.totalRules,
      subtitle: `${stats.activeRules} active`,
      icon: Bell,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700'
    },
    {
      title: 'Sent Today',
      value: stats.sentToday,
      subtitle: `${stats.sentThisWeek} this week`,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-700'
    },
    {
      title: 'Delivery Time',
      value: `${Math.round(stats.averageDeliveryTime / 1000)}s`,
      subtitle: 'Average',
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700'
    },
    {
      title: 'Failure Rate',
      value: `${stats.failureRate}%`,
      subtitle: 'Last 30 days',
      icon: AlertTriangle,
      color: stats.failureRate > 5 ? 'red' : 'yellow',
      bgColor: stats.failureRate > 5 ? 'bg-red-50' : 'bg-yellow-50',
      iconColor: stats.failureRate > 5 ? 'text-red-600' : 'text-yellow-600',
      textColor: stats.failureRate > 5 ? 'text-red-700' : 'text-yellow-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${card.bgColor} rounded-lg p-6 border border-opacity-20 border-gray-200 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${card.bgColor} ring-1 ring-inset ring-gray-200`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </p>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {card.title}
              </p>
              <p className={`text-xs ${card.textColor}`}>
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationStatsCards;
