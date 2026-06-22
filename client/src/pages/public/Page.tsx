import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import Spinner from '../../components/ui/Spinner';

export default function CmsPage() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['cms-page', slug],
    queryFn: () => api.get<{ data: any }>(`/pages/${slug}`, { skipAuth: true }).then(r => r.data),
    staleTime: 300_000,
  });

  if (isLoading) return <div className="py-20"><Spinner /></div>;
  if (!data) return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-black">Página não encontrada</h1>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="mb-8 text-3xl font-black">{data.title}</h1>
      <div className="prose prose-lg prose-primary max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: data.content || '' }} />
    </div>
  );
}
