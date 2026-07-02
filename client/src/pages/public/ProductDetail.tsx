import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['pub-product', slug],
    queryFn: () => api.get<{ data: any }>(`/products/${slug}`).then(r => r.data),
    staleTime: 120_000,
  });

  if (isLoading) return <div className="py-20"><Spinner /></div>;
  if (!data) return <div className="py-20 text-center text-gray-400">{t('not_found_title')}</div>;
  const p = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <Link to="/products" className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> {t('nav_products')}
      </Link>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 aspect-square dark:border-slate-800 dark:bg-slate-800">
          {p.image ? <img src={p.image} alt={p.pname} className="h-full w-full object-cover" />
            : <div className="flex h-full items-center justify-center"><Package className="h-20 w-20 text-gray-300" /></div>}
        </div>
        <div>
          {p.category && <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">{p.category.name}</span>}
          <h1 className="mt-2 text-3xl font-black">{p.pname}</h1>
          {p.sku && <p className="mt-1 text-sm text-gray-400">SKU: {p.sku}</p>}
          <div className="my-6"><span className="text-4xl font-black text-primary-600">{formatMoney(p.price)}</span></div>
          <div className="mb-6 flex items-center gap-3">
            <Badge variant={p.stock <= 0 ? 'danger' : p.stock <= p.min_stock ? 'warning' : 'success'}>
              {p.stock <= 0 ? t('sold_out') : p.stock <= p.min_stock ? t('status_pending') : t('available')}
            </Badge>
            {p.stock > 0 && <span className="text-sm text-gray-500">{p.stock} {p.unit}</span>}
          </div>
          {p.short_description && (
            <p className="mb-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-slate-800 dark:text-slate-300">{p.short_description}</p>
          )}
          {p.stock > 0 && (
            <Link to="/register" className="inline-block w-full rounded-xl bg-primary-600 py-3.5 text-center text-sm font-bold text-white hover:bg-primary-700 transition-colors">
              {t('auth_register_btn')}
            </Link>
          )}
          {p.description && (
            <div className="mt-8">
              <h3 className="mb-3 font-bold text-gray-700 dark:text-slate-200">{t('orders_details')}</h3>
              <div className="prose prose-sm max-w-none text-gray-600 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: p.description }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
