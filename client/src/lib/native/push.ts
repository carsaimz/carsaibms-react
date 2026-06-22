import { isNative } from './capacitor';
import { api } from '../api';

/**
 * Push notifications — registers the device with FCM (via Capacitor)
 * and sends the token to the backend so it can target this device.
 */
export async function initPushNotifications() {
  if (!isNative) return;

  const { PushNotifications } = await import('@capacitor/push-notifications');

  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  if (permStatus.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    try {
      await api.post('/customer/push-token', { token: token.value, platform: 'android' });
    } catch { /* non-critical */ }
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration error:', err);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received:', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const url = action.notification.data?.url;
    if (url) window.location.href = url;
  });
}
