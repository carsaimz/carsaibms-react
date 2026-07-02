const currencySymbols: Record<string, string> = {
  MZN: 'MT',
  USD: '$',
  EUR: '€',
};

/** Format a decimal amount with currency symbol, e.g. 149.9 -> "MT 149.90" */
export function formatMoney(amount: number, currency = 'MZN'): string {
  const symbol = currencySymbols[currency] || currency;
  return `${symbol} ${amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  processing: 'Em processamento',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  unpaid: 'Não pago',
  paid: 'Pago',
  failed: 'Falhou',
  open: 'Aberto',
  resolved: 'Resolvido',
  closed: 'Fechado',
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};


/**
 * Translate a status string.
 * Falls back to i18next if available, otherwise uses the static map.
 */
export function statusLabel(status: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const i18n = require('i18next').default;
    const key = `status_${status}`;
    const translated = i18n.t(key);
    if (translated !== key) return translated;
  } catch { /* i18n not yet initialised — use fallback */ }
  return statusLabels[status] || status;
}

