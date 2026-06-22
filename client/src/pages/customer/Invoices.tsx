import { useQuery } from '@tanstack/react-query';
import { FileText, Download } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney, formatDate, statusLabel } from '../../lib/format';
import { downloadInvoicePdf } from '../../lib/invoice';

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  items: Array<{ id: number; name: string; quantity: number; unit_price: number; total: number }>;
}

export default function Invoices() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', '', 1],
    queryFn: () => api.get<{ data: Order[] }>('/customer/orders?per_page=50'),
  });

  const orders = data?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Facturas</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Descarregue as facturas dos seus pedidos em PDF — geradas directamente no seu dispositivo.
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
        💡 As facturas são geradas localmente no seu browser — sem espera e disponíveis offline.
      </div>

      {isLoading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="Sem facturas"
          description="As facturas aparecem aqui quando tiver pedidos."
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <p className="truncate text-sm font-semibold">{order.order_number}</p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                      <Badge variant={statusVariant(order.payment_status)}>
                        {statusLabel(order.payment_status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="hidden text-sm font-bold sm:block">
                      {formatMoney(order.total, order.currency)}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Download className="h-3.5 w-3.5" />}
                      onClick={() => downloadInvoicePdf(order)}
                    >
                      <span className="hidden sm:inline">PDF</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
