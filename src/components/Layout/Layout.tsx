import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <main className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'ml-0' : 'ml-0'
      }`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;