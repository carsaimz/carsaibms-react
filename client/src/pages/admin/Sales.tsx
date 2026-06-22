import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney, formatDateTime } from '../../lib/format';

export default function AdminSales() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-sales', page],
    queryFn: () => api.get<{ data: any[]; meta: any }>(`/staff/sales?page=${page}`),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Vendas POS</h1>
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<ShoppingBag className="h-8 w-8" />} title="Sem vendas registadas" />
      ) : (
        <Card><CardBody className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              <th className="px-4 py-3 text-left">Nº Venda</th><th className="px-4 py-3 text-left">Vendedor</th><th className="px-4 py-3 text-left">Método</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-left">Data</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {data.data.map((s:any) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono font-bold text-primary-600">{s.sale_number}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{s.seller_name||'—'}</td>
                  <td className="px-4 py-3 uppercase text-xs font-semibold">{s.payment_method}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatMoney(s.total)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody></Card>
      )}
      {data && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-semibold ${p===page?'bg-primary-600 text-white':'bg-gray-100 dark:bg-slate-800'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
