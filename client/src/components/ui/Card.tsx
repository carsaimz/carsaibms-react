import { type HTMLAttributes } from 'react';

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
      {...rest}
    />
  );
}

export function CardHeader({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`border-b border-gray-100 px-4 py-3 dark:border-slate-700 ${className}`} {...rest} />;
}

export function CardBody({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 ${className}`} {...rest} />;
}

export function CardTitle({ className = '', ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-sm font-bold text-gray-700 dark:text-slate-200 ${className}`} {...rest} />;
}
