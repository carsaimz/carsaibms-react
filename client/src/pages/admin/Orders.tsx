import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, ShoppingCart } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney, formatDateTime, statusLabel } from '../../lib/format';
import { useTranslation } from 'react-i18next';

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'Em processo' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

const PAY_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'unpaid', label: 'Não pago' },
  { value: 'paid', label: 'Pago' },
  { value: 'processing', label: 'A processar' },
];

export default function AdminOrders() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [payStatus, setPayStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, status, payStatus, page],
    queryFn: () => api.get<{ data: any[]; meta: any }>(
      `/admin/orders?page=${page}&search=${encodeURIComponent(search)}&status=${status}&payment_status=${payStatus}`
    ),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Pedidos</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Gestão de todos os pedidos</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Número do pedido ou cliente..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
          {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={payStatus} onChange={(e) => { setPayStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
          {PAY_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {isLoading ? <Spinner /> : (data?.data.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="h-8 w-8" />} title="Sem pedidos" />
      ) : (
        <Card><CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-4 py-3 text-left">Pedido</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {data?.data.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-primary-600">{o.order_number}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{o.customer_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={statusVariant(o.status)}>{statusLabel(o.status)}</Badge>
                        <Badge variant={statusVariant(o.payment_status)}>{statusLabel(o.payment_status)}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatMoney(o.total, o.currency)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${o.id}`} className="flex items-center text-gray-400 hover:text-primary-600">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
