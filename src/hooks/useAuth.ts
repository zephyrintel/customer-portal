import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { AccountInfo, InteractionStatus, SilentRequest } from '@azure/msal-browser';
import { loginRequest, popupRequest, graphConfig } from '../config/authConfig';
import { UserProfile, AuthState } from '../types/auth';

// Utility functions for environment detection
const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // If we can't access window.top, assume we're in an iframe
  }
};

const canUsePopups = (): boolean => {
  // Non-intrusive heuristic: do NOT open a real window here.
  // We'll handle actual popup-blocker errors when attempting popup login.
  try {
    // Disallow popups in iframes and standalone app modes
    if (isInIframe()) return false;
    const isIosStandalone = (navigator as any)?.standalone === true;
    const isDisplayModeStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches === true;
    if (isIosStandalone || isDisplayModeStandalone) return false;
    return true;
  } catch {
    // If detection fails, assume popups are allowed and handle errors at call-time
    return true;
  }
};

export const useAuth = () => {
  const { instance, accounts, inProgress } = useMsal();
  useEffect(() => {
    // Basic diagnostics for auth state transitions
    // Note: avoid logging sensitive tokens
    const info = {
      accounts: accounts?.length ?? 0,
      inProgress,
      clientId: (instance as any)?.config?.auth?.clientId,
      msalInstanceId: (globalThis as any).__ZEPHYR_MSAL_INSTANCE_ID__,
    };
    console.info('[Auth] useAuth state', info);
  }, [accounts, inProgress, instance]);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });
  const [environmentInfo, setEnvironmentInfo] = useState({
    isIframe: false,
    canUsePopups: false,
    checked: false,
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
    // Check if we're in an iframe
    if (environmentInfo.isIframe) {
      setAuthState(prev => ({
        ...prev,
        error: 'Redirect login is not supported in iframe. Please open this application in a new tab or use popup login if available.',
      }));
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await instance.loginRedirect(loginRequest);
    } catch (error: any) {
      console.error('Redirect login failed:', error);
      let errorMessage = 'Login failed';
      
      if (error.errorCode === 'redirect_in_iframe') {
        errorMessage = 'This application cannot use redirect login when embedded. Please open in a new tab or try popup login.';
      } else {
        errorMessage = error.errorMessage || 'Login failed';
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [instance, environmentInfo.isIframe]);

  // Login with popup (fallback method)
  const loginPopup = useCallback(async (): Promise<void> => {
    // Check if popups are blocked
    if (!environmentInfo.canUsePopups) {
      setAuthState(prev => ({
        ...prev,
        error: 'Popup login is blocked by your browser. Please disable popup blockers for this site or open the application in a new tab.',
      }));
      return;
    }

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
      let errorMessage = 'Popup login failed';
      
      if (error.errorCode === 'popup_window_error' || error.errorCode === 'empty_window_error') {
        errorMessage = 'Popup was blocked by your browser. Please disable popup blockers for this site and try again.';
      } else {
        errorMessage = error.errorMessage || 'Popup login failed';
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [instance, acquireTokenSilently, getUserProfile, environmentInfo.canUsePopups]);

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

  // Log major login flows
  useEffect(() => {
    console.info('[Auth] Hook mounted', {
      msalInstanceId: (globalThis as any).__ZEPHYR_MSAL_INSTANCE_ID__,
      clientId: (instance as any)?.config?.auth?.clientId,
    });
    return () => console.info('[Auth] Hook unmounted');
  }, [instance]);

  // Handle authentication state on mount and when accounts change
  useEffect(() => {
    // Check environment capabilities
    if (!environmentInfo.checked) {
      setEnvironmentInfo({
        isIframe: isInIframe(),
        canUsePopups: canUsePopups(),
        checked: true,
      });
      return;
    }

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

    if (environmentInfo.checked) {
      handleAuthState();
    }
  }, [accounts, inProgress, acquireTokenSilently, getUserProfile, environmentInfo.checked]);

  return {
    ...authState,
    loginRedirect,
    loginPopup,
    logout,
    isInteractionInProgress: inProgress !== InteractionStatus.None,
    environmentInfo,
  };
};