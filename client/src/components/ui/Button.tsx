import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

const variants: Record<string, string> = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800',
  danger:    'bg-red-600 text-white hover:bg-red-700',
  success:   'bg-green-600 text-white hover:bg-green-700',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
