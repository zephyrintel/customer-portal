import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Wrench,
  FileText, 
  BookOpen,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useDeviceType } from '../../hooks/useTouch';
import UserProfile from '../Auth/UserProfile';

interface MobileNavigationProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const deviceType = useDeviceType();
  const [showOverlay, setShowOverlay] = useState(false);

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
      label: 'Equipment', 
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
      label: 'Orders', 
      icon: FileText, 
      path: '/orders',
      badge: '2'
    },
    { 
      id: 'documentation', 
      label: 'Docs', 
      icon: BookOpen, 
      path: '/documentation',
      badge: null
    },
    { 
      id: 'notifications', 
      label: 'Alerts', 
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

  const handleNavClick = () => {
    setShowOverlay(false);
    onToggle();
  };

  const handleOverlayToggle = () => {
    setShowOverlay(!showOverlay);
  };

  // Mobile bottom tab bar for phones
  if (deviceType === 'mobile') {
    return (
      <>
        {/* Bottom Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
          <div className="grid grid-cols-5 h-16">
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex flex-col items-center justify-center space-y-1 relative min-h-[44px] ${
                    active
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium truncate max-w-full">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Floating Action Button for More Options */}
        {navigationItems.length > 5 && (
          <button
            onClick={handleOverlayToggle}
            className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center min-h-[44px] min-w-[44px]"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Overlay Menu */}
        {showOverlay && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={handleOverlayToggle}>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-6 safe-area-pb">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">More Options</h3>
                <button
                  onClick={handleOverlayToggle}
                  className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {navigationItems.slice(5).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={handleOverlayToggle}
                      className={`flex items-center space-x-3 p-3 rounded-lg min-h-[44px] ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Tablet hamburger menu
  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={handleOverlayToggle}
        className="fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg border border-gray-200 min-h-[44px] min-w-[44px] md:hidden"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Slide-out Menu */}
      {showOverlay && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" 
            onClick={handleOverlayToggle}
          />
          <div className="fixed top-0 left-0 z-50 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 md:hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Zephyr Intelligence</h2>
                    <p className="text-xs text-gray-500">Asset Management</p>
                  </div>
                </div>
                <button
                  onClick={handleOverlayToggle}
                  className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={handleOverlayToggle}
                      className={`flex items-center space-x-3 p-3 rounded-lg min-h-[44px] transition-colors duration-200 ${
                        active
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <UserProfile />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileNavigation;