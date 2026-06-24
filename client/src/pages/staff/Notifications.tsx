import { useNotifications } from '../../hooks/useNotifications';
import { Bell } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime } from '../../lib/format';

export default function StaffNotifications() {
  const { notifications, unreadCount, markRead } = useNotifications();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Notificações</h1>
        {unreadCount > 0 && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">{unreadCount} não lidas</span>}
      </div>
      {!notifications.length ? (
        <EmptyState icon={<Bell className="h-8 w-8" />} title="Sem notificações" />
      ) : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {notifications.map(n => (
              <button key={n.id} onClick={() => { if (!n.is_read) markRead.mutate(n.id); }}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/40 ${!n.is_read ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}>
                <Bell className={`mt-0.5 h-4 w-4 flex-shrink-0 ${!n.is_read ? 'text-blue-500' : 'text-gray-300'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 dark:text-slate-400">{n.body}</p>}
                  <p className="mt-0.5 text-[10px] text-gray-400">{formatDateTime(n.created_at)}</p>
                </div>
                {!n.is_read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />}
              </button>
            ))}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}
