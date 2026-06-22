import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Plus, Minus, Trash2, CreditCard, Printer, ShoppingBag, X, CheckCircle, ScanLine } from 'lucide-react';
import { scanBarcode } from '../../lib/native/barcode';
import { isNative } from '../../lib/native/capacitor';
import { api, ApiClientError } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import { db, type PendingAction } from '../../lib/db';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface CartItem {
  id: number; name: string; price: number; qty: number; unit: string; sku: string;
}
interface Product {
  id: number; pname: string; price: number; stock: number; unit: string; sku: string; barcode?: string; image?: string;
}

const METHODS = [
  { id: 'cash',     label: 'Numerário',    icon: '💵' },
  { id: 'mpesa',    label: 'M-Pesa',       icon: '📱' },
  { id: 'emola',    label: 'e-Mola',       icon: '📱' },
  { id: 'card',     label: 'Cartão',       icon: '💳' },
  { id: 'transfer', label: 'Transferência',icon: '🏦' },
];

export default function POS() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [method, setMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const online = useOnlineStatus();

  const { data: products } = useQuery({
    queryKey: ['pos-products', search],
    queryFn: () => api.get<{ data: Product[] }>(`/products?per_page=40&search=${encodeURIComponent(search)}`),
    staleTime: 30_000,
  });

  const submitSale = useMutation({
    mutationFn: (payload: any) => api.post('/staff/sales', payload),
  });

  const addToCart = useCallback((p: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === p.id);
      if (exists) {
        if (exists.qty >= p.stock) return prev;
        return prev.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: p.id, name: p.pname, price: p.price, qty: 1, unit: p.unit, sku: p.sku }];
    });
  }, []);

  const updateQty = (id: number, delta: number) =>
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  const removeItem = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => { setCart([]); setDiscount(0); setAmountPaid(''); setShowPayment(false); };

  async function handleScan() {
    const code = await scanBarcode();
    if (!code) return;
    try {
      const res = await api.get<{ data: Product[] }>(`/products?search=${encodeURIComponent(code)}&per_page=1`);
      const found = res.data[0];
      if (found) {
        addToCart(found);
      } else {
        setSearch(code); // fall back to showing as search term
      }
    } catch { /* ignore */ }
  }

  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total     = Math.max(0, subtotal - discount);
  const change    = Math.max(0, (parseFloat(amountPaid) || 0) - total);

  async function handleCheckout() {
    if (!cart.length) return;
    const payload = {
      items: cart.map((i) => ({ product_id: i.id, name: i.name, qty: i.qty, unit_price: i.price })),
      payment_method: method,
      discount,
      total,
    };

    if (!online) {
      await db.pendingActions.add({ type: 'create_ticket' as PendingAction['type'], payload, created_at: Date.now() });
      setLastSale({ ...payload, offline: true, sale_number: 'OFF-' + Date.now() });
      clearCart();
      return;
    }

    try {
      const res = await submitSale.mutateAsync(payload);
      setLastSale(res);
      clearCart();
    } catch (err) {
      alert(err instanceof ApiClientError ? err.message : 'Erro ao processar venda.');
    }
  }

  function printReceipt() {
    window.print();
  }

  if (lastSale) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-green-700">Venda Concluída!</h2>
        {lastSale.offline && <p className="text-sm text-amber-600 font-semibold mt-1">⚠ Offline — será sincronizada ao reconectar</p>}
        {lastSale.sale_number && <p className="text-gray-500 mt-1">Ref: {lastSale.sale_number}</p>}
        <p className="text-3xl font-black mt-3">{formatMoney(lastSale.total ?? total)}</p>
        {method === 'cash' && amountPaid && (
          <p className="text-lg text-green-600 font-bold">Troco: {formatMoney(change)}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={printReceipt} className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold hover:bg-gray-50">
          <Printer className="h-4 w-4" /> Imprimir Recibo
        </button>
        <button onClick={() => { setLastSale(null); setTimeout(() => searchRef.current?.focus(), 100); }}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" /> Nova Venda
        </button>
      </div>

      {/* Print-only receipt */}
      <div className="hidden print:block fixed inset-0 bg-white p-6 text-left text-sm">
        <h2 className="text-lg font-black mb-1">Carsai BMS</h2>
        <p className="text-xs text-gray-500 mb-3">{new Date().toLocaleString('pt-MZ')}</p>
        <hr className="mb-3" />
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between mb-1">
            <span>{item.name} × {item.qty}</span>
            <span>{formatMoney(item.price * item.qty)}</span>
          </div>
        ))}
        <hr className="my-2" />
        {discount > 0 && <div className="flex justify-between"><span>Desconto</span><span>- {formatMoney(discount)}</span></div>}
        <div className="flex justify-between font-black text-base mt-1"><span>TOTAL</span><span>{formatMoney(lastSale?.total ?? total)}</span></div>
        {method === 'cash' && amountPaid && (
          <div className="flex justify-between mt-1"><span>Pago</span><span>{formatMoney(parseFloat(amountPaid))}</span></div>
        )}
        {change > 0 && <div className="flex justify-between font-bold"><span>Troco</span><span>{formatMoney(change)}</span></div>}
        <hr className="my-3" />
        <p className="text-center text-xs">Obrigado pela sua preferência!</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4.5rem)] gap-4 overflow-hidden">
      {/* ── Left: Product search & grid ─────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar produto, SKU ou código de barras..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              autoFocus />
          </div>
          <button onClick={handleScan}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 transition-colors dark:bg-primary-600 dark:hover:bg-primary-700">
            <ScanLine className="h-4 w-4" />
            <span className="hidden sm:inline">{isNative ? 'Scan' : 'Código'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {(products?.data ?? []).map((p) => (
              <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0}
                className={`flex flex-col rounded-xl border p-3 text-left transition-all hover:border-primary-400 hover:shadow-sm active:scale-95 ${
                  p.stock <= 0 ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50' : 'border-gray-200 bg-white hover:bg-primary-50 dark:border-slate-700 dark:bg-slate-800'
                }`}>
                {p.image
                  ? <img src={p.image} alt={p.pname} className="mb-2 aspect-square w-full rounded-lg object-cover" />
                  : <div className="mb-2 flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700"><ShoppingBag className="h-6 w-6 text-gray-300" /></div>
                }
                <p className="text-xs font-bold line-clamp-2 leading-tight">{p.pname}</p>
                <p className="mt-1 text-xs text-gray-400">{p.sku}</p>
                <p className="mt-1 font-black text-primary-600">{formatMoney(p.price)}</p>
                <p className={`text-[10px] font-semibold ${p.stock <= 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-green-600'}`}>
                  {p.stock <= 0 ? 'Esgotado' : `${p.stock} ${p.unit}`}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Cart ──────────────────────────────────────────────── */}
      <div className="flex w-80 flex-col rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary-600" />
            <span className="font-bold text-sm">Carrinho</span>
            {cart.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-500">Limpar</button>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              <div className="text-center">
                <ShoppingBag className="mx-auto mb-2 h-8 w-8 opacity-30" />
                Toque num produto para adicionar
              </div>
            </div>
          ) : cart.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-slate-700/50">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold line-clamp-1">{item.name}</p>
                <p className="text-xs text-primary-600 font-semibold">{formatMoney(item.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.id, -1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-slate-600">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-slate-600">
                  <Plus className="h-3 w-3" />
                </button>
                <button onClick={() => removeItem(item.id)} className="ml-1 text-gray-300 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 dark:border-slate-700 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Desconto</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">MT</span>
                <input type="number" min="0" max={subtotal} value={discount || ''}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 rounded border border-gray-200 px-2 py-0.5 text-right text-sm dark:border-slate-600 dark:bg-slate-900" />
              </div>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-1.5 font-black text-base dark:border-slate-700">
              <span>TOTAL</span>
              <span className="text-primary-600">{formatMoney(total)}</span>
            </div>
          </div>
        )}

        {/* Payment */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-3 dark:border-slate-700">
            {!showPayment ? (
              <button onClick={() => setShowPayment(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors">
                <CreditCard className="h-4 w-4" /> Cobrar {formatMoney(total)}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Método</span>
                  <button onClick={() => setShowPayment(false)}>
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {METHODS.map((m) => (
                    <button key={m.id} onClick={() => setMethod(m.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
                        method === m.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                      <span>{m.icon}</span> {m.label}
                    </button>
                  ))}
                </div>
                {method === 'cash' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Valor entregue</label>
                    <input type="number" min={total} step="any" value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-right font-bold dark:border-slate-600 dark:bg-slate-900"
                      placeholder={formatMoney(total)} autoFocus />
                    {change > 0 && (
                      <p className="text-right text-sm font-bold text-green-600">Troco: {formatMoney(change)}</p>
                    )}
                  </div>
                )}
                <button onClick={handleCheckout} disabled={submitSale.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60 transition-colors">
                  {submitSale.isPending ? 'A processar...' : <><CheckCircle className="h-4 w-4" /> Confirmar Venda</>}
                </button>
                {!online && <p className="text-center text-xs text-amber-600">📵 Offline — venda será guardada localmente</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
