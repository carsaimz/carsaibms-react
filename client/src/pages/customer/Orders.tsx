import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney, formatDate, statusLabel } from '../../lib/format';

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  created_at: string;
}

const statusFilters = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

export default function Orders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', status, page],
    queryFn: () =>
      api.get<{ data: Order[]; meta: any }>(
        `/customer/orders?page=${page}${status ? `&status=${status}` : ''}`
      ),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Os Meus Pedidos</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Histórico completo de pedidos</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1); }}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              status === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={<Package className="h-8 w-8" />} title="Nenhum pedido encontrado" />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {data.data.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50"
                >
                  <div>
                    <p className="text-sm font-semibold">{order.order_number}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{formatDate(order.created_at)}</p>
                    <div className="mt-1 flex gap-1">
                      <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
                      <Badge variant={statusVariant(order.payment_status)}>{statusLabel(order.payment_status)}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{formatMoney(order.total, order.currency)}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {data && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-semibold ${
                p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
