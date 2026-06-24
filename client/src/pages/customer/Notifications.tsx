import { useNotifications } from '../../hooks/useNotifications';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardBody } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime } from '../../lib/format';
import Button from '../../components/ui/Button';

export default function CustomerNotifications() {
  const { notifications, unreadCount, markRead } = useNotifications();
  const qc = useQueryClient();

  async function markAllRead() {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => api.post(`/customer/notifications/${n.id}/read`)));
    qc.invalidateQueries({ queryKey: ['notifications'] });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Notificações</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" icon={<CheckCheck className="h-4 w-4" />} onClick={markAllRead}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {!notifications.length ? (
        <EmptyState icon={<Bell className="h-8 w-8" />} title="Sem notificações" description="As suas notificações aparecerão aqui." />
      ) : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {notifications.map(n => (
              <button key={n.id} onClick={() => { if (!n.is_read) markRead.mutate(n.id); }}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/40 ${!n.is_read ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}>
                <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!n.is_read ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}
