import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/shared/Avatar';

export default function StaffCustomers() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['staff-customers', search],
    queryFn: () => api.get<{ data: any[] }>(`/admin/customers?search=${encodeURIComponent(search)}&per_page=30`),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Clientes</h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm dark:border-slate-600 dark:bg-slate-900"
          placeholder="Nome, email ou telefone..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<Users className="h-8 w-8" />} title="Sem clientes" />
      ) : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {data.data.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={c.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.email} {c.company ? `· ${c.company}` : ''}</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">{c.order_count} pedido(s)</span>
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}
