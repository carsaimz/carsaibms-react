import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Wrench, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney } from '../../lib/format';

export default function CustomerServices() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['customer-services'],
    queryFn: () => api.get<{ data: any[] }>('/services?per_page=50'),
    staleTime: 120_000,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">Serviços Disponíveis</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Solicite os nossos serviços profissionais</p>
        </div>
        <Link to="/quote" className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700">
          Pedir Orçamento <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<Wrench className="h-8 w-8" />} title="Sem serviços disponíveis" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.data.map((s: any) => (
            <Card key={s.id}>
              <CardBody>
                {s.image && <div className="mb-3 aspect-video overflow-hidden rounded-xl"><img src={s.image} alt={s.sname||s.name} className="h-full w-full object-cover" /></div>}
                <h3 className="font-bold">{s.sname||s.name}</h3>
                {s.description && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 line-clamp-3">{s.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-black text-primary-600">{formatMoney(s.price)}</span>
                  {s.duration && <span className="text-xs text-gray-400">{s.duration} min</span>}
                </div>
                <Link to="/quote" className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary-50 py-2 text-sm font-bold text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400">
                  Solicitar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
