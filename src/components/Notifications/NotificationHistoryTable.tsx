import React from 'react';
import { NotificationHistory } from '../../types/Notification';

interface NotificationHistoryTableProps {
  history: NotificationHistory[];
}

const NotificationHistoryTable: React.FC<NotificationHistoryTableProps> = ({ history }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {history.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ruleName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.assetName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.channel}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.recipient}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.sentAt).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.status === 'sent' ? 'Sent' : 'Failed'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotificationHistoryTable;

