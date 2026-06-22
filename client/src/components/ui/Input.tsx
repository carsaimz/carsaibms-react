import { type InputHTMLAttributes, type LabelHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors
            ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-primary-500 dark:border-slate-600'}
            bg-white dark:bg-slate-900 dark:text-slate-100 ${className}`}
          {...rest}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export function Label({ className = '', ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`text-sm font-medium text-gray-700 dark:text-slate-300 ${className}`} {...rest} />;
}
