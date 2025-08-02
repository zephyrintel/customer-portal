import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaintenanceItem } from '../../src/types/Maintenance';
import { useDeviceType } from '../../src/hooks/useTouch';
import VirtualList from '../../src/components/VirtualList/VirtualList';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle, 
  Clock, 
  CheckCircle
} from 'lucide-react';

interface MaintenanceListTableProps {
  items: MaintenanceItem[];
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string, shiftKey: boolean) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  showSelection?: boolean;
}

const getPriorityIcon = (priority: MaintenanceItem['priority']) => {
  switch (priority) {
    case 'critical':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    case 'high':
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    case 'medium':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case 'low':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    default:
      return null;
  }
};

const getPriorityBadge = (priority: MaintenanceItem['priority']) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const MaintenanceListTable: React.FC<MaintenanceListTableProps> = ({ 
  items,
  selectedIds = new Set(),
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  isAllSelected = false,
  isIndeterminate = false,
  showSelection = false
}) => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      handleScroll();
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [items]);

  const handleRowClick = (itemId: string, event: React.MouseEvent) => {
    if (
      (event.target as HTMLElement).closest('input[type="checkbox"]') ||
      (showSelection && (event.shiftKey || event.ctrlKey || event.metaKey))
    ) {
      return;
    }
    navigate(`/maintenance/${itemId}`);
  };

  const handleCheckboxClick = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onToggleSelection) {
      onToggleSelection(itemId, event.shiftKey);
    }
  };

  const handleSelectAllChange = () => {
    if (isAllSelected || isIndeterminate) {
      onClearSelection?.();
    } else {
      onSelectAll?.();
    }
  };

  const renderMobileCard = (item: MaintenanceItem) => (
    <div
      key={item.id}
      onClick={(e) => handleRowClick(item.id, e)}
      className={`p-4 bg-white border border-gray-200 rounded-lg mb-3 transition-all duration-150 ease-in-out active:bg-gray-50 ${
        selectedIds.has(item.id) 
          ? 'ring-2 ring-blue-500 border-blue-300' 
          : 'hover:shadow-md'
      }`}
    >
      {showSelection && (
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={selectedIds.has(item.id)}
            onChange={(e) => handleCheckboxClick(item.id, e)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            aria-label={`Select ${item.name}`}
          />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{getPriorityIcon(item.priority)}</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900 truncate" title={`${item.asset.serialNumber} - ${item.asset.modelCode}`}>
              {item.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {item.equipmentType}
            </p>
          </div>
        </div>
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(item.priority)}`}>
          {getPriorityIcon(item.priority)}
          <span className="ml-1 capitalize">{item.priority}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="font-medium text-gray-700">Location:</span>
          <p className="text-gray-900 text-xs mt-1">{item.location}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Days Overdue:</span>
          <p className="text-gray-900 text-xs mt-1">{item.daysOverdue ?? 'None'}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Last Maintenance:</span>
          <p className="text-gray-900 text-xs mt-1">{item.lastMaint ?? 'Never'}</p>
        </div>
      </div>
    </div>
  );

  const renderTabletTable = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Maintenance Schedule</h2>
        <p className="text-sm text-gray-600 mt-1">
          {showSelection 
            ? 'Tap items to select for bulk operations' 
            : 'Tap any row to view maintenance details'
          }
        </p>
      </div>
      
      <div className="relative">
        {showLeftScroll && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-white via-white to-transparent pl-2 pr-8 pointer-events-none">
            <ChevronLeft className="text-gray-600 w-5 h-5" />
          </div>
        )}
        {showRightScroll && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-white via-white to-transparent pr-2 pl-8 pointer-events-none">
            <ChevronRight className="text-gray-600 w-5 h-5" />
          </div>
        )}
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
            <thead className="bg-gray-50">
              <tr>
                {showSelection && (
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={handleSelectAllChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label="Select all maintenance items"
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20" style={{ minWidth: '250px' }}>
                  Equipment
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                  Days Overdue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={(e) => handleRowClick(item.id, e)}
                  className={`transition-colors duration-150 ease-in-out cursor-pointer min-h-[60px] ${
                    selectedIds.has(item.id) 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  {showSelection && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={(e) => handleCheckboxClick(item.id, e)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        aria-label={`Select ${item.name}`}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{getPriorityIcon(item.priority)}</span>
                      <div className="flex flex-col">
                        <div className="text-base font-medium text-gray-900" title={`${item.asset.serialNumber} - ${item.asset.modelCode}`}>
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.equipmentType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-base font-medium text-gray-900">
                        {item.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(item.priority)}`}>
                      {getPriorityIcon(item.priority)}
                      <span className="ml-1 capitalize">{item.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.daysOverdue ?? 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile View */}
      {deviceType === 'mobile' && (
        <div className="space-y-3">
          {showSelection && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAllChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-base font-medium text-gray-900">
                    Select All ({items.length})
                  </span>
                </label>
                {selectedIds.size > 0 && (
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>
            </div>
          )}
          
          {items.length > 50 ? (
            <VirtualList
              items={items}
              itemHeight={180}
              containerHeight={600}
              renderItem={renderMobileCard}
              className="px-1"
            />
          ) : (
            <div className="space-y-3">
              {items.map((item) => renderMobileCard(item))}
            </div>
          )}
        </div>
      )}

      {/* Tablet View */}
      {deviceType === 'tablet' && renderTabletTable()}

      {/* Desktop View */}
      {deviceType === 'desktop' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Maintenance Schedule</h2>
        <p className="text-sm text-gray-600 mt-1">
          {showSelection 
            ? 'Select items to perform bulk operations' 
            : 'Click on any row to view maintenance details'
          }
        </p>
      </div>
      
      <div className="relative">
        {showLeftScroll && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-white via-white to-transparent pl-2 pr-8 pointer-events-none">
            <ChevronLeft className="text-gray-600 w-5 h-5" />
          </div>
        )}
        {showRightScroll && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-white via-white to-transparent pr-2 pl-8 pointer-events-none">
            <ChevronRight className="text-gray-600 w-5 h-5" />
          </div>
        )}
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1000px' }}>
            <thead className="bg-gray-50">
              <tr>
                {showSelection && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={handleSelectAllChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label="Select all maintenance items"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r border-gray-200" style={{ minWidth: '250px' }}>
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '140px' }}>
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  Days Overdue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={(e) => handleRowClick(item.id, e)}
                  className={`transition-colors duration-150 ease-in-out cursor-pointer ${
                    selectedIds.has(item.id) 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  } ${showSelection ? 'cursor-pointer' : 'cursor-pointer'}`}
                >
                  {showSelection && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={(e) => handleCheckboxClick(item.id, e)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        aria-label={`Select ${item.name}`}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{getPriorityIcon(item.priority)}</span>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900" title={`${item.asset.serialNumber} - ${item.asset.modelCode}`}>
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.equipmentType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>
                        {item.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(item.priority)}`}>
                      {getPriorityIcon(item.priority)}
                      <span className="ml-1 capitalize">
                        {item.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium text-red-600">{item.daysOverdue ?? 'None'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
      )}
      
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-base">No maintenance items found</p>
        </div>
      )}
    </>
  );
};

export default MaintenanceListTable;
