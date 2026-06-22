import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import ToastContainer from './components/ui/Toast';
import './index.css';

import { isNative } from './lib/native/capacitor';
import { initAppListeners, hideSplash } from './lib/native/app';
import { initPushNotifications } from './lib/native/push';
import { initFirebase } from './lib/firebase';
import { recordError, fetchRemoteConfig } from './lib/native/firebase-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

// ── Native / PWA bootstrap ──────────────────────────────────────────────────
(async () => {
  if (isNative) {
    // Running inside the Capacitor Android (or future iOS) shell
    await initAppListeners();
    await initPushNotifications();
    await hideSplash();

    // Remote Config — fetch feature flags without redeploying the app
    const config = await fetchRemoteConfig();
    if (config.maintenance_mode) {
      window.location.href = '/maintenance';
    }
    (window as any).__remoteConfig = config;
  } else {
    // Running as a regular web PWA — use Firebase Web Push if configured
    initFirebase();
  }

  // Crashlytics / console fallback for uncaught errors (native + web)
  window.addEventListener('error', (e) => {
    recordError(e.message, { source: e.filename || 'unknown', line: String(e.lineno || 0) });
  });
  window.addEventListener('unhandledrejection', (e) => {
    recordError(String(e.reason), { type: 'unhandledrejection' });
  });
})();
