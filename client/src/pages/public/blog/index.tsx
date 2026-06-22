import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Eye } from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/ui/EmptyState';

export default function Blog() {
  const { data, isLoading } = useQuery({
    queryKey: ['pub-blog'],
    queryFn: () => api.get<{ data: any[] }>('/blog?per_page=20'),
    staleTime: 120_000,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black">Blog</h1>
        <p className="mt-3 text-gray-500 dark:text-slate-400">Notícias, tutoriais e novidades do Carsai BMS</p>
      </div>

      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState title="Sem artigos publicados" description="Volte em breve para novidades." />
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-800">
              {post.image && (
                <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-slate-700">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-bold line-clamp-2 group-hover:text-primary-600 transition-colors">{post.title}</h2>
                {post.excerpt && <p className="mt-2 flex-1 text-sm text-gray-500 dark:text-slate-400 line-clamp-3">{post.excerpt}</p>}
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(post.published_at)}</span>
                  {post.views > 0 && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
