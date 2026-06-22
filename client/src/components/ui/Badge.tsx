import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export default function Badge({ variant = 'default', children }: { variant?: BadgeVariant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

/** Map order/payment status strings to badge variants */
export function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'paid':
    case 'delivered':
    case 'confirmed':
    case 'resolved':
    case 'closed':
      return 'success';
    case 'pending':
    case 'processing':
    case 'open':
      return 'warning';
    case 'cancelled':
    case 'refunded':
    case 'failed':
      return 'danger';
    case 'unpaid':
      return 'info';
    default:
      return 'default';
  }
}
