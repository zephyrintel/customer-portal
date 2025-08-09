import React, { useState, useMemo, memo, useCallback } from 'react';
import { Calendar as CalendarIcon, Eye } from 'lucide-react';
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
  onScheduleNew: (date: Date, equipmentId?: string) => void;
  onReschedule?: (event: MaintenanceEvent, newDate: Date) => void;
  selectedAssetFilter?: string;
  selectedTypeFilter?: string;
}

const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = memo((props) => {
  const {
    events,
    onEventClick,
    onDateClick,
    onScheduleNew,
    onReschedule,
    selectedAssetFilter,
    selectedTypeFilter
  } = props;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showCalendar, setShowCalendar] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const deviceType = useDeviceType();

  // Maintenance type configuration
  const maintenanceTypes = useMemo(() => ({
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
  }), []);

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const assetMatch = !selectedAssetFilter || event.assetId === selectedAssetFilter;
      const typeMatch = !selectedTypeFilter || event.type === selectedTypeFilter;
      return assetMatch && typeMatch;
    });
  }, [events, selectedAssetFilter, selectedTypeFilter]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [filteredEvents]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    return days;
  }, [currentDate]);

  // Date utility functions
  const isCurrentMonth = useCallback((date: Date) => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  }, [currentDate]);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  const isPastDate = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  }, []);

  // Navigation functions
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  // Format month/year display
  // Generate date options for dropdown

  // Handle date click
  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    onDateClick(date);
    
    // If no events on this date, offer to schedule new maintenance
    const dayEvents = getEventsForDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dayEvents.length === 0 && date >= today) {
      onScheduleNew(date);
    }
  }, [onDateClick, onScheduleNew, getEventsForDate]);


  // Render event list for selected date
  const renderSelectedDateEvents = useCallback(() => {
    const dayEvents = getEventsForDate(selectedDate);
    
    if (dayEvents.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No maintenance scheduled for this date</p>
          <button
            onClick={() => onScheduleNew(selectedDate)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Schedule maintenance
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h4>
        {dayEvents.map(event => {
          const typeConfig = maintenanceTypes[event.type];
          return (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-150 hover:shadow-sm border ${typeConfig.lightColor} ${typeConfig.textColor} ${typeConfig.borderColor}`}
            >
              <div className="font-medium">{event.title}</div>
              <div className="text-sm opacity-75">{event.assetName}</div>
              <div className="text-xs mt-1">
                {event.date.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })} • {event.estimatedDuration}h
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [selectedDate, getEventsForDate, onEventClick, onScheduleNew, maintenanceTypes]);

  // Format date for native input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Handle native date input change
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    setSelectedDate(newDate);
    onDateClick(newDate);
  };

  // Render individual event
  const renderEvent = useCallback((event: MaintenanceEvent, isCompact = false) => {
    const typeConfig = maintenanceTypes[event.type];
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ kind: 'event', eventId: event.id }));
      e.dataTransfer.effectAllowed = 'move';
    };

    if (isCompact) {
      return (
        <div
          key={event.id}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick(event);
          }}
          draggable
          onDragStart={handleDragStart}
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
        draggable
        onDragStart={handleDragStart}
        className={`text-xs p-1 mb-1 rounded cursor-pointer transition-all duration-150 hover:shadow-sm ${typeConfig.lightColor} ${typeConfig.textColor} ${typeConfig.borderColor} border`}
      >
        <div className="font-medium truncate">{event.title}</div>
        <div className="text-xs opacity-75 truncate">{event.assetName}</div>
      </div>
    );
  }, [onEventClick, maintenanceTypes]);


  // Desktop calendar cell
  const renderDesktopDay = useCallback((date: Date, dayEvents: MaintenanceEvent[]) => {
    const isCurrentMonthDay = isCurrentMonth(date);
    const isTodayDate = isToday(date);
    const isPast = isPastDate(date);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.kind === 'event') {
          const evt = events.find(ev => ev.id === data.eventId);
          if (evt && onReschedule) {
            const newDate = new Date(date);
            // preserve original time component
            newDate.setHours(evt.date.getHours(), evt.date.getMinutes(), 0, 0);
            onReschedule(evt, newDate);
          }
        } else if (data.kind === 'equipment') {
          const newDate = new Date(date);
          onScheduleNew(newDate, data.equipmentId);
        }
      } catch {
        /* noop */
      }
    };

    return (
      <div
        key={date.toISOString()}
        onClick={() => handleDateClick(date)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
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
  }, [isCurrentMonth, isToday, isPastDate, handleDateClick, renderEvent, events, onReschedule, onScheduleNew]);


  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Calendar Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Maintenance Calendar</h2>
          </div>
          
          {/* Quick Date Navigation */}
          <div className="flex items-center space-x-2">
            {/* Native Date Input for Mobile */}
            {deviceType === 'mobile' && (
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleNativeDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              />
            )}
            
            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 min-h-[44px]"
            >
              Today
            </button>

            {/* View toggle */}
            <div className="hidden sm:flex items-center border border-gray-200 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-2 text-sm ${viewMode === 'month' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                aria-pressed={viewMode === 'month'}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-2 text-sm border-l border-gray-200 ${viewMode === 'week' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                aria-pressed={viewMode === 'week'}
              >
                Week
              </button>
            </div>
            
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 min-h-[44px] flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>{showCalendar ? 'Hide' : 'Show'} Calendar</span>
            </button>
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

      {/* Calendar Content */}
      <div className="p-4 sm:p-6">
        {deviceType === 'mobile' ? (
          // Mobile: List view with native date picker
          <div className="space-y-4">
            {/* Date Selector */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleNativeDateChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              />
            </div>
            
            {/* Events for Selected Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              {renderSelectedDateEvents()}
            </div>
          </div>
        ) : (
          // Desktop: Full calendar view
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            {showCalendar && (
              <div className="lg:col-span-2">
                {viewMode === 'month' ? (
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
                ) : (
                  <div>
                    {/* Week view */}
                    {(() => {
                      const startOfWeek = new Date(selectedDate);
                      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                      const weekDays = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date(startOfWeek);
                        d.setDate(d.getDate() + i);
                        return d;
                      });
                      return (
                        <>
                          <div className="grid grid-cols-7 gap-0 mb-2">
                            {weekDays.map(d => (
                              <div key={d.toISOString()} className="p-3 text-center text-sm font-medium text-gray-500 border-b border-gray-200">
                                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-0">
                            {weekDays.map(d => {
                              const dayEvents = getEventsForDate(d);
                              return renderDesktopDay(d, dayEvents);
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
            
            {/* Selected Date Events */}
            <div className={showCalendar ? 'lg:col-span-1' : 'lg:col-span-3'}>
              <div className="bg-gray-50 rounded-lg p-4">
                {!showCalendar && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jump to Date
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(selectedDate)}
                      onChange={handleNativeDateChange}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                {renderSelectedDateEvents()}
              </div>
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
    </div>
  );
});

MaintenanceCalendar.displayName = 'MaintenanceCalendar';

export default MaintenanceCalendar;