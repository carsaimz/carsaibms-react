import { isNative } from './capacitor';

/**
 * Firebase — native bridge (Android/iOS via @capacitor-firebase/*).
 * Each function below is a no-op on web (use lib/firebase.ts there instead).
 * All plugins share the same google-services.json already configured for
 * Push Notifications — no extra setup needed beyond what's in MOBILE.md.
 */

// ── Authentication (Google / Apple / Phone sign-in) ─────────────────────────
export async function signInWithGoogleNative() {
  if (!isNative) return null;
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  const result = await FirebaseAuthentication.signInWithGoogle();
  return result.user;
}

export async function signOutNative() {
  if (!isNative) return;
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  await FirebaseAuthentication.signOut();
}

// ── Analytics — track screens & custom events ───────────────────────────────
export async function logScreenView(screenName: string) {
  if (!isNative) return;
  try {
    const { FirebaseAnalytics } = await import('@capacitor-firebase/analytics');
    await FirebaseAnalytics.setCurrentScreen({ screenName });
  } catch { /* analytics is non-critical */ }
}

export async function logEvent(name: string, params?: Record<string, unknown>) {
  if (!isNative) return;
  try {
    const { FirebaseAnalytics } = await import('@capacitor-firebase/analytics');
    await FirebaseAnalytics.logEvent({ name, params });
  } catch { /* non-critical */ }
}

export async function setAnalyticsUserId(userId: string | null) {
  if (!isNative) return;
  try {
    const { FirebaseAnalytics } = await import('@capacitor-firebase/analytics');
    await FirebaseAnalytics.setUserId({ userId: userId ?? '' });
  } catch { /* non-critical */ }
}

// ── Crashlytics — error reporting ───────────────────────────────────────────
export async function recordError(message: string, extra?: Record<string, string>) {
  if (!isNative) { console.error(message, extra); return; }
  try {
    const { FirebaseCrashlytics } = await import('@capacitor-firebase/crashlytics');
    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        await FirebaseCrashlytics.setCustomKey({ key, value, type: 'string' });
      }
    }
    await FirebaseCrashlytics.recordException({ message });
  } catch { /* non-critical */ }
}

export async function crashlyticsSetUser(userId: string) {
  if (!isNative) return;
  try {
    const { FirebaseCrashlytics } = await import('@capacitor-firebase/crashlytics');
    await FirebaseCrashlytics.setUserId({ userId });
  } catch { /* non-critical */ }
}

// ── Remote Config — feature flags & app config without redeploying ─────────
const REMOTE_CONFIG_DEFAULTS = {
  maintenance_mode: false,
  min_app_version: '1.0.0',
  pos_offline_sync_interval_seconds: 30,
  enable_barcode_scan: true,
};

export async function fetchRemoteConfig(): Promise<typeof REMOTE_CONFIG_DEFAULTS> {
  if (!isNative) return REMOTE_CONFIG_DEFAULTS;
  try {
    const { FirebaseRemoteConfig } = await import('@capacitor-firebase/remote-config');
    await FirebaseRemoteConfig.setSettings({ minimumFetchIntervalInSeconds: 3600 });
    await FirebaseRemoteConfig.fetchAndActivate();

    const [maintenance, minVersion, syncInterval, barcodeEnabled] = await Promise.all([
      FirebaseRemoteConfig.getBoolean({ key: 'maintenance_mode' }),
      FirebaseRemoteConfig.getString({ key: 'min_app_version' }),
      FirebaseRemoteConfig.getNumber({ key: 'pos_offline_sync_interval_seconds' }),
      FirebaseRemoteConfig.getBoolean({ key: 'enable_barcode_scan' }),
    ]);

    return {
      maintenance_mode: maintenance.value,
      min_app_version: minVersion.value || REMOTE_CONFIG_DEFAULTS.min_app_version,
      pos_offline_sync_interval_seconds: syncInterval.value || REMOTE_CONFIG_DEFAULTS.pos_offline_sync_interval_seconds,
      enable_barcode_scan: barcodeEnabled.value,
    };
  } catch {
    return REMOTE_CONFIG_DEFAULTS;
  }
}

// ── Firestore — optional realtime layer (e.g. live "agent is typing" on tickets) ──
export async function listenToTicketTyping(ticketId: number, callback: (isTyping: boolean) => void) {
  if (!isNative) return () => {};
  try {
    const { FirebaseFirestore } = await import('@capacitor-firebase/firestore');
    const { callbackId } = await FirebaseFirestore.addDocumentSnapshotListener(
      { reference: `ticket_typing/${ticketId}` },
      (event) => {
        callback(!!event?.snapshot?.data?.typing);
      }
    );
    return async () => {
      const { FirebaseFirestore } = await import('@capacitor-firebase/firestore');
      await FirebaseFirestore.removeSnapshotListener({ callbackId });
    };
  } catch {
    return () => {};
  }
}

export async function setTicketTyping(ticketId: number, typing: boolean) {
  if (!isNative) return;
  try {
    const { FirebaseFirestore } = await import('@capacitor-firebase/firestore');
    await FirebaseFirestore.setDocument({
      reference: `ticket_typing/${ticketId}`,
      data: { typing, updated_at: Date.now() },
    });
  } catch { /* non-critical */ }
}
