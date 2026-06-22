import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/shared/Avatar';
import { formatDate } from '../../lib/format';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search, page],
    queryFn: () => api.get<{ data: any[]; meta: any }>(
      `/admin/customers?page=${page}&search=${encodeURIComponent(search)}`
    ),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Clientes</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">{data?.meta.total ?? 0} clientes registados</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input className="w-full max-w-md rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          placeholder="Pesquisar por nome, email ou telefone..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {isLoading ? <Spinner /> : (data?.data.length === 0 ? (
        <EmptyState icon={<Users className="h-8 w-8" />} title="Nenhum cliente encontrado" />
      ) : (
        <Card><CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Empresa</th>
                  <th className="px-4 py-3 text-left">Cidade</th>
                  <th className="px-4 py-3 text-right">Pedidos</th>
                  <th className="px-4 py-3 text-left">Registo</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {data?.data.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} size="sm" />
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.company || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.city || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold">{c.order_count}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.is_active ? 'success' : 'danger'}>{c.is_active ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody></Card>
      ))}

      {data && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-semibold ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-800'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
