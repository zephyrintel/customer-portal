import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../Layout/Layout';
import DashboardPage from '../../pages/DashboardPage';
import AssetsPage from '../../pages/AssetsPage';
import MaintenancePageV2 from '../../pages/MaintenancePageV2';
import PartsOrderPage from '../../pages/PartsOrderPage';
import DocumentationPage from '../../pages/DocumentationPage';
import AssetDetail from '../AssetDetail';
import NotificationsPage from '../Notifications/NotificationsPage';
import { useAuth } from '../../hooks/useAuth';

const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="maintenance-v2" element={<MaintenancePageV2 />} />
          <Route path="orders" element={<PartsOrderPage />} />
          <Route path="documentation" element={<DocumentationPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="activity" element={<div className="p-8"><h1 className="text-2xl font-bold">Activity Page</h1><p>Coming soon...</p></div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AuthenticatedApp;