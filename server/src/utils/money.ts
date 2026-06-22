/** Convert a decimal amount (e.g. 149.99) to integer cents (14999) */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Convert integer cents (14999) to a decimal amount (149.99) */
export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

/** Format cents as a currency string, e.g. 14999 -> "MT 149.99" */
export function formatMoney(cents: number, currency = process.env.CURRENCY_SYMBOL || 'MT'): string {
  const value = fromCents(cents);
  return `${currency} ${value.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
