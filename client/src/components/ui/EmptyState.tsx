import { type ReactNode } from 'react';

export default function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-gray-500 dark:text-slate-400">
      {icon}
      <p className="font-semibold">{title}</p>
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}
