import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'web' | 'android' | 'ios'

export function isAndroid() { return platform === 'android'; }
export function isIOS()     { return platform === 'ios'; }
export function isWeb()     { return platform === 'web'; }
