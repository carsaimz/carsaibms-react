import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import Spinner from '../../components/ui/Spinner';

export default function PublicServices() {
  const { data, isLoading } = useQuery({
    queryKey: ['pub-services-all'],
    queryFn: () => api.get<{ data: any[] }>('/services?per_page=50'),
    staleTime: 120_000,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black">Serviços</h1>
        <p className="mt-3 text-gray-500 dark:text-slate-400">Serviços profissionais disponíveis para o seu negócio</p>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((s) => (
            <div key={s.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-800">
              {s.image && (
                <div className="mb-4 aspect-video overflow-hidden rounded-xl">
                  <img src={s.image} alt={s.sname} className="h-full w-full object-cover" />
                </div>
              )}
              <h2 className="text-lg font-bold">{s.sname}</h2>
              {s.description && (
                <p className="mt-2 flex-1 text-sm text-gray-500 dark:text-slate-400 line-clamp-3">{s.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-black text-primary-600">{formatMoney(s.price)}</span>
                {s.duration && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" /> {s.duration} min
                  </span>
                )}
              </div>
              <Link to="/register"
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-primary-50 py-2.5 text-sm font-bold text-primary-700 hover:bg-primary-100 transition-colors dark:bg-primary-900/30 dark:text-primary-400">
                Solicitar serviço <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
