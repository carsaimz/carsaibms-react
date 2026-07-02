import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LifeBuoy, Send } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime, statusLabel } from '../../lib/format';
import { useTranslation } from 'react-i18next';

export default function StaffTickets() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['staff-tickets'],
    queryFn: () => api.get<{ data: any[] }>('/admin/tickets?status=open'),
  });

  const { data: detail } = useQuery({
    queryKey: ['staff-ticket-detail', selected?.id],
    queryFn: () => selected ? api.get<{ data: any }>(`/customer/tickets/${selected.id}`).then((r) => r.data) : null,
    enabled: !!selected,
  });

  const sendReply = useMutation({
    mutationFn: () => api.post(`/admin/tickets/${selected?.id}/messages`, { body: reply }),
    onSuccess: () => { setReply(''); qc.invalidateQueries({ queryKey: ['staff-ticket-detail', selected?.id] }); },
  });

  const changeStatus = useMutation({
    mutationFn: (status: string) => api.put(`/admin/tickets/${selected?.id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff-tickets'] }); },
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* List */}
      <div className="flex w-72 flex-shrink-0 flex-col gap-2 overflow-y-auto">
        <h1 className="text-lg font-bold">Tickets Abertos</h1>
        {isLoading ? <Spinner /> : !data?.data.length ? (
          <EmptyState icon={<LifeBuoy className="h-8 w-8" />} title="Sem tickets abertos" />
        ) : data.data.map((t: any) => (
          <Card key={t.id}
            className={`cursor-pointer transition-all hover:border-primary-300 ${selected?.id === t.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}`}
            onClick={() => setSelected(t)}>
            <CardBody className="py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold line-clamp-1">{t.subject}</p>
                <Badge variant={t.priority === 'high' ? 'danger' : 'warning'}>{t.priority === 'high' ? 'Alta' : 'Média'}</Badge>
              </div>
              <p className="mt-1 text-xs text-gray-400">{t.cust_name}</p>
              <p className="text-xs text-gray-400">{formatDateTime(t.updated_at)}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Thread */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Seleccione um ticket</div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-700">
              <div>
                <p className="font-bold">{selected.subject}</p>
                <p className="text-xs text-gray-400">{selected.cust_name} · {selected.ticket_number}</p>
              </div>
              <div className="flex gap-1.5">
                {['open','pending','resolved','closed'].map((s) => (
                  <button key={s} onClick={() => changeStatus.mutate(s)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${detail?.status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {statusLabel(s)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {detail?.messages?.map((m: any) => {
                const isStaff = ['admin','manager','staff','seller'].includes(m.author_role);
                return (
                  <div key={m.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isStaff ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-700'}`}>
                      <p className={`text-xs font-semibold mb-1 ${isStaff ? 'text-primary-100' : 'text-gray-500 dark:text-slate-400'}`}>{m.author_name}</p>
                      <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                      <p className={`text-[10px] mt-1 ${isStaff ? 'text-primary-200' : 'text-gray-400'}`}>{formatDateTime(m.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {detail?.status !== 'closed' && (
              <form onSubmit={(e) => { e.preventDefault(); sendReply.mutate(); }}
                className="flex gap-2 border-t border-gray-100 p-3 dark:border-slate-700">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2}
                  placeholder="Escrever resposta..."
                  className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" />
                <Button type="submit" size="sm" icon={<Send className="h-4 w-4" />} loading={sendReply.isPending} className="self-end">
                  Enviar
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
