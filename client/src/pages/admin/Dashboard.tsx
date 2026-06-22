import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Users, Package, AlertTriangle, LifeBuoy } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatMoney, formatDateTime, statusLabel } from '../../lib/format';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get<{ data: any }>('/admin/dashboard').then((r) => r.data),
    refetchInterval: 60_000,
  });

  if (isLoading) return <Spinner />;
  if (!data) return null;
  const d = data;

  const stats = [
    { label: 'Pedidos (30d)',   value: d.orders_30d,           icon: ShoppingCart, color: 'text-blue-600 bg-blue-50',   link: '/admin/orders' },
    { label: 'Receita (30d)',   value: formatMoney(d.revenue_30d), icon: TrendingUp, color: 'text-green-600 bg-green-50', link: '/admin/reports' },
    { label: 'Clientes',        value: d.total_customers,       icon: Users,        color: 'text-purple-600 bg-purple-50',link: '/admin/customers' },
    { label: 'Produtos activos',value: d.active_products,       icon: Package,      color: 'text-amber-600 bg-amber-50',  link: '/admin/products' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Visão geral do negócio</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link}>
            <Card className="hover:shadow-md transition-shadow">
              <CardBody className="flex flex-col gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {(d.low_stock_count > 0 || d.pending_tickets > 0) && (
        <div className="flex flex-wrap gap-3">
          {d.low_stock_count > 0 && (
            <Link to="/admin/reports?tab=stock"
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              {d.low_stock_count} produto(s) com stock baixo
            </Link>
          )}
          {d.pending_tickets > 0 && (
            <Link to="/admin/tickets?status=open"
              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
              <LifeBuoy className="h-4 w-4" />
              {d.pending_tickets} ticket(s) em aberto
            </Link>
          )}
        </div>
      )}

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Pedidos Recentes</CardTitle>
          <Link to="/admin/orders" className="text-xs font-semibold text-primary-600 hover:underline">Ver todos →</Link>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-4 py-2.5 text-left">Pedido</th>
                  <th className="px-4 py-2.5 text-left">Cliente</th>
                  <th className="px-4 py-2.5 text-left">Estado</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                  <th className="px-4 py-2.5 text-left">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {d.recent_orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-2.5">
                      <Link to={`/admin/orders/${o.id}`} className="font-semibold text-primary-600 hover:underline">{o.order_number}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-slate-300">{o.customer_name}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant={statusVariant(o.status)}>{statusLabel(o.status)}</Badge>
                        <Badge variant={statusVariant(o.payment_status)}>{statusLabel(o.payment_status)}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold">{formatMoney(o.total, o.currency)}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{formatDateTime(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
