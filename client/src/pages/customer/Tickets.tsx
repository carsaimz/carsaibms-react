import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LifeBuoy, Plus, ChevronRight, X } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime, statusLabel } from '../../lib/format';
import { queueAction } from '../../lib/db';
import { useTranslation } from 'react-i18next';

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  updated_at: string;
  message_count: number;
}

export default function Tickets() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.get<{ data: Ticket[] }>('/customer/tickets'),
  });

  const createTicket = useMutation({
    mutationFn: (payload: { subject: string; message: string; priority: string }) =>
      api.post('/customer/tickets', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setShowForm(false);
      setSubject('');
      setMessage('');
    },
    onError: async (err, payload) => {
      // If offline, queue for later sync
      if (!navigator.onLine) {
        await queueAction('create_ticket', payload);
        setShowForm(false);
        setSubject('');
        setMessage('');
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createTicket.mutate({ subject, message, priority });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Suporte</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Os seus tickets de suporte</p>
        </div>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm((v) => !v)}>
          Novo Ticket
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Novo Ticket</h3>
                <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></button>
              </div>
              <Input label={t('tickets_subject')} value={subject} onChange={(e) => setSubject(e.target.value)} required minLength={3} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Mensagem</label>
                <textarea
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Prioridade</label>
                <select
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              {createTicket.isError && !(createTicket.error instanceof ApiClientError && !navigator.onLine) && (
                <p className="text-sm text-red-500">
                  {createTicket.error instanceof ApiClientError ? createTicket.error.message : 'Erro ao criar ticket.'}
                </p>
              )}
              <Button type="submit" loading={createTicket.isPending}>{t('tickets_send')}</Button>
              {!navigator.onLine && (
                <p className="text-xs text-amber-600">Está offline — o ticket será enviado quando a ligação for restabelecida.</p>
              )}
            </form>
          </CardBody>
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={<LifeBuoy className="h-8 w-8" />} title="Sem tickets de suporte" description="Crie um ticket se precisar de ajuda." />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {data.data.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50"
                >
                  <div>
                    <p className="text-sm font-semibold">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {ticket.ticket_number} · {formatDateTime(ticket.updated_at)}
                    </p>
                    <div className="mt-1 flex gap-1">
                      <Badge variant={statusVariant(ticket.status)}>{statusLabel(ticket.status)}</Badge>
                      <Badge variant={ticket.priority === 'high' ? 'danger' : 'default'}>{statusLabel(ticket.priority)}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
