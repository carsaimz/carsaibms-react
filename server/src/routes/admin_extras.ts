import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne, insert, execute } from '../db/connection.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { fromCents, toCents } from '../utils/money.js';

const router = Router();
const auth = [requireAuth, requireRole('admin', 'manager')];

// ══ BANNERS ══════════════════════════════════════════════════════════════════
router.get('/admin/banners', ...auth, asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT * FROM banners ORDER BY sort_order, id');
  res.json({ success: true, data: rows });
}));
router.post('/admin/banners', ...auth, asyncHandler(async (req, res) => {
  const d = z.object({ title:z.string().min(1), subtitle:z.string().optional(), image_url:z.string().url(), link_url:z.string().optional(), is_active:z.boolean().default(true) }).parse(req.body);
  const id = await insert('INSERT INTO banners (title,subtitle,image_url,link_url,is_active) VALUES (?,?,?,?,?)', [d.title,d.subtitle||null,d.image_url,d.link_url||null,d.is_active?1:0]);
  res.status(201).json({ success:true, data:{id} });
}));
router.delete('/admin/banners/:id', ...auth, asyncHandler(async (req, res) => {
  await execute('DELETE FROM banners WHERE id=?', [req.params.id]);
  res.json({ success:true });
}));

// ══ ADMIN CREATE ORDER ═══════════════════════════════════════════════════════
router.post('/admin/orders', ...auth, asyncHandler(async (req, res) => {
  const d = z.object({
    customer_id: z.number().int().positive().nullable().optional(),
    items: z.array(z.object({ product_id:z.number().int().positive(), name:z.string(), qty:z.number().positive(), unit_price:z.number().min(0) })).min(1),
    payment_method: z.string().optional(),
    notes: z.string().nullable().optional(),
  }).parse(req.body);

  const subtotalCents = d.items.reduce((s,i) => s + toCents(i.unit_price) * i.qty, 0);
  const orderNum = 'ORD-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);

  const orderId = await insert(
    `INSERT INTO orders (order_number,customer_id,status,payment_status,payment_method,subtotal_cents,total_cents,currency,source)
     VALUES (?,?,'pending','unpaid',?,?,?,'MZN','admin')`,
    [orderNum, d.customer_id||null, d.payment_method||'', subtotalCents, subtotalCents]
  );
  for (const item of d.items) {
    await insert('INSERT INTO order_items (order_id,product_id,name,quantity,unit_price_cents,total_cents) VALUES (?,?,?,?,?,?)',
      [orderId, item.product_id, item.name, item.qty, toCents(item.unit_price), toCents(item.unit_price)*item.qty]);
  }
  res.status(201).json({ success:true, data:{ id:orderId, order_number:orderNum } });
}));

// ══ ADMIN TASKS (all users) ═══════════════════════════════════════════════════
router.get('/admin/tasks', ...auth, asyncHandler(async (_req, res) => {
  const rows = await query<any>(
    `SELECT t.*, u.name assigned_name FROM tasks t LEFT JOIN users u ON u.id=t.assigned_to
     ORDER BY t.is_done ASC, t.priority DESC, t.deadline IS NULL ASC, t.deadline ASC`
  );
  res.json({ success:true, data:rows });
}));

// ══ EXPORT CSV ════════════════════════════════════════════════════════════════
const EXPORTS: Record<string, { sql: string; headers: string[] }> = {
  products: {
    sql: "SELECT sku, barcode, name, price_cents/100 price, cost_cents/100 cost, stock, min_stock, unit, is_active FROM products ORDER BY name",
    headers: ['SKU','Barcode','Nome','Preço','Custo','Stock','Stock Mín','Unidade','Activo'],
  },
  services: {
    sql: "SELECT name, price_cents/100 price, duration_min duration, is_active FROM services ORDER BY name",
    headers: ['Nome','Preço','Duração (min)','Activo'],
  },
  orders: {
    sql: `SELECT o.order_number, u.name customer, o.status, o.payment_status, o.payment_method, o.total_cents/100 total, o.currency, o.created_at
          FROM orders o LEFT JOIN customers c ON c.id=o.customer_id LEFT JOIN users u ON u.id=c.user_id ORDER BY o.created_at DESC`,
    headers: ['Nº Pedido','Cliente','Estado','Estado Pag.','Método','Total','Moeda','Data'],
  },
  customers: {
    sql: `SELECT u.name, u.email, u.phone, c.company, c.nuit, c.city, c.country, u.created_at
          FROM users u LEFT JOIN customers c ON c.user_id=u.id WHERE u.role='customer' ORDER BY u.name`,
    headers: ['Nome','Email','Telefone','Empresa','NUIT','Cidade','País','Registo'],
  },
  payments: {
    sql: `SELECT o.order_number, p.method, p.amount_cents/100 amount, p.reference, p.status, p.created_at
          FROM payments p LEFT JOIN orders o ON o.id=p.order_id ORDER BY p.created_at DESC`,
    headers: ['Pedido','Método','Valor','Referência','Estado','Data'],
  },
  sales: {
    sql: `SELECT s.sale_number, u.name seller, s.payment_method, s.total_cents/100 total, s.payment_status, s.created_at
          FROM sales s LEFT JOIN users u ON u.id=s.seller_id ORDER BY s.created_at DESC`,
    headers: ['Nº Venda','Vendedor','Método','Total','Estado','Data'],
  },
  coupons: {
    sql: "SELECT code, type, value, used_count, max_uses, expires_at, is_active FROM coupons ORDER BY code",
    headers: ['Código','Tipo','Valor','Usos','Máx. Usos','Expira','Activo'],
  },
  suppliers: {
    sql: "SELECT name, email, phone, nuit, address FROM suppliers ORDER BY name",
    headers: ['Nome','Email','Telefone','NUIT','Morada'],
  },
};

router.get('/admin/export/:type', ...auth, asyncHandler(async (req, res) => {
  const exp = EXPORTS[req.params.type];
  if (!exp) throw new ApiError('Tipo de exportação inválido.', 400);
  const rows = await query<any>(exp.sql);

  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g,'""')}"`;
    return s;
  };

  const bom = '\uFEFF'; // UTF-8 BOM for Excel
  const header = exp.headers.map(escape).join(',');
  const csv = rows.map((r: any) => Object.values(r).map(escape).join(',')).join('\n');
  const output = bom + header + '\n' + csv;

  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${req.params.type}-${new Date().toISOString().slice(0,10)}.csv"`);
  res.send(output);
}));

// ══ EMAIL TEST ════════════════════════════════════════════════════════════════
router.post('/admin/emails/test', ...auth, asyncHandler(async (req, res) => {
  const d = z.object({ template:z.string(), to:z.string().email() }).parse(req.body);
  const { sendOrderConfirmation, sendPaymentConfirmation, sendTicketReply, sendWelcome } = await import('../utils/email.js');
  switch (d.template) {
    case 'order_confirmation':  await sendOrderConfirmation(d.to, 'Utilizador Teste', 'ORD-2026-TEST', 'MT 1.499,00'); break;
    case 'payment_confirmation':await sendPaymentConfirmation(d.to,'Utilizador Teste','ORD-2026-TEST','M-Pesa','MT 1.499,00'); break;
    case 'ticket_reply':        await sendTicketReply(d.to,'Utilizador Teste','TKT-2026-TEST','Obrigado pelo seu contacto...'); break;
    case 'welcome':             await sendWelcome(d.to, 'Utilizador Teste'); break;
    default: throw new ApiError('Template desconhecido.', 400);
  }
  res.json({ success:true, message:`Email de teste enviado para ${d.to}` });
}));

export default router;
