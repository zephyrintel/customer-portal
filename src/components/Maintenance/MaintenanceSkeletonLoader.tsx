import React from 'react';
import { useDeviceType } from '../../hooks/useTouch';

interface MaintenanceSkeletonLoaderProps {
  rows?: number;
}

const MaintenanceSkeletonLoader: React.FC<MaintenanceSkeletonLoaderProps> = ({ 
  rows = 5 
}) => {
  const deviceType = useDeviceType();

  if (deviceType === 'mobile') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaintenanceSkeletonLoader;
</parameter>
</invoke>