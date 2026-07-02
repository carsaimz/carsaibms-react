import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime, statusLabel } from '../../lib/format';
import { useTranslation } from 'react-i18next';

interface Message {
  id: number;
  user_id: number;
  body: string;
  author_name: string;
  author_role: string;
  created_at: string;
}

interface TicketData {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  messages: Message[];
}

export default function TicketDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [reply, setReply] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get<{ data: TicketData }>(`/customer/tickets/${id}`).then((r) => r.data),
  });

  const sendReply = useMutation({
    mutationFn: (body: string) => api.post(`/customer/tickets/${id}/messages`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setReply('');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    sendReply.mutate(reply.trim());
  }

  if (isLoading) return <Spinner />;
  if (!data) return <p>Ticket não encontrado.</p>;

  return (
    <div className="flex flex-col gap-4">
      <Link to="/tickets" className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:underline dark:text-slate-300">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div>
        <h1 className="text-xl font-bold">{data.subject}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">{data.ticket_number}</p>
        <div className="mt-2 flex gap-2">
          <Badge variant={statusVariant(data.status)}>{statusLabel(data.status)}</Badge>
          <Badge variant={data.priority === 'high' ? 'danger' : 'default'}>{statusLabel(data.priority)}</Badge>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {data.messages.map((msg) => {
          const isCustomer = msg.author_role === 'customer';
          return (
            <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
              <Card className={`max-w-[85%] ${isCustomer ? 'bg-primary-600 text-white' : ''}`}>
                <CardBody className="py-2">
                  <p className={`text-xs font-semibold ${isCustomer ? 'text-primary-100' : 'text-gray-500 dark:text-slate-400'}`}>
                    {msg.author_name}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{msg.body}</p>
                  <p className={`mt-1 text-[10px] ${isCustomer ? 'text-primary-100' : 'text-gray-400'}`}>
                    {formatDateTime(msg.created_at)}
                  </p>
                </CardBody>
              </Card>
            </div>
          );
        })}
      </div>

      {data.status !== 'closed' && (
        <Card>
          <CardHeader><CardTitle>Responder</CardTitle></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <textarea
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                rows={3}
                placeholder="Escreva a sua mensagem..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <Button type="submit" size="sm" icon={<Send className="h-4 w-4" />} loading={sendReply.isPending} className="self-end">
                Enviar
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
