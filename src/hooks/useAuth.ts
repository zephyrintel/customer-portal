import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { AccountInfo, InteractionStatus, SilentRequest } from '@azure/msal-browser';
import { loginRequest, popupRequest, graphConfig } from '../config/authConfig';
import { UserProfile, AuthState } from '../types/auth';

export const useAuth = () => {
  const { instance, accounts, inProgress } = useMsal();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  // Get user profile from Microsoft Graph
  const getUserProfile = useCallback(async (accessToken: string): Promise<UserProfile | null> => {
    try {
      const response = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      return {
        id: profile.id,
        displayName: profile.displayName,
        givenName: profile.givenName,
        surname: profile.surname,
        userPrincipalName: profile.userPrincipalName,
        mail: profile.mail || profile.userPrincipalName,
        jobTitle: profile.jobTitle,
        department: profile.department,
        companyName: profile.companyName,
        businessPhones: profile.businessPhones,
        mobilePhone: profile.mobilePhone,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Acquire access token silently
  const acquireTokenSilently = useCallback(async (account: AccountInfo) => {
    try {
      const silentRequest: SilentRequest = {
        scopes: ['User.Read'],
        account: account,
      };

      const response = await instance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      return null;
    }
  }, [instance]);

  // Login with redirect (primary method for SPA)
  const loginRedirect = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await instance.loginRedirect(loginRequest);
    } catch (error: any) {
      console.error('Redirect login failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.errorMessage || 'Login failed',
      }));
    }
  }, [instance]);

  // Login with popup (fallback method)
  const loginPopup = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await instance.loginPopup(popupRequest);
      
      if (response && response.account) {
        const accessToken = await acquireTokenSilently(response.account);
        if (accessToken) {
          const userProfile = await getUserProfile(accessToken);
          setAuthState({
            isAuthenticated: true,
            user: userProfile,
            isLoading: false,
            error: null,
          });
        }
      }
    } catch (error: any) {
      console.error('Popup login failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.errorMessage || 'Login failed',
      }));
    }
  }, [instance, acquireTokenSilently, getUserProfile]);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error: any) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  }, [instance]);

  // Handle authentication state on mount and when accounts change
  useEffect(() => {
    const handleAuthState = async () => {
      // Check for development bypass first
      const devBypass = sessionStorage.getItem('dev_bypass_auth');
      const devUser = sessionStorage.getItem('dev_bypass_user');
      
      if (devBypass === 'true' && devUser) {
        try {
          const userProfile = JSON.parse(devUser);
          setAuthState({
            isAuthenticated: true,
            user: userProfile,
            isLoading: false,
            error: null,
          });
          return;
        } catch (error) {
          console.error('Error parsing dev user:', error);
          // Clear invalid dev data and continue with normal auth
          sessionStorage.removeItem('dev_bypass_auth');
          sessionStorage.removeItem('dev_bypass_user');
        }
      }
      
      if (inProgress === InteractionStatus.None) {
        try {
          // Check if user is already logged in
          if (accounts.length > 0) {
            const account = accounts[0];
            const accessToken = await acquireTokenSilently(account);
            if (accessToken) {
              const userProfile = await getUserProfile(accessToken);
              setAuthState({
                isAuthenticated: true,
                user: userProfile,
                isLoading: false,
                error: null,
              });
              return;
            }
          }

          // No authenticated user found
          setAuthState(prev => ({ ...prev, isLoading: false }));
        } catch (error: any) {
          console.error('Error checking auth state:', error);
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: error.errorMessage || 'Authentication failed',
          });
        }
      }
    };

    handleAuthState();
  }, [accounts, inProgress, acquireTokenSilently, getUserProfile]);

  return {
    ...authState,
    loginRedirect,
    loginPopup,
    logout,
    isInteractionInProgress: inProgress !== InteractionStatus.None,
  };
};