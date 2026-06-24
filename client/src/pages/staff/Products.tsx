import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney } from '../../lib/format';

export default function StaffProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['staff-products', search, page],
    queryFn: () => api.get<{ data: any[]; meta: any }>(`/products?page=${page}&search=${encodeURIComponent(search)}&per_page=20`),
    staleTime: 30_000,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Catálogo de Produtos</h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm dark:border-slate-600 dark:bg-slate-900"
          placeholder="Pesquisar produto ou SKU..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<Package className="h-8 w-8" />} title="Sem produtos" />
      ) : (
        <Card><CardBody className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              <th className="px-4 py-3 text-left">Produto</th><th className="px-4 py-3 text-right">Preço</th><th className="px-4 py-3 text-right">Stock</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {data.data.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3"><p className="font-medium">{p.pname || p.name}</p><p className="text-xs text-gray-400">{p.sku}</p></td>
                  <td className="px-4 py-3 text-right font-bold">{formatMoney(p.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${p.stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>{p.stock} {p.unit}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody></Card>
      )}
    </div>
  );
}
