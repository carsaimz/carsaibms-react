import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${SIZES[size]} rounded-2xl bg-white shadow-2xl dark:bg-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200`}>
        {title && (
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-700">
            <h3 className="font-bold">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
