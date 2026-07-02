import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import Spinner from '../../components/ui/Spinner';

export default function ServiceDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['pub-service', slug],
    queryFn: () => api.get<{ data: any }>(`/services/${slug}`).then(r => r.data),
    staleTime: 120_000,
  });

  if (isLoading) return <div className="py-20"><Spinner /></div>;
  if (!data) return <div className="py-20 text-center text-gray-400">{t('not_found_title')}</div>;
  const s = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Link to="/services" className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> {t('nav_services')}
      </Link>
      {s.image && <div className="mb-8 overflow-hidden rounded-2xl aspect-video"><img src={s.image} alt={s.sname||s.name} className="h-full w-full object-cover" /></div>}
      {s.category && <span className="text-xs font-bold uppercase tracking-wider text-primary-600">{s.category.name}</span>}
      <h1 className="mt-2 text-3xl font-black">{s.sname||s.name}</h1>
      <div className="my-5 flex items-center gap-4">
        <span className="text-4xl font-black text-primary-600">{formatMoney(s.price)}</span>
        {s.duration && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Clock className="h-4 w-4" />{s.duration} {t('services_duration')}</span>}
      </div>
      {s.description && <p className="text-gray-600 dark:text-slate-300 leading-relaxed">{s.description}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/quote" className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-bold text-white hover:bg-primary-700 transition-colors">
          {t('services_quote')} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/contact" className="flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-semibold hover:bg-gray-50 transition-colors dark:border-slate-700">
          {t('nav_contact')}
        </Link>
      </div>
    </div>
  );
}
