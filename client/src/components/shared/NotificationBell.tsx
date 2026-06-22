import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDateTime } from '../../lib/format';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-slate-700">
              <span className="text-sm font-bold">Notificações</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  {unreadCount} novas
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">Sem notificações</p>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) markRead.mutate(n.id);
                      setOpen(false);
                    }}
                    className={`flex w-full flex-col gap-0.5 border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/60 ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && (
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                      )}
                      <div className={!n.is_read ? '' : 'pl-4'}>
                        <p className="text-sm font-semibold leading-snug">{n.title}</p>
                        {n.body && (
                          <p className="text-xs text-gray-500 dark:text-slate-400">{n.body}</p>
                        )}
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {formatDateTime(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
