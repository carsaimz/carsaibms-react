import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { formatMoney } from '../../lib/format';
import { useTranslation } from 'react-i18next';

interface Product {
  id: number; sku: string; barcode?: string; name: string; slug: string;
  price: number; stock: number; min_stock: number; unit: string;
  is_active: boolean; is_featured: boolean; sold_count: number; category: string | null;
}

export default function AdminProducts() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => api.get<{ data: Product[]; meta: any }>(
      `/admin/products?page=${page}&search=${encodeURIComponent(search)}`
    ),
  });

  const toggleActive = useMutation({
    mutationFn: (p: Product) => api.put(`/admin/products/${p.id}`, { ...p, is_active: !p.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Produtos</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Gestão do catálogo de produtos</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setShowForm(true); }}>
          Novo Produto
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Pesquisar por nome ou SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-right">Preço</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Vendidos</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {(data?.data ?? []).map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku || '—'}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatMoney(p.price)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${p.stock <= 0 ? 'text-red-500' : p.stock <= p.min_stock ? 'text-amber-500' : 'text-green-600'}`}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.is_active ? 'success' : 'default'}>{p.is_active ? 'Activo' : 'Inactivo'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.sold_count}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setEditing(p); setShowForm(true); }}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-700"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => toggleActive.mutate(p)}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-700"
                            title={p.is_active ? 'Desactivar' : 'Activar'}
                          >
                            {p.is_active ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Pagination */}
      {data && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-semibold ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-800'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ['admin-products'] }); }}
        />
      )}
    </div>
  );
}

function ProductForm({ initial, onClose, onSaved }: { initial: Product | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '', sku: initial?.sku ?? '', barcode: initial?.barcode ?? '',
    price: initial?.price ?? 0, stock: initial?.stock ?? 0,
    min_stock: initial?.min_stock ?? 0, unit: initial?.unit ?? 'un',
    is_active: initial?.is_active ?? true, is_featured: initial?.is_featured ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      if (initial) await api.put(`/admin/products/${initial.id}`, form);
      else await api.post('/admin/products', form);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao guardar.');
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-xl dark:bg-slate-800 sm:rounded-2xl">
        <h3 className="mb-4 text-base font-bold">{initial ? 'Editar Produto' : 'Novo Produto'}</h3>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input label="Nome" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <Input label="SKU" value={form.sku} onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))} />
          <Input label="Código de Barras" value={form.barcode} onChange={(e) => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="789..." />
          <Input label="Unidade" value={form.unit} onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))} />
          <Input label="Preço" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} required />
          <Input label="Stock" type="number" min="0" value={form.stock} onChange={(e) => setForm(f => ({ ...f, stock: parseFloat(e.target.value) || 0 }))} />
          <Input label="Stock mínimo" type="number" min="0" value={form.min_stock} onChange={(e) => setForm(f => ({ ...f, min_stock: parseFloat(e.target.value) || 0 }))} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
              Activo
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="rounded" />
              Destaque
            </label>
          </div>
          {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={saving}>Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
