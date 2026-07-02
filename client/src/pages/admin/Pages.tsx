import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Eye, EyeOff, FileText } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useTranslation } from 'react-i18next';

export default function AdminPages() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title:'', slug:'', content:'', is_published:false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: () => api.get<{ data: any[] }>('/admin/pages'),
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      if (editing) await api.put(`/admin/pages/${editing.id}`, form);
      else await api.post('/admin/pages', { ...form, slug: form.slug||form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-') });
      qc.invalidateQueries({ queryKey: ['admin-pages'] });
      setShowForm(false); setEditing(null); setForm({ title:'', slug:'', content:'', is_published:false });
    } catch(err) { setError(err instanceof ApiClientError ? err.message : 'Erro'); }
    finally { setSaving(false); }
  }

  const togglePublish = useMutation({
    mutationFn: (p: any) => api.put(`/admin/pages/${p.id}`, { ...p, is_published: !p.is_published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-pages'] }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Páginas CMS</h1>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setForm({ title:'', slug:'', content:'', is_published:false }); setShowForm(true); }}>Nova Página</Button>
      </div>
      {showForm && (
        <Card><CardBody>
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <Input label="Título" value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))} required />
            <Input label="Slug (URL)" value={form.slug} onChange={(e)=>setForm(f=>({...f,slug:e.target.value}))} placeholder="sobre-nos" />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Conteúdo (HTML)</label>
              <textarea rows={10} value={form.content} onChange={(e)=>setForm(f=>({...f,content:e.target.value}))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono dark:border-slate-600 dark:bg-slate-900" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={(e)=>setForm(f=>({...f,is_published:e.target.checked}))} className="rounded" />
              Publicado
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={()=>setShowForm(false)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Guardar</Button>
            </div>
          </form>
        </CardBody></Card>
      )}
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<FileText className="h-8 w-8" />} title="Sem páginas CMS" />
      ) : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {data.data.map((p:any) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-semibold text-sm">{p.title}</p>
                  <p className="text-xs text-gray-400">/{p.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.is_published?'success':'default'}>{p.is_published?'Publicado':'Rascunho'}</Badge>
                  <button onClick={() => { setEditing(p); setForm({title:p.title,slug:p.slug,content:p.content||'',is_published:!!p.is_published}); setShowForm(true); }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => togglePublish.mutate(p)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">{p.is_published?<EyeOff className="h-3.5 w-3.5"/>:<Eye className="h-3.5 w-3.5"/>}</button>
                </div>
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}
