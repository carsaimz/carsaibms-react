import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, Wallet, LifeBuoy, Bell, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney } from '../../lib/format';

interface DashboardData {
  total_orders: number;
  amount_due: number;
  amount_paid: number;
  open_tickets: number;
  unread_notifications: number;
  recent_orders: Array<{
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total: number;
    currency: string;
    created_at: string;
  }>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<{ data: DashboardData }>('/customer/dashboard').then((r) => r.data),
  });

  if (isLoading) return <Spinner />;
  if (!data) return null;

  const stats = [
    { label: t('dash_orders'), value: data.total_orders, icon: Package, color: 'text-primary-600 bg-primary-50 dark:bg-primary-600/10' },
    { label: t('dash_due'), value: formatMoney(data.amount_due), icon: Wallet, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    { label: t('dash_tickets'), value: data.open_tickets, icon: LifeBuoy, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: t('dash_notifs'), value: data.unread_notifications, icon: Bell, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Painel</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Resumo da sua conta</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardBody className="flex flex-col gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Pedidos Recentes</CardTitle>
          <Link to="/orders" className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline">
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {data.recent_orders.length === 0 ? (
            <EmptyState icon={<Package className="h-8 w-8" />} title="Ainda não tem pedidos" />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {data.recent_orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50"
                >
                  <div>
                    <p className="text-sm font-semibold">{order.order_number}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('pt-MZ')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold">{formatMoney(order.total, order.currency)}</span>
                    <div className="flex gap-1">
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                      <Badge variant={statusVariant(order.payment_status)}>{order.payment_status}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
