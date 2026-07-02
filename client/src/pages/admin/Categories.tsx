import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { useTranslation } from 'react-i18next';

export default function AdminCategories() {
  const { t } = useTranslation();
  const [type, setType] = useState<'product'|'service'>('product');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get<{ data: any[] }>('/admin/categories'),
  });

  const create = useMutation({
    mutationFn: () => api.post('/admin/categories', { type, name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setShowForm(false); setName(''); },
  });

  const filtered = (data?.data ?? []).filter((c: any) => c.type === type);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-xl font-bold">Categorias</h1></div>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>Nova Categoria</Button>
      </div>
      <div className="flex gap-2">
        {(['product','service'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${type===t?'bg-primary-600 text-white':'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {t==='product'?'Produtos':'Serviços'}
          </button>
        ))}
      </div>
      {showForm && (
        <Card><CardBody>
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="flex gap-3">
            <Input label="" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da categoria" required className="flex-1" />
            <div className="flex gap-2 items-end">
              <Button type="submit" size="sm" loading={create.isPending}>Criar</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </CardBody></Card>
      )}
      {isLoading ? <Spinner /> : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {filtered.length === 0 ? <p className="py-6 text-center text-sm text-gray-400">Sem categorias de {type==='product'?'produtos':'serviços'}.</p>
            : filtered.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-gray-400">{c.slug}</p></div>
                <Badge variant="default">{c.type}</Badge>
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}
