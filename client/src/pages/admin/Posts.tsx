import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Eye, EyeOff } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/format';

export default function AdminPosts() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title:'', excerpt:'', body:'', is_published:false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => api.get<{ data: any[] }>('/admin/posts'),
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      if (editing) await api.put(`/admin/posts/${editing.id}`, form);
      else await api.post('/admin/posts', form);
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      setShowForm(false); setEditing(null); setForm({ title:'', excerpt:'', body:'', is_published:false });
    } catch(err) { setError(err instanceof ApiClientError ? err.message : 'Erro'); }
    finally { setSaving(false); }
  }

  const togglePublish = useMutation({
    mutationFn: (p: any) => api.put(`/admin/posts/${p.id}`, { ...p, is_published: !p.is_published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-posts'] }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Blog / Posts</h1>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setForm({ title:'', excerpt:'', body:'', is_published:false }); setShowForm(true); }}>Novo Artigo</Button>
      </div>
      {showForm && (
        <Card><CardBody>
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <Input label="Título" value={form.title} onChange={(e) => setForm(f=>({...f,title:e.target.value}))} required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Resumo (excerpt)</label>
              <textarea rows={2} value={form.excerpt} onChange={(e) => setForm(f=>({...f,excerpt:e.target.value}))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Corpo (HTML)</label>
              <textarea rows={8} value={form.body} onChange={(e) => setForm(f=>({...f,body:e.target.value}))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono dark:border-slate-600 dark:bg-slate-900" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm(f=>({...f,is_published:e.target.checked}))} className="rounded" />
              Publicado
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Guardar</Button>
            </div>
          </form>
        </CardBody></Card>
      )}
      {isLoading ? <Spinner /> : (
        <Card><CardBody className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              <th className="px-4 py-3 text-left">Título</th><th className="px-4 py-3 text-left">Data</th><th className="px-4 py-3 text-right">Leituras</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {(data?.data??[]).map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{p.published_at ? formatDate(p.published_at) : '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{p.views||0}</td>
                  <td className="px-4 py-3"><Badge variant={p.is_published?'success':'default'}>{p.is_published?'Publicado':'Rascunho'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditing(p); setForm({title:p.title,excerpt:p.excerpt||'',body:p.body||'',is_published:!!p.is_published}); setShowForm(true); }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => togglePublish.mutate(p)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">
                        {p.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody></Card>
      )}
    </div>
  );
}
