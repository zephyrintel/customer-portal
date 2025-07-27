import React, { useState } from 'react';
import { User, Mail, Building, Phone, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const UserProfile: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {getInitials(user.displayName)}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
            {user.displayName}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-[150px]">
            {user.mail}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
          showDropdown ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
                  {getInitials(user.displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {user.mail}
                  </p>
                  {user.jobTitle && (
                    <p className="text-xs text-gray-400 truncate">
                      {user.jobTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-xs">Email</p>
                  <p className="text-gray-900 truncate">{user.mail}</p>
                </div>
              </div>

              {user.department && (
                <div className="flex items-center space-x-3 text-sm">
                  <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-600 text-xs">Department</p>
                    <p className="text-gray-900 truncate">{user.department}</p>
                  </div>
                </div>
              )}

              {user.businessPhones && user.businessPhones.length > 0 && (
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-600 text-xs">Phone</p>
                    <p className="text-gray-900 truncate">{user.businessPhones[0]}</p>
                  </div>
                </div>
              )}

              {user.companyName && (
                <div className="flex items-center space-x-3 text-sm">
                  <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-600 text-xs">Company</p>
                    <p className="text-gray-900 truncate">{user.companyName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // TODO: Add settings navigation
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 min-h-[40px]"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Account Settings</span>
              </button>
              
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;