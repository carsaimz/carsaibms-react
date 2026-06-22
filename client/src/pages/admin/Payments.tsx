import { useQuery } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney, formatDateTime, statusLabel } from '../../lib/format';

export default function AdminPayments() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => api.get<{ data: any[] }>('/admin/payments'),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Pagamentos</h1>
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<CreditCard className="h-8 w-8" />} title="Sem pagamentos registados" />
      ) : (
        <Card><CardBody className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              <th className="px-4 py-3 text-left">Pedido</th><th className="px-4 py-3 text-left">Método</th><th className="px-4 py-3 text-left">Referência</th><th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3 text-left">Data</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {data.data.map((p:any) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-primary-600">{p.order_number}</td>
                  <td className="px-4 py-3 uppercase text-xs font-semibold">{p.method}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.reference||'—'}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatMoney(p.amount)}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(p.status)}>{statusLabel(p.status)}</Badge></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody></Card>
      )}
    </div>
  );
}
