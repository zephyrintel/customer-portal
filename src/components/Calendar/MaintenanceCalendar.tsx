import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Filter, Eye, ChevronDown } from 'lucide-react';
import { Asset } from '../../types/Asset';
import { useDeviceType } from '../../hooks/useTouch';

interface MaintenanceEvent {
  id: string;
  assetId: string;
  assetName: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'calibration';
  date: Date;
  title: string;
  description?: string;
  technician?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  estimatedDuration: number; // in hours
}

interface MaintenanceCalendarProps {
  events: MaintenanceEvent[];
  assets: Asset[];
  onEventClick: (event: MaintenanceEvent) => void;
  onDateClick: (date: Date) => void;
  onScheduleNew: (date: Date) => void;
  selectedAssetFilter?: string;
  selectedTypeFilter?: string;
}

const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({
  events,
  assets,
  onEventClick,
  onDateClick,
  onScheduleNew,
  selectedAssetFilter,
  selectedTypeFilter
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const deviceType = useDeviceType();

  // Maintenance type configuration
  const maintenanceTypes = {
    preventive: { 
      label: 'Preventive', 
      color: 'bg-blue-500', 
      lightColor: 'bg-blue-100', 
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200'
    },
    corrective: { 
      label: 'Corrective', 
      color: 'bg-orange-500', 
      lightColor: 'bg-orange-100', 
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    },
    emergency: { 
      label: 'Emergency', 
      color: 'bg-red-500', 
      lightColor: 'bg-red-100', 
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    },
    inspection: { 
      label: 'Inspection', 
      color: 'bg-purple-500', 
      lightColor: 'bg-purple-100', 
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200'
    },
    calibration: { 
      label: 'Calibration', 
      color: 'bg-green-500', 
      lightColor: 'bg-green-100', 
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    }
  };

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const assetMatch = !selectedAssetFilter || event.assetId === selectedAssetFilter;
      const typeMatch = !selectedTypeFilter || event.type === selectedTypeFilter;
      return assetMatch && typeMatch;
    });
  }, [events, selectedAssetFilter, selectedTypeFilter]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToMonth = (year: number, month: number) => {
    setCurrentDate(new Date(year, month, 1));
    setShowDatePicker(false);
  };

  const navigateToDate = (direction: 'prev' | 'next', unit: 'month' | 'year') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (unit === 'month') {
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      } else {
        newDate.setFullYear(prev.getFullYear() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  // Format date for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Generate month/year options for dropdown
  const generateDateOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate 2 years back and 2 years forward
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
      years.push(year);
    }

    return { years, months };
  };

  const { years, months } = generateDateOptions();

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    onDateClick(date);
    
    // If no events on this date, offer to schedule new maintenance
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0 && !isPastDate(date)) {
      onScheduleNew(date);
    }
  };

  // Render event in calendar cell
  const renderEvent = (event: MaintenanceEvent, isCompact = false) => {
    const typeConfig = maintenanceTypes[event.type];
    
    if (isCompact) {
      return (
        <div
          key={event.id}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick(event);
          }}
          className={`w-2 h-2 rounded-full ${typeConfig.color} cursor-pointer hover:scale-125 transition-transform duration-150`}
          title={`${event.title} - ${event.assetName}`}
        />
      );
    }

    return (
      <div
        key={event.id}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
        className={`text-xs p-1 mb-1 rounded cursor-pointer transition-all duration-150 hover:shadow-sm ${typeConfig.lightColor} ${typeConfig.textColor} ${typeConfig.borderColor} border`}
      >
        <div className="font-medium truncate">{event.title}</div>
        <div className="text-xs opacity-75 truncate">{event.assetName}</div>
      </div>
    );
  };

  // Mobile day view
  const renderMobileDay = (date: Date, dayEvents: MaintenanceEvent[]) => {
    const isCurrentMonthDay = isCurrentMonth(date);
    const isTodayDate = isToday(date);
    const isPast = isPastDate(date);

    return (
      <div
        key={date.toISOString()}
        onClick={() => handleDateClick(date)}
        className={`min-h-[80px] p-2 border-b border-gray-200 cursor-pointer transition-colors duration-150 ${
          isTodayDate ? 'bg-blue-50' : 'hover:bg-gray-50'
        } ${!isCurrentMonthDay ? 'opacity-50' : ''} ${isPast ? 'bg-gray-50' : ''}`}
      >
        <div className={`text-sm font-medium mb-2 ${
          isTodayDate ? 'text-blue-600' : isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
        }`}>
          {date.getDate()}
          {isTodayDate && <span className="ml-1 text-xs">(Today)</span>}
        </div>
        
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map(event => renderEvent(event))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-gray-500">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  // Desktop calendar cell
  const renderDesktopDay = (date: Date, dayEvents: MaintenanceEvent[]) => {
    const isCurrentMonthDay = isCurrentMonth(date);
    const isTodayDate = isToday(date);
    const isPast = isPastDate(date);

    return (
      <div
        key={date.toISOString()}
        onClick={() => handleDateClick(date)}
        className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-all duration-150 ${
          isTodayDate ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
        } ${!isCurrentMonthDay ? 'opacity-50' : ''} ${isPast ? 'bg-gray-50' : ''}`}
      >
        <div className={`text-sm font-medium mb-2 ${
          isTodayDate ? 'text-blue-600' : isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
        }`}>
          {date.getDate()}
        </div>
        
        <div className="space-y-1">
          {dayEvents.slice(0, 2).map(event => renderEvent(event))}
          {dayEvents.length > 2 && (
            <div className="flex space-x-1">
              {dayEvents.slice(2, 5).map(event => renderEvent(event, true))}
              {dayEvents.length > 5 && (
                <div className="text-xs text-gray-500">
                  +{dayEvents.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Calendar Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              
              {/* Interactive Month/Year Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1 min-h-[44px] px-2 rounded-md hover:bg-gray-50"
                >
                  <span>{formatMonthYear(currentDate)}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDatePicker ? 'rotate-180' : ''}`} />
                </button>

                {/* Month/Year Dropdown */}
                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[280px]">
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Year Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {years.map(year => (
                              <button
                                key={year}
                                onClick={() => goToMonth(year, currentDate.getMonth())}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150 min-h-[36px] ${
                                  year === currentDate.getFullYear()
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Month Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {months.map((month, index) => (
                              <button
                                key={month}
                                onClick={() => goToMonth(currentDate.getFullYear(), index)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150 min-h-[36px] ${
                                  index === currentDate.getMonth()
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                {month}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                        <button
                          onClick={goToToday}
                          className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 min-h-[36px]"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => setShowDatePicker(false)}
                          className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 min-h-[36px]"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {deviceType !== 'mobile' && (
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 min-h-[44px]"
              >
                Today
              </button>
            )}
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center space-x-1">
            {/* Year Navigation (Desktop Only) */}
            {deviceType !== 'mobile' && (
              <>
                <button
                  onClick={() => navigateToDate('prev', 'year')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-gray-50"
                  title="Previous Year"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-2" />
                </button>
              </>
            )}

            {/* Month Navigation */}
            <button
              onClick={() => navigateToDate('prev', 'month')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-gray-50"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => navigateToDate('next', 'month')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-gray-50"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Year Navigation (Desktop Only) */}
            {deviceType !== 'mobile' && (
              <button
                onClick={() => navigateToDate('next', 'year')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-gray-50"
                title="Next Year"
              >
                <ChevronRight className="w-4 h-4" />
                <ChevronRight className="w-4 h-4 -ml-2" />
              </button>
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(maintenanceTypes).map(([type, config]) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${config.color}`}></div>
              <span className="text-xs text-gray-600">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 sm:p-6">
        {deviceType === 'mobile' ? (
          // Mobile: Vertical list view
          <div>
            <div className="grid grid-cols-7 gap-1 mb-4 text-center text-xs font-medium text-gray-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>
            <div className="space-y-0">
              {calendarDays.map(date => {
                const dayEvents = getEventsForDate(date);
                return renderMobileDay(date, dayEvents);
              })}
            </div>
          </div>
        ) : (
          // Desktop: Grid view
          <div>
            <div className="grid grid-cols-7 gap-0 mb-2">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-b border-gray-200">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0">
              {calendarDays.map(date => {
                const dayEvents = getEventsForDate(date);
                return renderDesktopDay(date, dayEvents);
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredEvents.length} maintenance event{filteredEvents.length !== 1 ? 's' : ''} this month
          </span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{filteredEvents.filter(e => e.status === 'overdue').length} overdue</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{filteredEvents.filter(e => e.status === 'completed').length} completed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Click outside handler for date picker */}
      {showDatePicker && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

export default MaintenanceCalendar;