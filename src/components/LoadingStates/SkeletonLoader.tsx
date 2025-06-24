import React from 'react';

interface SkeletonLoaderProps {
  rows?: number;
  showHeader?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  rows = 5, 
  showHeader = true 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {showHeader && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-64 mt-2"></div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </th>
              <th className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="animate-pulse">
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
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkeletonLoader;