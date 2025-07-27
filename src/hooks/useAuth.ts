import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { AccountInfo, InteractionStatus, SilentRequest, AuthenticationResult } from '@azure/msal-browser';
import { loginRequest, popupRequest, graphConfig } from '../config/authConfig';
import { UserProfile, AuthState, LoginError } from '../types/auth';

export const useAuth = () => {
  const { instance, accounts, inProgress } = useMsal();
  const [isWaitingForAuth, setIsWaitingForAuth] = useState(false);
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

  // Login with new tab (iframe-safe method)
  const loginNewTab = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    setIsWaitingForAuth(true);

    try {
      // Generate auth URL
      const authUrl = await instance.getAuthCodeUrl({
        ...loginRequest,
        redirectUri: window.location.origin + '/auth-callback'
      });

      // Clear any existing auth state
      localStorage.removeItem('msal_auth_result');
      localStorage.removeItem('msal_auth_error');

      // Open auth in new tab
      const authWindow = window.open(
        authUrl,
        'msalAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      if (!authWindow) {
        throw new Error('Failed to open authentication window. Please allow popups and try again.');
      }

      // Poll for auth completion
      const pollForAuth = () => {
        return new Promise<AuthenticationResult>((resolve, reject) => {
          const pollInterval = setInterval(() => {
            try {
              // Check if window is closed
              if (authWindow.closed) {
                clearInterval(pollInterval);
                
                // Check for auth result in localStorage
                const authResult = localStorage.getItem('msal_auth_result');
                const authError = localStorage.getItem('msal_auth_error');
                
                if (authError) {
                  reject(new Error(authError));
                } else if (authResult) {
                  resolve(JSON.parse(authResult));
                } else {
                  reject(new Error('Authentication was cancelled or failed'));
                }
              }
            } catch (error) {
              // Window might be cross-origin, continue polling
            }
          }, 1000);

          // Timeout after 5 minutes
          setTimeout(() => {
            clearInterval(pollInterval);
            if (!authWindow.closed) {
              authWindow.close();
            }
            reject(new Error('Authentication timeout'));
          }, 300000);
        });
      };

      const response = await pollForAuth();
      
      // Clean up localStorage
      localStorage.removeItem('msal_auth_result');
      localStorage.removeItem('msal_auth_error');

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
      console.error('New tab login failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
    } finally {
      setIsWaitingForAuth(false);
    }
  }, [instance, acquireTokenSilently, getUserProfile]);

  // Login with redirect (fallback method)
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

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
        mainWindowRedirectUri: window.location.origin,
      });
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
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

  // Handle redirect result on page load
  useEffect(() => {
    const handleRedirectResult = async () => {
      if (inProgress === InteractionStatus.None) {
        try {
          const response = await instance.handleRedirectPromise();
          
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
              return;
            }
          }

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
          console.error('Error handling redirect result:', error);
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: error.errorMessage || 'Authentication failed',
          });
        }
      }
    };

    handleRedirectResult();
  }, [instance, accounts, inProgress, acquireTokenSilently, getUserProfile]);

  return {
    ...authState,
    loginNewTab,
    loginRedirect,
    logout,
    isWaitingForAuth,
    isInteractionInProgress: inProgress !== InteractionStatus.None,
  };
};