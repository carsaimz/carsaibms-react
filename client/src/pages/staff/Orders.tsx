import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney, formatDateTime, statusLabel } from '../../lib/format';

export default function StaffOrders() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['staff-orders', page],
    queryFn: () => api.get<{ data: any[]; meta: any }>(`/admin/orders?page=${page}&per_page=20`),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Pedidos</h1>
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<ShoppingCart className="h-8 w-8" />} title="Sem pedidos" />
      ) : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {data.data.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{o.order_number}</p>
                  <p className="text-xs text-gray-400">{o.customer_name} · {formatDateTime(o.created_at)}</p>
                  <div className="mt-1 flex gap-1">
                    <Badge variant={statusVariant(o.status)}>{statusLabel(o.status)}</Badge>
                    <Badge variant={statusVariant(o.payment_status)}>{statusLabel(o.payment_status)}</Badge>
                  </div>
                </div>
                <span className="font-bold text-sm">{formatMoney(o.total, o.currency)}</span>
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}
      {data && data.meta?.last_page > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-semibold ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-800'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
