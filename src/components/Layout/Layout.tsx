import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import { useDeviceType } from '../../hooks/useTouch';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const deviceType = useDeviceType();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {deviceType === 'desktop' && (
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      )}
      
      {/* Mobile/Tablet Navigation */}
      {(deviceType === 'mobile' || deviceType === 'tablet') && (
        <MobileNavigation isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      )}
      
      <main className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
        deviceType === 'mobile' ? 'pb-16' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;