import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import Spinner from '../../../components/ui/Spinner';

export default function BlogPost() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['pub-post', slug],
    queryFn: () => api.get<{ data: any }>(`/blog/${slug}`).then((r) => r.data),
    staleTime: 120_000,
  });

  if (isLoading) return <div className="py-20"><Spinner /></div>;
  if (!data) return <div className="py-20 text-center text-gray-400">Artigo não encontrado.</div>;
  const post = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Link to="/blog" className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Blog
      </Link>

      {post.image && (
        <div className="mb-8 overflow-hidden rounded-2xl aspect-video">
          <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(post.published_at)}</span>
        {post.views > 0 && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views} leituras</span>}
      </div>

      <h1 className="text-3xl font-black leading-tight">{post.title}</h1>

      {post.excerpt && (
        <p className="mt-4 text-lg text-gray-500 dark:text-slate-400 leading-relaxed">{post.excerpt}</p>
      )}

      {post.body && (
        <div className="prose prose-lg prose-primary mt-8 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.body }} />
      )}
    </div>
  );
}
