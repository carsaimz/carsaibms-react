import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { isNative } from './native/capacitor';

/**
 * Firebase Web SDK — used when running as a browser PWA.
 * On native (Android/iOS), the equivalent features are provided by the
 * @capacitor-firebase/* plugins instead (see lib/native/firebase-native.ts),
 * which talk to the native Firebase SDKs directly (faster, works offline-first,
 * and shares the same google-services.json already used for Push).
 */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:          import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:              import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:      import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function initFirebase(): boolean {
  if (isNative) return false; // native uses Capacitor plugins instead
  if (!firebaseConfig.apiKey) return false; // not configured
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return true;
  } catch (err) {
    console.error('Firebase init error:', err);
    return false;
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  return app;
}

// ── Messaging (Web Push) ────────────────────────────────────────────────────
export async function requestWebPushToken(vapidKey: string): Promise<string | null> {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    return await getToken(messaging, { vapidKey });
  } catch (err) {
    console.error('Web push token error:', err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return;
  onMessage(messaging, callback);
}
