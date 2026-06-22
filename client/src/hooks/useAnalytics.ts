import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logScreenView } from '../lib/native/firebase-native';

/** Logs a Firebase Analytics screen_view event on every route change (native only — no-op on web). */
export function useAnalytics() {
  const location = useLocation();
  useEffect(() => {
    logScreenView(location.pathname);
  }, [location.pathname]);
}
