import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tag } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatMoney, formatDate } from '../../lib/format';
import { useTranslation } from 'react-i18next';

export default function AdminCoupons() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code:'', type:'percent', value:10, min_order:0, max_uses:0, expires_at:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => api.get<{ data: any[] }>('/admin/coupons'),
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      await api.post('/admin/coupons', form);
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowForm(false); setForm({ code:'', type:'percent', value:10, min_order:0, max_uses:0, expires_at:'' });
    } catch(err) { setError(err instanceof ApiClientError ? err.message : 'Erro'); }
    finally { setSaving(false); }
  }

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">Cupões de Desconto</h1>
        <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(v=>!v)}>Novo Cupão</Button>
      </div>
      {showForm && (
        <Card><CardBody>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
            <Input label="Código" value={form.code} onChange={(e) => setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="PROMO10" required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Tipo</label>
              <select value={form.type} onChange={(e) => setForm(f=>({...f,type:e.target.value}))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
                <option value="percent">Percentagem (%)</option>
                <option value="fixed">Valor fixo (MT)</option>
              </select>
            </div>
            <Input label={form.type==='percent'?'Desconto (%)':'Desconto (MT)'} type="number" min="0" value={form.value} onChange={(e)=>setForm(f=>({...f,value:parseFloat(e.target.value)||0}))} />
            <Input label="Pedido mínimo (MT)" type="number" min="0" value={form.min_order} onChange={(e)=>setForm(f=>({...f,min_order:parseFloat(e.target.value)||0}))} />
            <Input label="Usos máximos (0=ilimitado)" type="number" min="0" value={form.max_uses} onChange={(e)=>setForm(f=>({...f,max_uses:parseInt(e.target.value)||0}))} />
            <Input label="Expira em" type="date" value={form.expires_at} onChange={(e)=>setForm(f=>({...f,expires_at:e.target.value}))} />
            {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
            <div className="col-span-2 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={()=>setShowForm(false)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Criar</Button>
            </div>
          </form>
        </CardBody></Card>
      )}
      {isLoading ? <Spinner /> : !data?.data.length ? (
        <EmptyState icon={<Tag className="h-8 w-8" />} title="Sem cupões criados" />
      ) : (
        <Card><CardBody className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              <th className="px-4 py-3 text-left">Código</th><th className="px-4 py-3 text-left">Desconto</th><th className="px-4 py-3 text-left">Usos</th><th className="px-4 py-3 text-left">Expira</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {data.data.map((c:any) => {
                const expired = c.expires_at && new Date(c.expires_at) < new Date();
                const exhausted = c.max_uses > 0 && c.used_count >= c.max_uses;
                return (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-primary-600">{c.code}</td>
                    <td className="px-4 py-3">{c.type==='percent'?`${c.value}%`:formatMoney(c.value)}</td>
                    <td className="px-4 py-3 text-gray-500">{c.used_count||0}{c.max_uses>0?` / ${c.max_uses}`:''}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{c.expires_at?formatDate(c.expires_at):'Sem limite'}</td>
                    <td className="px-4 py-3"><Badge variant={expired||exhausted?'danger':'success'}>{expired?'Expirado':exhausted?'Esgotado':'Activo'}</Badge></td>
                    <td className="px-4 py-3"><button onClick={()=>del.mutate(c.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody></Card>
      )}
    </div>
  );
}
