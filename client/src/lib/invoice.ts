import { jsPDF } from 'jspdf';
import { formatMoney, formatDateTime } from './format';

interface InvoiceOrder {
  order_number: string;
  created_at: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  delivery_address: string | null;
  items: Array<{ name: string; quantity: number; unit_price: number; total: number }>;
}

/**
 * Generates and downloads a PDF invoice entirely on the client —
 * no server round-trip needed. Mirrors the layout of the PHP version's
 * TCPDF invoice (A4, grayscale, itemized table + totals).
 */
export function downloadInvoicePdf(order: InvoiceOrder) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // ── Header ────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 17, 17);
  doc.text('FACTURA', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(85, 85, 85);
  doc.text(`Nº ${order.order_number}`, pageWidth - margin, y, { align: 'right' });
  y += 5;
  doc.text(formatDateTime(order.created_at), pageWidth - margin, y, { align: 'right' });

  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  if (order.delivery_address) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(34, 34, 34);
    doc.text('Entregar em:', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(85, 85, 85);
    doc.text(order.delivery_address, margin, y, { maxWidth: pageWidth - margin * 2 });
    y += 10;
  }

  // ── Items table header ───────────────────────────────────────────────
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 51, 51);
  doc.text('Descrição', margin + 2, y + 5.5);
  doc.text('Qtd', pageWidth - margin - 55, y + 5.5, { align: 'right' });
  doc.text('Preço Unit.', pageWidth - margin - 30, y + 5.5, { align: 'right' });
  doc.text('Total', pageWidth - margin - 2, y + 5.5, { align: 'right' });
  y += 8;

  // ── Items ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  for (const item of order.items) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.text(item.name, margin + 2, y + 5.5, { maxWidth: pageWidth - margin * 2 - 60 });
    doc.text(String(item.quantity), pageWidth - margin - 55, y + 5.5, { align: 'right' });
    doc.text(formatMoney(item.unit_price, order.currency), pageWidth - margin - 30, y + 5.5, { align: 'right' });
    doc.text(formatMoney(item.total, order.currency), pageWidth - margin - 2, y + 5.5, { align: 'right' });
    doc.setDrawColor(240, 240, 240);
    doc.line(margin, y + 8, pageWidth - margin, y + 8);
    y += 8;
  }

  y += 4;

  // ── Totals ────────────────────────────────────────────────────────────
  const totalsX = pageWidth - margin - 60;
  doc.setFontSize(9);

  const printRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(bold ? 17 : 85, bold ? 17 : 85, bold ? 17 : 85);
    doc.text(label, totalsX, y);
    doc.text(value, pageWidth - margin - 2, y, { align: 'right' });
    y += 6;
  };

  printRow('Subtotal', formatMoney(order.subtotal, order.currency));
  if (order.discount > 0) printRow('Desconto', `- ${formatMoney(order.discount, order.currency)}`);
  if (order.tax > 0) printRow('IVA', formatMoney(order.tax, order.currency));
  if (order.shipping > 0) printRow('Envio', formatMoney(order.shipping, order.currency));

  doc.setDrawColor(180, 180, 180);
  doc.line(totalsX, y - 2, pageWidth - margin, y - 2);
  printRow('TOTAL', formatMoney(order.total, order.currency), true);

  // ── Footer ────────────────────────────────────────────────────────────
  const footY = doc.internal.pageSize.getHeight() - 18;
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, footY, pageWidth - margin, footY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Carsai BMS — Documento gerado electronicamente', pageWidth / 2, footY + 5, { align: 'center' });
  doc.text(`Gerado em ${formatDateTime(new Date().toISOString())}`, pageWidth / 2, footY + 9, { align: 'center' });

  doc.save(`factura-${order.order_number}.pdf`);
}
