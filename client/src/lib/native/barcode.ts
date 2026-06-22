import { isNative } from './capacitor';

/**
 * Barcode scanner — uses native camera (ML Kit) on Android/iOS via Capacitor,
 * falls back to manual SKU/barcode text entry on web.
 */
export async function scanBarcode(): Promise<string | null> {
  if (!isNative) {
    // Web fallback: prompt for manual entry (camera-based web scanning
    // would require getUserMedia + a JS barcode lib, out of scope for now)
    return window.prompt('Código de barras / SKU:');
  }

  try {
    const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');

    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera !== 'granted') {
      const result = await BarcodeScanner.requestPermissions();
      if (result.camera !== 'granted') return null;
    }

    const { barcodes } = await BarcodeScanner.scan();
    return barcodes[0]?.rawValue ?? null;
  } catch (err) {
    console.error('Barcode scan error:', err);
    return null;
  }
}

export async function isBarcodeScanningSupported(): Promise<boolean> {
  if (!isNative) return false;
  try {
    const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
    const { supported } = await BarcodeScanner.isSupported();
    return supported;
  } catch {
    return false;
  }
}
