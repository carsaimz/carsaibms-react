import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatMoney, formatDate } from '../../lib/format';
import { useTranslation } from 'react-i18next';

export default function AdminFinancial() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-financial'],
    queryFn: () => api.get<{ data: any }>('/admin/financial').then(r => r.data),
  });

  if (isLoading) return <Spinner />;
  const d = data ?? { revenue:0, costs:0, profit:0, paid_orders:0, unpaid_orders:0, recent_payments:[] };

  const cards = [
    { label:'Receita Total', value:formatMoney(d.revenue), icon:TrendingUp, color:'text-green-600 bg-green-50' },
    { label:'Pedidos Pagos', value:d.paid_orders, icon:CreditCard, color:'text-blue-600 bg-blue-50' },
    { label:'Pedidos Por Pagar', value:d.unpaid_orders, icon:TrendingDown, color:'text-amber-600 bg-amber-50' },
    { label:'Receita (30d)', value:formatMoney(d.revenue_30d||0), icon:DollarSign, color:'text-primary-600 bg-primary-50' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Financeiro</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}><CardBody className="flex flex-col gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
          </CardBody></Card>
        ))}
      </div>
      {d.recent_payments?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Pagamentos Recentes</CardTitle></CardHeader>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="px-4 py-2.5 text-left">Referência</th><th className="px-4 py-2.5 text-left">Método</th><th className="px-4 py-2.5 text-right">Valor</th><th className="px-4 py-2.5 text-left">Data</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {d.recent_payments.map((p:any) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-mono text-xs">{p.reference||p.order_number}</td>
                    <td className="px-4 py-2.5 uppercase text-xs font-semibold">{p.method}</td>
                    <td className="px-4 py-2.5 text-right font-bold">{formatMoney(p.amount)}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
