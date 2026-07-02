import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Minus, Trash2, ShoppingCart, Search } from 'lucide-react';
import { api, ApiClientError } from '../../lib/api';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatMoney } from '../../lib/format';

interface Item { id: number; name: string; price: number; qty: number; unit: string; }

export default function CustomerOrderNew() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [error, setError] = useState<string | null>(null);

  const { data: products } = useQuery({
    queryKey: ['products-order', search],
    queryFn: () => api.get<{ data: any[] }>(`/products?search=${encodeURIComponent(search)}&per_page=10`),
    enabled: search.length >= 2,
    staleTime: 30_000,
  });

  function addItem(p: any) {
    setItems(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, name: p.pname || p.name, price: p.price, qty: 1, unit: p.unit }];
    });
    setSearch('');
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const submit = useMutation({
    mutationFn: () => api.post('/customer/orders', {
      items: items.map(i => ({ product_id: i.id, name: i.name, qty: i.qty, unit_price: i.price })),
      payment_method: method,
      delivery_address: address || null,
      notes: notes || null,
    }),
    onSuccess: (res: any) => navigate(`/orders/${res.data.id}`),
    onError: (err) => setError(err instanceof ApiClientError ? err.message : 'Erro ao criar pedido.'),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Novo Pedido</h1>

      <Card>
        <CardHeader><CardTitle>Adicionar Produtos</CardTitle></CardHeader>
        <CardBody className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar produto pelo nome ou SKU..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm dark:border-slate-600 dark:bg-slate-900" />
          </div>
          {products?.data && products.data.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-800">
              {products.data.map((p: any) => (
                <button key={p.id} onClick={() => addItem(p)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <div><p className="text-sm font-medium">{p.pname || p.name}</p><p className="text-xs text-gray-400">{p.sku}</p></div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary-600">{formatMoney(p.price)}</span>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Itens do Pedido</CardTitle></CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-primary-600 font-bold">{formatMoney(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setItems(p => p.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                      className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 dark:bg-slate-700"><Minus className="h-3 w-3" /></button>
                    <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => setItems(p => p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}
                      className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 dark:bg-slate-700"><Plus className="h-3 w-3" /></button>
                    <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} className="ml-1 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <span className="w-20 text-right text-sm font-bold">{formatMoney(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 font-black">
                <span>Total</span><span className="text-primary-600">{formatMoney(subtotal)}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Detalhes do Pedido</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Método de Pagamento</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
                <option value="mpesa">M-Pesa</option>
                <option value="emola">e-Mola</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Cartão (Stripe)</option>
                <option value="transfer">Transferência Bancária</option>
              </select>
            </div>
            <Input label="Morada de entrega (opcional)" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, bairro, cidade..." />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Notas (opcional)</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={() => submit.mutate()} loading={submit.isPending} icon={<ShoppingCart className="h-4 w-4" />}>
              Confirmar Pedido — {formatMoney(subtotal)}
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
