import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatMoney } from '../../lib/format';
import { useTranslation } from 'react-i18next';

const PERIODS = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
];

export default function AdminReports() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('30d');
  const [tab, setTab] = useState<'revenue' | 'products' | 'stock'>('revenue');

  const { data: revenue, isLoading: rl } = useQuery({
    queryKey: ['admin-revenue', period],
    queryFn: () => api.get<{ data: any[] }>(`/admin/reports/revenue?period=${period}`),
    enabled: tab === 'revenue',
  });

  const { data: topProducts, isLoading: pl } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: () => api.get<{ data: any[] }>('/admin/reports/top-products'),
    enabled: tab === 'products',
  });

  const { data: stock, isLoading: sl } = useQuery({
    queryKey: ['admin-stock'],
    queryFn: () => api.get<{ data: any[] }>('/admin/reports/stock'),
    enabled: tab === 'stock',
  });

  const isLoading = rl || pl || sl;

  // Simple bar chart using div widths
  const maxRevenue = revenue?.data ? Math.max(...revenue.data.map((r) => r.revenue), 1) : 1;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Relatórios</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Análise de desempenho do negócio</p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-slate-800 w-fit">
        {(['revenue', 'products', 'stock'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
              tab === t ? 'bg-white shadow dark:bg-slate-700 dark:text-white' : 'text-gray-500 dark:text-slate-400'
            }`}>
            {t === 'revenue' ? 'Receita' : t === 'products' ? 'Produtos' : 'Stock'}
          </button>
        ))}
      </div>

      {/* Revenue tab */}
      {tab === 'revenue' && (
        <>
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${period === p.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                {p.label}
              </button>
            ))}
          </div>

          {rl ? <Spinner /> : (
            <Card>
              <CardHeader><CardTitle>Receita por Dia</CardTitle></CardHeader>
              <CardBody>
                {!revenue?.data?.length ? (
                  <p className="text-sm text-gray-400 text-center py-6">Sem dados para este período.</p>
                ) : (
                  <div className="space-y-2">
                    {revenue.data.map((r) => (
                      <div key={r.date} className="flex items-center gap-3">
                        <span className="w-24 text-xs text-gray-500 flex-shrink-0">{r.date}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-5 rounded-full bg-primary-500 flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(2, (r.revenue / maxRevenue) * 100)}%` }}
                          >
                            <span className="text-[10px] font-bold text-white">{r.orders}</span>
                          </div>
                        </div>
                        <span className="w-28 text-right text-xs font-bold">{formatMoney(r.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Top products tab */}
      {tab === 'products' && (
        pl ? <Spinner /> : (
          <Card>
            <CardHeader><CardTitle>Produtos Mais Vendidos</CardTitle></CardHeader>
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                    <th className="px-4 py-2.5 text-left">#</th>
                    <th className="px-4 py-2.5 text-left">Produto</th>
                    <th className="px-4 py-2.5 text-right">Unidades</th>
                    <th className="px-4 py-2.5 text-right">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {topProducts?.data.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 text-gray-400 font-bold">{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sku}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold">{p.qty}</td>
                      <td className="px-4 py-2.5 text-right font-bold">{formatMoney(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )
      )}

      {/* Stock tab */}
      {tab === 'stock' && (
        sl ? <Spinner /> : (
          <Card>
            <CardHeader>
              <CardTitle>Estado do Stock</CardTitle>
              <div className="flex gap-2">
                <span className="text-xs text-red-500 font-semibold">{stock?.data.filter((p) => p.status === 'out').length} esgotados</span>
                <span className="text-xs text-amber-500 font-semibold">{stock?.data.filter((p) => p.status === 'low').length} baixo</span>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                    <th className="px-4 py-2.5 text-left">Produto</th>
                    <th className="px-4 py-2.5 text-right">Stock</th>
                    <th className="px-4 py-2.5 text-right">Mínimo</th>
                    <th className="px-4 py-2.5 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {stock?.data.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sku}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold">{p.stock} {p.unit}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">{p.min_stock}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={p.status === 'out' ? 'danger' : p.status === 'low' ? 'warning' : 'success'}>
                          {p.status === 'out' ? 'Esgotado' : p.status === 'low' ? 'Stock baixo' : 'OK'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )
      )}
    </div>
  );
}
