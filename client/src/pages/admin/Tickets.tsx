import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LifeBuoy } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime, statusLabel } from '../../lib/format';

const STATUS_OPTS = ['open','pending','resolved','closed'];

export default function AdminTickets() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', status, page],
    queryFn: () => api.get<{ data: any[]; meta: any }>(
      `/admin/tickets?page=${page}&status=${status}`
    ),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, s }: { id: number; s: string }) =>
      api.put(`/admin/tickets/${id}/status`, { status: s }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tickets'] }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Tickets de Suporte</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">{data?.meta.total ?? 0} tickets no total</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[{ value: '', label: 'Todos' }, ...STATUS_OPTS.map((s) => ({ value: s, label: statusLabel(s) }))].map((f) => (
          <button key={f.value} onClick={() => { setStatus(f.value); setPage(1); }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status === f.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : (data?.data.length === 0 ? (
        <EmptyState icon={<LifeBuoy className="h-8 w-8" />} title="Sem tickets" />
      ) : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {data?.data.map((t: any) => (
              <div key={t.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-400">{t.ticket_number}</span>
                    <Badge variant={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'default'}>
                      {statusLabel(t.priority)}
                    </Badge>
                  </div>
                  <p className="font-semibold mt-0.5">{t.subject}</p>
                  <p className="text-xs text-gray-400">{t.cust_name} · {t.msg_count} mensagens · {formatDateTime(t.updated_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {STATUS_OPTS.map((s) => (
                    <button key={s} onClick={() => changeStatus.mutate({ id: t.id, s })}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all ${
                        t.status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'
                      }`}>{statusLabel(s)}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardBody></Card>
      ))}

      {data && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-semibold ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-800'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
