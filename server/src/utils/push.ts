import { query } from '../db/connection.js';

/**
 * Server-side push notification sender via Firebase Admin SDK.
 * Sends to all of a user's registered devices (multi-device support).
 *
 * Setup: place your Firebase service account JSON as FIREBASE_SERVICE_ACCOUNT
 * (base64-encoded) in the server .env, or mount the file and set
 * FIREBASE_SERVICE_ACCOUNT_PATH instead.
 */
let messaging: any = null;

async function getMessaging() {
  if (messaging) return messaging;
  try {
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      const b64 = process.env.FIREBASE_SERVICE_ACCOUNT;
      const credential = b64
        ? admin.credential.cert(JSON.parse(Buffer.from(b64, 'base64').toString('utf-8')))
        : admin.credential.applicationDefault();
      admin.initializeApp({ credential });
    }
    messaging = admin.messaging();
    return messaging;
  } catch (err) {
    console.error('[push] Firebase Admin not configured:', (err as Error).message);
    return null;
  }
}

export async function sendPushToUser(userId: number, title: string, body: string, url?: string) {
  const m = await getMessaging();
  if (!m) return; // Firebase not configured — silently skip (notifications still work in-app)

  const tokens = await query<{ token: string }>('SELECT token FROM push_tokens WHERE user_id=?', [userId]);
  if (!tokens.length) return;

  try {
    await m.sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: { title, body },
      data: url ? { url } : {},
      android: { priority: 'high' as const },
    });
  } catch (err) {
    console.error('[push] Send error:', err);
  }
}

export async function sendPushToAll(title: string, body: string, url?: string) {
  const m = await getMessaging();
  if (!m) return;
  const tokens = await query<{ token: string }>('SELECT token FROM push_tokens');
  if (!tokens.length) return;
  try {
    await m.sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: { title, body },
      data: url ? { url } : {},
    });
  } catch (err) {
    console.error('[push] Send error:', err);
  }
}
