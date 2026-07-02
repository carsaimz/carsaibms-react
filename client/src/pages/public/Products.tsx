import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function PublicProducts() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pub-products', query, page],
    queryFn: () => api.get<{ data: any[]; meta: any }>(`/products?page=${page}&per_page=12&search=${encodeURIComponent(query)}`),
    staleTime: 60_000,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black">{t('products_title')}</h1>
        <p className="mt-2 text-gray-500 dark:text-slate-400">{data?.meta.total ?? 0} {t('products_title').toLowerCase()}</p>
      </div>
      <div className="mb-8 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (setQuery(search), setPage(1))}
            placeholder={t('products_search_ph')}
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
        </div>
        <button onClick={() => { setQuery(search); setPage(1); }}
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700">
          {t('products_search_btn')}
        </button>
      </div>
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<Package className="h-8 w-8" />} title={t('products_empty')} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.data.map(p => (
            <Link key={p.id} to={`/products/${p.slug}`}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all dark:border-slate-800 dark:bg-slate-800">
              <div className="aspect-video bg-gray-100 dark:bg-slate-700 overflow-hidden">
                {p.image
                  ? <img src={p.image} alt={p.pname} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="flex h-full items-center justify-center"><Package className="h-10 w-10 text-gray-300" /></div>}
              </div>
              <div className="p-4">
                <p className="font-bold line-clamp-1">{p.pname}</p>
                {p.short_description && <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{p.short_description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-black text-primary-600">{formatMoney(p.price)}</span>
                  <span className={`text-xs font-semibold ${p.stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {p.stock <= 0 ? t('sold_out') : `${p.stock} ${p.unit}`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {data && data.meta.last_page > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`h-9 min-w-[36px] rounded-lg px-3 text-sm font-semibold ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-800'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
