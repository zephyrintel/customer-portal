import React, { useState, useEffect } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance, msalInstanceId } from './config/msalInstance';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/Auth/LoginPage';
import AuthenticatedApp from './components/Auth/AuthenticatedApp';


// App content component that uses auth hook
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Zephyr Intelligence</h2>
          <p className="text-gray-600">Initializing your workspace...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedApp /> : <LoginPage />;
};

function App() {
  useEffect(() => {
    console.info('[App] Mount MsalProvider', { msalInstanceId });
    return () => {
      console.info('[App] Unmount MsalProvider', { msalInstanceId });
    };
  }, []);
  return (
    <MsalProvider instance={msalInstance}>
      <AppContent />
    </MsalProvider>
  );
}

export default App;