import { useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast { id: number; message: string; type: ToastType; }

let addToast: ((msg: string, type?: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'info') {
  addToast?.(message, type);
}

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
const COLORS = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-200',
  error:   'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200',
  info:    'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-200',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 md:bottom-4">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div key={t.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium min-w-64 max-w-80 ${COLORS[t.type]}`}>
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}>
              <X className="h-4 w-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
