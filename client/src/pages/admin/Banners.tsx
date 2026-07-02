import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Image } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useTranslation } from 'react-i18next';

export default function AdminBanners() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', link_url: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => api.get<{ data: any[] }>('/admin/banners'),
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      await api.post('/admin/banners', form);
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      setShowForm(false); setForm({ title: '', subtitle: '', image_url: '', link_url: '', is_active: true });
    } catch (err) { setError(err instanceof ApiClientError ? err.message : 'Erro'); }
    finally { setSaving(false); }
  }

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/banners/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Banners / Destaques</h1>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(v => !v)}>Novo Banner</Button>
      </div>
      {showForm && (
        <Card><CardBody>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
            <Input label="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <Input label="Subtítulo (opcional)" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
            <div className="col-span-2"><Input label="URL da Imagem" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} required /></div>
            <div className="col-span-2"><Input label="URL de destino (link)" value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} /></div>
            {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
            <div className="col-span-2 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Guardar</Button>
            </div>
          </form>
        </CardBody></Card>
      )}
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<Image className="h-8 w-8" />} title="Sem banners" description="Adicione banners para o slider da página inicial." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((b: any) => (
            <Card key={b.id}>
              <CardBody className="flex flex-col gap-2">
                {b.image_url && <img src={b.image_url} alt={b.title} className="w-full aspect-video rounded-lg object-cover bg-gray-100" />}
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-bold text-sm">{b.title}</p>{b.subtitle && <p className="text-xs text-gray-500">{b.subtitle}</p>}</div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Badge variant={b.is_active ? 'success' : 'default'}>{b.is_active ? 'Activo' : 'Inactivo'}</Badge>
                    <button onClick={() => del.mutate(b.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                {b.link_url && <a href={b.link_url} className="text-xs text-primary-600 truncate hover:underline">{b.link_url}</a>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
