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

export function statusLabel(status: string): string {
  return statusLabels[status] || status;
}
