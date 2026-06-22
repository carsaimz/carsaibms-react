import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number; name: string; price: number; qty: number; unit: string; sku: string;
}

interface CartState {
  items: CartItem[];
  discount: number;
  add:    (item: Omit<CartItem, 'qty'>) => void;
  remove: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  setDiscount: (d: number) => void;
  clear: () => void;
  total:    () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      add: (item) => set((s) => {
        const exists = s.items.find((i) => i.id === item.id);
        return exists
          ? { items: s.items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) }
          : { items: [...s.items, { ...item, qty: 1 }] };
      }),
      remove:      (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQty:   (id, qty) => set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i) })),
      setDiscount: (d) => set({ discount: d }),
      clear:       () => set({ items: [], discount: 0 }),
      subtotal:    () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      total:       () => Math.max(0, get().subtotal() - get().discount),
    }),
    {
      name: 'carsai-pos-cart',
      // Cart persists in localStorage — survives page refresh at POS
    }
  )
);
