import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ToggleRight, ToggleLeft, Edit2 } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { formatMoney } from '../../lib/format';
import { useTranslation } from 'react-i18next';

export default function AdminServices() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name:'', price:0, duration:60, description:'', is_active:true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => api.get<{ data: any[] }>('/admin/services'),
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      if (editing) await api.put(`/admin/services/${editing.id}`, form);
      else await api.post('/admin/services', form);
      qc.invalidateQueries({ queryKey: ['admin-services'] });
      setShowForm(false); setEditing(null); setForm({ name:'', price:0, duration:60, description:'', is_active:true });
    } catch(err) { setError(err instanceof ApiClientError ? err.message : 'Erro'); }
    finally { setSaving(false); }
  }

  const toggle = useMutation({
    mutationFn: (s: any) => api.put(`/admin/services/${s.id}`, { ...s, is_active: !s.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Serviços</h1>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setForm({ name:'', price:0, duration:60, description:'', is_active:true }); setShowForm(true); }}>Novo Serviço</Button>
      </div>
      {showForm && (
        <Card><CardBody>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Nome" value={form.name} onChange={(e) => setForm(f=>({...f,name:e.target.value}))} required /></div>
            <Input label="Preço" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm(f=>({...f,price:parseFloat(e.target.value)||0}))} />
            <Input label="Duração (min)" type="number" min="0" value={form.duration} onChange={(e) => setForm(f=>({...f,duration:parseInt(e.target.value)||0}))} />
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Descrição</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm(f=>({...f,description:e.target.value}))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" />
            </div>
            {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
            <div className="col-span-2 flex justify-end gap-2">
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
              <th className="px-4 py-3 text-left">Nome</th><th className="px-4 py-3 text-right">Preço</th><th className="px-4 py-3 text-right">Duração</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {(data?.data??[]).map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-medium">{s.sname||s.name}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatMoney(s.price)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{s.duration} min</td>
                  <td className="px-4 py-3"><Badge variant={s.is_active?'success':'default'}>{s.is_active?'Activo':'Inactivo'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditing(s); setForm({name:s.sname||s.name,price:s.price,duration:s.duration||60,description:s.description||'',is_active:s.is_active}); setShowForm(true); }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => toggle.mutate(s)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">
                        {s.is_active ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
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
