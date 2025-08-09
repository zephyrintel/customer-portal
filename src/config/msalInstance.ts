import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './authConfig';

// Ensure a single MSAL instance across HMR/StrictMode by caching on globalThis
const globalKey = '__ZEPHYR_MSAL_INSTANCE__';
const idKey = '__ZEPHYR_MSAL_INSTANCE_ID__';

declare global {
  // eslint-disable-next-line no-var
  var __ZEPHYR_MSAL_INSTANCE__: PublicClientApplication | undefined;
  // eslint-disable-next-line no-var
  var __ZEPHYR_MSAL_INSTANCE_ID__: string | undefined;
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const msalInstance: PublicClientApplication = (() => {
  const existing = (globalThis as any)[globalKey] as PublicClientApplication | undefined;
  if (existing) {
    if (!(globalThis as any)[idKey]) {
      (globalThis as any)[idKey] = newId();
    }
    console.info('[MSAL] Reusing singleton instance', { id: (globalThis as any)[idKey] });
    return existing;
  }
  const created = new PublicClientApplication(msalConfig);
  (globalThis as any)[globalKey] = created;
  (globalThis as any)[idKey] = newId();
  console.info('[MSAL] Creating singleton instance', { id: (globalThis as any)[idKey] });
  return created;
})();

export const msalInstanceId: string = (globalThis as any)[idKey];

