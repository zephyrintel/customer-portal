import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import AssetDetail from './components/AssetDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="maintenance" element={<div className="p-8"><h1 className="text-2xl font-bold">Maintenance Page</h1><p>Coming soon...</p></div>} />
          <Route path="orders" element={<div className="p-8"><h1 className="text-2xl font-bold">Parts Orders Page</h1><p>Coming soon...</p></div>} />
          <Route path="documentation" element={<div className="p-8"><h1 className="text-2xl font-bold">Documentation Page</h1><p>Coming soon...</p></div>} />
          <Route path="notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications Page</h1><p>Coming soon...</p></div>} />
          <Route path="activity" element={<div className="p-8"><h1 className="text-2xl font-bold">Activity Page</h1><p>Coming soon...</p></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;