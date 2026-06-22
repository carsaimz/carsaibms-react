import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, CreditCard, Loader2 } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatMoney, formatDateTime, statusLabel } from '../../lib/format';
import { downloadInvoicePdf } from '../../lib/invoice';

interface OrderItem {
  id: number;
  product_id: number | null;
  name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

interface Payment {
  id: number;
  method: string;
  amount: number;
  reference: string | null;
  status: string;
  created_at: string;
}

interface OrderDetailData {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
  payments: Payment[];
}

const gateways = [
  { id: 'mpesa', label: 'M-Pesa' },
  { id: 'emola', label: 'e-Mola' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'stripe', label: 'Stripe (Cartão)' },
];

export default function OrderDetail() {
  const { id } = useParams();
  const [paying, setPaying] = useState<string | null>(null);
  const [payMessage, setPayMessage] = useState<string | null>(null);
  const [showGateways, setShowGateways] = useState(false);
  const [phone, setPhone] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get<{ data: OrderDetailData }>(`/customer/orders/${id}`).then((r) => r.data),
  });

  async function handlePay(method: string) {
    if (!data) return;
    if (['mpesa', 'emola'].includes(method) && !phone) {
      setPayMessage('Indique o número de telemóvel.');
      return;
    }
    setPaying(method);
    setPayMessage(null);
    try {
      const res = await api.post<{ data: any }>('/payments/initiate', {
        order_id: data.id,
        method,
        phone: phone || undefined,
      });
      setPayMessage(res.data.message || 'Pagamento iniciado.');
      setShowGateways(false);
      await refetch();
    } catch (err) {
      setPayMessage(err instanceof ApiClientError ? err.message : 'Erro ao iniciar pagamento.');
    } finally {
      setPaying(null);
    }
  }

  if (isLoading) return <Spinner />;
  if (!data) return <p>Pedido não encontrado.</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/orders" className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:underline dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => downloadInvoicePdf(data)}>
            Factura PDF
          </Button>
          {data.payment_status !== 'paid' && (
            <Button size="sm" icon={<CreditCard className="h-4 w-4" />} onClick={() => setShowGateways((v) => !v)}>
              Pagar Agora
            </Button>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold">{data.order_number}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">{formatDateTime(data.created_at)}</p>
        <div className="mt-2 flex gap-2">
          <Badge variant={statusVariant(data.status)}>{statusLabel(data.status)}</Badge>
          <Badge variant={statusVariant(data.payment_status)}>{statusLabel(data.payment_status)}</Badge>
        </div>
      </div>

      {showGateways && (
        <Card>
          <CardHeader><CardTitle>Escolher método de pagamento</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Telemóvel (para M-Pesa / e-Mola): 258840000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
            <div className="grid grid-cols-2 gap-2">
              {gateways.map((g) => (
                <Button
                  key={g.id}
                  variant="secondary"
                  loading={paying === g.id}
                  disabled={!!paying}
                  onClick={() => handlePay(g.id)}
                >
                  {g.label}
                </Button>
              ))}
            </div>
            {payMessage && <p className="text-sm text-gray-600 dark:text-slate-300">{payMessage}</p>}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Itens</CardTitle></CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {data.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {item.quantity} × {formatMoney(item.unit_price, data.currency)}
                  </p>
                </div>
                <span className="text-sm font-bold">{formatMoney(item.total, data.currency)}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-1 text-sm">
          <Row label="Subtotal" value={formatMoney(data.subtotal, data.currency)} />
          {data.discount > 0 && <Row label="Desconto" value={`- ${formatMoney(data.discount, data.currency)}`} />}
          {data.tax > 0 && <Row label="IVA" value={formatMoney(data.tax, data.currency)} />}
          {data.shipping > 0 && <Row label="Envio" value={formatMoney(data.shipping, data.currency)} />}
          <Row label="Total" value={formatMoney(data.total, data.currency)} bold />
        </CardBody>
      </Card>

      {data.payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Pagamentos</CardTitle></CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {data.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium uppercase">{p.method}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{formatDateTime(p.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatMoney(p.amount, data.currency)}</span>
                    <Badge variant={statusVariant(p.status)}>{statusLabel(p.status)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {data.notes && (
        <Card>
          <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
          <CardBody className="text-sm text-gray-600 dark:text-slate-300">{data.notes}</CardBody>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'border-t border-gray-100 pt-2 text-base font-bold dark:border-slate-700' : 'text-gray-600 dark:text-slate-300'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
