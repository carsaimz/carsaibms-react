import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { formatMoney } from '../../lib/format';

interface Item { id: number; name: string; price: number; qty: number; }

export default function AdminOrderNew() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [error, setError] = useState<string | null>(null);

  const { data: products } = useQuery({
    queryKey: ['admin-products-search', search],
    queryFn: () => api.get<{ data: any[] }>(`/admin/products?search=${encodeURIComponent(search)}&per_page=8`),
    enabled: search.length >= 2,
  });

  const { data: customers } = useQuery({
    queryKey: ['admin-customers-search', customerSearch],
    queryFn: () => api.get<{ data: any[] }>(`/admin/customers?search=${encodeURIComponent(customerSearch)}&per_page=6`),
    enabled: customerSearch.length >= 2,
  });

  function addProduct(p: any) {
    setItems(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
    setSearch('');
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const submit = useMutation({
    mutationFn: () => api.post('/admin/orders', {
      customer_id: customerId,
      items: items.map(i => ({ product_id: i.id, name: i.name, qty: i.qty, unit_price: i.price })),
      payment_method: method,
      notes: notes || null,
    }),
    onSuccess: (res: any) => navigate(`/admin/orders/${res.data.id}`),
    onError: (err) => setError(err instanceof ApiClientError ? err.message : 'Erro ao criar pedido.'),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Novo Pedido</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {customerId ? (
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800/40 dark:bg-green-900/20">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">{customerName}</span>
                <button onClick={() => { setCustomerId(null); setCustomerName(''); }} className="text-xs text-gray-400 hover:text-red-500">Remover</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Pesquisar cliente..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm dark:border-slate-600 dark:bg-slate-900" />
                </div>
                {customers?.data && customers.data.length > 0 && (
                  <div className="rounded-lg border border-gray-200 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-800">
                    {customers.data.map((c: any) => (
                      <button key={c.id} onClick={() => { setCustomerId(c.id); setCustomerName(c.name); setCustomerSearch(''); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-gray-400">{c.email}</p></div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Produtos</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar produto..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm dark:border-slate-600 dark:bg-slate-900" />
            </div>
            {products?.data && products.data.length > 0 && (
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-800 max-h-48 overflow-y-auto">
                {products.data.map((p: any) => (
                  <button key={p.id} onClick={() => addProduct(p)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-gray-400">{p.sku}</p></div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{formatMoney(p.price)}</span>
                      <Plus className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {items.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Itens ({items.length})</CardTitle></CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <p className="flex-1 text-sm font-medium">{item.name}</p>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setItems(p => p.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                      className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 dark:bg-slate-700"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => setItems(p => p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}
                      className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 dark:bg-slate-700"><Plus className="h-3 w-3" /></button>
                  </div>
                  <span className="w-24 text-right font-bold text-sm">{formatMoney(item.price * item.qty)}</span>
                  <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 font-black text-base">
                <span>Total</span><span className="text-primary-600">{formatMoney(subtotal)}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Finalizar</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Método de Pagamento</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
                <option value="mpesa">M-Pesa</option>
                <option value="emola">e-Mola</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Cartão (Stripe)</option>
                <option value="cash">Numerário</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Notas</label>
              <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={() => submit.mutate()} loading={submit.isPending} icon={<ShoppingCart className="h-4 w-4" />}>
              Criar Pedido — {formatMoney(subtotal)}
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
