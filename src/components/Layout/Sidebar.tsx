import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Calendar, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Wrench,
  BookOpen,
  Bell
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      path: '/',
      badge: null
    },
    { 
      id: 'assets', 
      label: 'Equipment List', 
      icon: Package, 
      path: '/assets',
      badge: null
    },
    { 
      id: 'maintenance', 
      label: 'Maintenance', 
      icon: Wrench, 
      path: '/maintenance',
      badge: '3'
    },
    { 
      id: 'orders', 
      label: 'Parts Orders', 
      icon: FileText, 
      path: '/orders',
      badge: '2'
    },
    { 
      id: 'documentation', 
      label: 'Documentation', 
      icon: BookOpen, 
      path: '/documentation',
      badge: null
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      path: '/notifications',
      badge: '5'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-screen sticky top-0`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">AcmePump</h2>
              <p className="text-xs text-gray-500">Solutions Portal</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      active 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {isCollapsed && item.badge && (
                <div className="absolute left-8 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;