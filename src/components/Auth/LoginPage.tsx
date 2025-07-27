import React from 'react';
import { Shield, Loader2, AlertCircle, Building2, Users, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { loginPopup, isLoading, error, isInteractionInProgress } = useAuth();

  const handleLogin = async () => {
    try {
      await loginPopup();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const isLoginDisabled = isLoading || isInteractionInProgress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Zephyr Intelligence
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Industrial Asset Management Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm">
              Sign in to access your equipment management dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Authentication Error
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Microsoft Sign In Button */}
          <button
            onClick={handleLogin}
            disabled={isLoginDisabled}
            className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[56px]"
          >
            {isLoginDisabled ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-3" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#00BCF2"
                    d="M0 0h11.377v11.372H0z"
                  />
                  <path
                    fill="#0078D4"
                    d="M12.623 0H24v11.372H12.623z"
                  />
                  <path
                    fill="#00BCF2"
                    d="M0 12.623h11.377V24H0z"
                  />
                  <path
                    fill="#40E0D0"
                    d="M12.623 12.623H24V24H12.623z"
                  />
                </svg>
                <span>Sign in with Microsoft</span>
              </>
            )}
          </button>

          {/* Features */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">
              Platform Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
                <span>Equipment & Asset Management</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 text-indigo-600 mr-3 flex-shrink-0" />
                <span>Maintenance Scheduling</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Lock className="h-4 w-4 text-purple-600 mr-3 flex-shrink-0" />
                <span>Secure Enterprise SSO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Privacy Policy
            </a>
          </p>
          <p className="mt-2">
            © 2024 Zephyr Intelligence. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;