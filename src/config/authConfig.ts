import { Configuration, PopupRequest, RedirectRequest } from '@azure/msal-browser';

// Detect environment
const isProduction = window.location.hostname === 'early-access.zephyrintel.com';
// const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Dynamic redirect URI based on environment
const getRedirectUri = (): string => {
  if (isProduction) {
    return 'https://early-access.zephyrintel.com';
  }
  return window.location.origin;
};

// MSAL Configuration for SPA
export const msalConfig: Configuration = {
  auth: {
    clientId: '83cc70c2-c49b-4811-afa4-ebcbd8ddfc75',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getRedirectUri(),
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // LogLevel.Error
            console.error(message);
            return;
          case 1: // LogLevel.Warning
            console.warn(message);
            return;
          case 2: // LogLevel.Info
            console.info(message);
            return;
          case 3: // LogLevel.Verbose
            console.debug(message);
            return;
        }
      },
    }
  }
};

// Add scopes for login request with fragment response mode
export const loginRequest: RedirectRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  prompt: 'select_account',
  responseMode: 'fragment'
};

// Popup login request
export const popupRequest: PopupRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  prompt: 'select_account',
};

// Graph API endpoint to get user profile
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};