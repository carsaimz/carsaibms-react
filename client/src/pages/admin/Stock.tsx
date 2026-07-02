import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, AlertTriangle, Plus, Minus } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useTranslation } from 'react-i18next';

export default function AdminStock() {
  const { t } = useTranslation();
  const [adjustId, setAdjustId] = useState<number|null>(null);
  const [qty, setQty] = useState('');
  const [type, setType] = useState<'add'|'subtract'|'set'>('add');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stock'],
    queryFn: () => api.get<{ data: any[] }>('/admin/reports/stock'),
  });

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/admin/stock/adjust', { product_id: adjustId, type, qty: parseFloat(qty)||0, reason });
      qc.invalidateQueries({ queryKey: ['admin-stock'] });
      setAdjustId(null); setQty(''); setReason('');
    } catch(err) { alert(err instanceof ApiClientError ? err.message : 'Erro'); }
    finally { setSaving(false); }
  }

  const low = (data?.data??[]).filter((p:any)=>p.status==='low').length;
  const out = (data?.data??[]).filter((p:any)=>p.status==='out').length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Gestão de Stock</h1>
        <div className="mt-2 flex gap-3 flex-wrap">
          {out > 0 && <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600"><AlertTriangle className="h-4 w-4" />{out} esgotado(s)</span>}
          {low > 0 && <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600"><AlertTriangle className="h-4 w-4" />{low} stock baixo</span>}
        </div>
      </div>

      {adjustId && (
        <Card><CardBody>
          <form onSubmit={handleAdjust} className="flex flex-col gap-3">
            <h3 className="font-bold text-sm">Ajustar Stock</h3>
            <div className="flex gap-2">
              {(['add','subtract','set'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${type===t?'bg-primary-600 text-white':'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  {t==='add'?'Adicionar':t==='subtract'?'Subtrair':'Definir'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Quantidade" type="number" min="0" step="any" value={qty} onChange={(e)=>setQty(e.target.value)} required />
              <Input label="Motivo (opcional)" value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Ex: Inventário, Devolução..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={()=>setAdjustId(null)}>Cancelar</Button>
              <Button type="submit" loading={saving}>Guardar</Button>
            </div>
          </form>
        </CardBody></Card>
      )}

      {isLoading ? <Spinner /> : (
        <Card><CardBody className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              <th className="px-4 py-3 text-left">Produto</th><th className="px-4 py-3 text-right">Stock</th><th className="px-4 py-3 text-right">Mínimo</th><th className="px-4 py-3 text-left">Estado</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {(data?.data??[]).map((p:any) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3"><p className="font-medium">{p.name}</p><p className="text-xs text-gray-400">{p.sku}</p></td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${p.status==='out'?'text-red-500':p.status==='low'?'text-amber-500':'text-green-600'}`}>{p.stock} {p.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{p.min_stock}</td>
                  <td className="px-4 py-3"><Badge variant={p.status==='out'?'danger':p.status==='low'?'warning':'success'}>{p.status==='out'?'Esgotado':p.status==='low'?'Stock baixo':'OK'}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setAdjustId(p.id)} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold hover:border-primary-400 hover:text-primary-600 dark:border-slate-600">Ajustar</button>
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
