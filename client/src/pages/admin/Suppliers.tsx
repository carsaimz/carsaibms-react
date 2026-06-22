import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/shared/Avatar';

export default function AdminSuppliers() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', nuit:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: () => api.get<{ data: any[] }>('/admin/suppliers'),
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      await api.post('/admin/suppliers', form);
      qc.invalidateQueries({ queryKey: ['admin-suppliers'] });
      setShowForm(false); setForm({ name:'', email:'', phone:'', address:'', nuit:'' });
    } catch(err) { setError(err instanceof ApiClientError ? err.message : 'Erro'); }
    finally { setSaving(false); }
  }

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/suppliers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-suppliers'] }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Fornecedores</h1>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(v=>!v)}>Novo Fornecedor</Button>
      </div>
      {showForm && (
        <Card><CardBody>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Nome" value={form.name} onChange={(e) => setForm(f=>({...f,name:e.target.value}))} required /></div>
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm(f=>({...f,email:e.target.value}))} />
            <Input label="Telefone" value={form.phone} onChange={(e) => setForm(f=>({...f,phone:e.target.value}))} />
            <Input label="NUIT" value={form.nuit} onChange={(e) => setForm(f=>({...f,nuit:e.target.value}))} />
            <Input label="Morada" value={form.address} onChange={(e) => setForm(f=>({...f,address:e.target.value}))} />
            {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
            <div className="col-span-2 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={()=>setShowForm(false)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Guardar</Button>
            </div>
          </form>
        </CardBody></Card>
      )}
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<Building2 className="h-8 w-8" />} title="Sem fornecedores" description="Adicione os seus fornecedores de produtos." />
      ) : (
        <Card><CardBody className="p-0">
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {data.data.map((s:any) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} size="sm" />
                  <div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.email||''} {s.phone?`· ${s.phone}`:''}</p>
                  </div>
                </div>
                <button onClick={() => del.mutate(s.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}
