import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatMoney, formatDateTime, statusLabel } from '../../lib/format';
import { downloadInvoicePdf } from '../../lib/invoice';

const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
const PAY_STATUSES   = ['unpaid','processing','paid','refunded','failed'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => api.get<{ data: any }>(`/admin/orders/${id}`).then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => api.put(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-order', id] }),
  });

  const updatePayment = useMutation({
    mutationFn: (payment_status: string) => api.put(`/admin/orders/${id}/payment`, { payment_status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-order', id] }),
  });

  if (isLoading) return <Spinner />;
  if (!data) return <p>Pedido não encontrado.</p>;
  const o = data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:underline dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" /> Pedidos
        </Link>
        <Button variant="secondary" size="sm" onClick={() => downloadInvoicePdf(o)}>Factura PDF</Button>
      </div>

      <div>
        <h1 className="text-xl font-bold">{o.order_number}</h1>
        <p className="text-sm text-gray-500">{formatDateTime(o.created_at)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Estado do Pedido</CardTitle></CardHeader>
          <CardBody className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map((s) => (
              <button key={s} onClick={() => updateStatus.mutate(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  o.status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'
                }`}>{statusLabel(s)}</button>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Estado de Pagamento</CardTitle></CardHeader>
          <CardBody className="flex flex-wrap gap-2">
            {PAY_STATUSES.map((s) => (
              <button key={s} onClick={() => updatePayment.mutate(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  o.payment_status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'
                }`}>{statusLabel(s)}</button>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
          <CardBody className="text-sm space-y-1">
            <p className="font-semibold">{o.customer.name || 'Visitante'}</p>
            {o.customer.email && <p className="text-gray-500">{o.customer.email}</p>}
            {o.customer.phone && <p className="text-gray-500">{o.customer.phone}</p>}
            {o.delivery_address && <p className="text-gray-500 mt-2">{o.delivery_address}</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
          <CardBody className="text-sm space-y-1.5">
            {[
              ['Subtotal', formatMoney(o.subtotal, o.currency)],
              o.discount > 0 ? ['Desconto', `- ${formatMoney(o.discount, o.currency)}`] : null,
              o.tax > 0 ? ['IVA', formatMoney(o.tax, o.currency)] : null,
              o.shipping > 0 ? ['Envio', formatMoney(o.shipping, o.currency)] : null,
            ].filter(Boolean).map(([k, v]: any) => (
              <div key={k} className="flex justify-between text-gray-600"><span>{k}</span><span>{v}</span></div>
            ))}
            <div className="flex justify-between border-t border-gray-100 pt-1.5 font-bold dark:border-slate-700">
              <span>Total</span><span>{formatMoney(o.total, o.currency)}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Itens</CardTitle></CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-2.5 text-left">Produto</th>
              <th className="px-4 py-2.5 text-right">Qtd</th>
              <th className="px-4 py-2.5 text-right">Preço Unit.</th>
              <th className="px-4 py-2.5 text-right">Total</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {o.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-4 py-2.5 font-medium">{item.name}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{formatMoney(item.unit_price, o.currency)}</td>
                  <td className="px-4 py-2.5 text-right font-bold">{formatMoney(item.total, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {o.notes && (
        <Card><CardHeader><CardTitle>Notas</CardTitle></CardHeader>
          <CardBody className="text-sm text-gray-600 dark:text-slate-300">{o.notes}</CardBody>
        </Card>
      )}
    </div>
  );
}
