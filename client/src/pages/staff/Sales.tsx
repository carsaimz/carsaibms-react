import { useQuery } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney, formatDateTime } from '../../lib/format';
import { useTranslation } from 'react-i18next';

export default function StaffSales() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['staff-sales'],
    queryFn: () => api.get<{ data: any[] }>('/staff/sales?per_page=50'),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">As Minhas Vendas</h1>
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<ShoppingBag className="h-8 w-8" />} title="Sem vendas" description="As suas vendas POS aparecerão aqui." />
      ) : (
        <Card><CardBody className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left">Nº Venda</th><th className="px-4 py-3 text-left">Método</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-left">Data</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {data.data.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono font-bold text-primary-600">{s.sale_number}</td>
                  <td className="px-4 py-3 uppercase text-xs font-semibold">{s.payment_method}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatMoney(s.total)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody></Card>
      )}
    </div>
  );
}
