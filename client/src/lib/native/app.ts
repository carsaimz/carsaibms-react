import { isNative } from './capacitor';

/**
 * App lifecycle — back-button handling, deep links, app state changes.
 */
export async function initAppListeners(onBack?: () => boolean) {
  if (!isNative) return;

  const { App } = await import('@capacitor/app');

  App.addListener('backButton', ({ canGoBack }) => {
    const handled = onBack?.();
    if (handled) return;
    if (canGoBack) window.history.back();
    else App.exitApp();
  });

  App.addListener('appUrlOpen', (data) => {
    // Deep links: carsaibms://orders/123 -> /orders/123
    const slug = data.url.split('://').pop();
    if (slug) window.location.href = '/' + slug;
  });

  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      window.dispatchEvent(new CustomEvent('app-resumed'));
    }
  });
}

export async function hideSplash() {
  if (!isNative) return;
  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide();
}
