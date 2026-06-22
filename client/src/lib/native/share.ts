import { isNative } from './capacitor';

export async function shareInvoice(orderNumber: string, pdfDataUri: string) {
  if (!isNative) {
    // Web: trigger download (handled by jsPDF's .save() already)
    return;
  }
  const { Share } = await import('@capacitor/share');
  await Share.share({
    title: `Factura ${orderNumber}`,
    text: `Factura do pedido ${orderNumber} — Carsai BMS`,
    url: pdfDataUri,
    dialogTitle: 'Partilhar Factura',
  });
}

export async function shareText(title: string, text: string, url?: string) {
  if (!isNative) {
    if (navigator.share) {
      await navigator.share({ title, text, url });
    }
    return;
  }
  const { Share } = await import('@capacitor/share');
  await Share.share({ title, text, url });
}
