import { useQuery } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney, formatDateTime, statusLabel } from '../../lib/format';

export default function CustomerPayments() {
  const { data, isLoading } = useQuery({
    queryKey: ['customer-payments'],
    queryFn: () => api.get<{ data: any[] }>('/customer/payments'),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Os Meus Pagamentos</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Histórico de todos os seus pagamentos</p>
      </div>
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<CreditCard className="h-8 w-8" />} title="Sem pagamentos" description="Os seus pagamentos aparecerão aqui." />
      ) : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {data.data.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{p.order_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.method?.toUpperCase()} · {formatDateTime(p.created_at)}</p>
                  {p.reference && <p className="text-xs font-mono text-gray-400">{p.reference}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold">{formatMoney(p.amount)}</span>
                  <Badge variant={statusVariant(p.status)}>{statusLabel(p.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}
