import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne, insert, execute } from '../db/connection.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { fromCents, toCents } from '../utils/money.js';
import { sendPushToUser } from '../utils/push.js';

const router = Router();

// All admin routes: Admin or Manager only
router.use(requireAuth, requireRole('admin', 'manager'));

// ── DASHBOARD STATS ──────────────────────────────────────────────────────────
router.get('/dashboard', asyncHandler(async (_req, res) => {
  const [orders, revenue, customers, products, lowStock, pendingTickets, recentOrders] = await Promise.all([
    queryOne<any>("SELECT COUNT(*) n FROM orders WHERE DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY)"),
    queryOne<any>("SELECT COALESCE(SUM(total_cents),0) v FROM orders WHERE payment_status='paid' AND DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY)"),
    queryOne<any>("SELECT COUNT(*) n FROM customers"),
    queryOne<any>("SELECT COUNT(*) n FROM products WHERE is_active=1"),
    queryOne<any>("SELECT COUNT(*) n FROM products WHERE stock <= min_stock AND is_active=1 AND min_stock > 0"),
    queryOne<any>("SELECT COUNT(*) n FROM tickets WHERE status IN ('open','pending')"),
    query<any>("SELECT o.*, c.id cust_id, u.name cust_name FROM orders o LEFT JOIN customers c ON c.id=o.customer_id LEFT JOIN users u ON u.id=c.user_id ORDER BY o.created_at DESC LIMIT 8"),
  ]);
  res.json({
    success: true,
    data: {
      orders_30d:    Number(orders?.n ?? 0),
      revenue_30d:   fromCents(Number(revenue?.v ?? 0)),
      total_customers: Number(customers?.n ?? 0),
      active_products: Number(products?.n ?? 0),
      low_stock_count: Number(lowStock?.n ?? 0),
      pending_tickets: Number(pendingTickets?.n ?? 0),
      recent_orders: recentOrders.map((o: any) => ({
        id: o.id, order_number: o.order_number, status: o.status,
        payment_status: o.payment_status, total: fromCents(o.total_cents),
        currency: o.currency, customer_name: o.cust_name || 'Visitante',
        created_at: o.created_at,
      })),
    },
  });
}));

// ══ PRODUCTS ═══════════════════════════════════════════════════════════════════
router.get('/products', asyncHandler(async (req, res) => {
  const { page, perPage, offset } = parsePagination(req.query);
  const search = (req.query.search as string) || '';
  const catId  = req.query.category ? Number(req.query.category) : null;

  const where: string[] = [];
  const params: any[] = [];
  if (search) { where.push('(p.name LIKE ? OR p.sku LIKE ? OR p.barcode = ?)'); params.push(`%${search}%`, `%${search}%`, search); }
  if (catId)  { where.push('p.category_id = ?'); params.push(catId); }
  const wClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = await queryOne<any>(`SELECT COUNT(*) n FROM products p ${wClause}`, params);
  const rows  = await query<any>(
    `SELECT p.*, c.name cat_name FROM products p LEFT JOIN categories c ON c.id=p.category_id ${wClause} ORDER BY p.name ASC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );
  res.json({
    success: true,
    data: rows.map((p: any) => ({
      id: p.id, sku: p.sku, barcode: p.barcode, name: p.name, slug: p.slug,
      price: fromCents(p.price_cents), cost: fromCents(p.cost_cents),
      stock: Number(p.stock), min_stock: Number(p.min_stock), unit: p.unit,
      image: p.image, is_active: !!p.is_active, is_featured: !!p.is_featured,
      sold_count: p.sold_count, category: p.cat_name || null, category_id: p.category_id,
    })),
    meta: paginationMeta(Number(total?.n ?? 0), page, perPage),
  });
}));

const productSchema = z.object({
  sku: z.string().max(60).optional(),
  barcode: z.string().max(64).optional(),
  name: z.string().min(1).max(180),
  slug: z.string().max(200).optional(),
  short_desc: z.string().max(255).optional(),
  description: z.string().optional(),
  price: z.number().min(0),
  cost: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  min_stock: z.number().min(0).optional(),
  unit: z.string().max(20).optional(),
  category_id: z.number().int().positive().nullable().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

router.post('/products', asyncHandler(async (req, res) => {
  const data = productSchema.parse(req.body);
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = await insert(
    `INSERT INTO products (sku,barcode,name,slug,short_desc,description,price_cents,cost_cents,stock,min_stock,unit,category_id,is_active,is_featured)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [data.sku||null, data.barcode||null, data.name, slug, data.short_desc||null, data.description||null,
     toCents(data.price), toCents(data.cost||0), data.stock||0, data.min_stock||0,
     data.unit||'un', data.category_id||null, data.is_active!==false?1:0, data.is_featured?1:0]
  );
  res.status(201).json({ success: true, data: { id }, message: 'Produto criado.' });
}));

router.put('/products/:id', asyncHandler(async (req, res) => {
  const data = productSchema.parse(req.body);
  await execute(
    `UPDATE products SET sku=?,barcode=?,name=?,short_desc=?,description=?,price_cents=?,cost_cents=?,stock=?,min_stock=?,unit=?,category_id=?,is_active=?,is_featured=?,updated_at=NOW() WHERE id=?`,
    [data.sku||null, data.barcode||null, data.name, data.short_desc||null, data.description||null,
     toCents(data.price), toCents(data.cost||0), data.stock||0, data.min_stock||0,
     data.unit||'un', data.category_id||null, data.is_active!==false?1:0, data.is_featured?1:0, req.params.id]
  );
  res.json({ success: true, message: 'Produto actualizado.' });
}));

router.delete('/products/:id', asyncHandler(async (req, res) => {
  await execute('UPDATE products SET is_active=0 WHERE id=?', [req.params.id]);
  res.json({ success: true, message: 'Produto desactivado.' });
}));

// ══ ORDERS ════════════════════════════════════════════════════════════════════
router.get('/orders', asyncHandler(async (req, res) => {
  const { page, perPage, offset } = parsePagination(req.query);
  const search  = (req.query.search as string) || '';
  const status  = (req.query.status as string) || '';
  const payStatus = (req.query.payment_status as string) || '';

  const where: string[] = [];
  const params: any[] = [];
  if (search) { where.push('(o.order_number LIKE ? OR u.name LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (status)    { where.push('o.status = ?'); params.push(status); }
  if (payStatus) { where.push('o.payment_status = ?'); params.push(payStatus); }
  const wClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = await queryOne<any>(
    `SELECT COUNT(*) n FROM orders o LEFT JOIN customers c ON c.id=o.customer_id LEFT JOIN users u ON u.id=c.user_id ${wClause}`,
    params
  );
  const rows = await query<any>(
    `SELECT o.*, u.name cust_name, u.email cust_email FROM orders o
     LEFT JOIN customers c ON c.id=o.customer_id
     LEFT JOIN users u ON u.id=c.user_id
     ${wClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );
  res.json({
    success: true,
    data: rows.map((o: any) => ({
      id: o.id, order_number: o.order_number, status: o.status,
      payment_status: o.payment_status, payment_method: o.payment_method,
      total: fromCents(o.total_cents), currency: o.currency,
      customer_name: o.cust_name || 'Visitante', customer_email: o.cust_email || null,
      source: o.source, created_at: o.created_at,
    })),
    meta: paginationMeta(Number(total?.n ?? 0), page, perPage),
  });
}));

router.get('/orders/:id', asyncHandler(async (req, res) => {
  const order = await queryOne<any>(
    `SELECT o.*, u.name cust_name, u.email cust_email, u.phone cust_phone FROM orders o
     LEFT JOIN customers c ON c.id=o.customer_id
     LEFT JOIN users u ON u.id=c.user_id
     WHERE o.id=?`, [req.params.id]
  );
  if (!order) throw new ApiError('Pedido não encontrado.', 404);
  const items = await query<any>('SELECT * FROM order_items WHERE order_id=?', [order.id]);
  const payments = await query<any>('SELECT * FROM payments WHERE order_id=? ORDER BY created_at DESC', [order.id]);
  res.json({
    success: true,
    data: {
      id: order.id, order_number: order.order_number, status: order.status,
      payment_status: order.payment_status, payment_method: order.payment_method,
      subtotal: fromCents(order.subtotal_cents), discount: fromCents(order.discount_cents),
      tax: fromCents(order.tax_cents), shipping: fromCents(order.shipping_cents),
      total: fromCents(order.total_cents), currency: order.currency,
      delivery_address: order.delivery_address, notes: order.notes,
      source: order.source, created_at: order.created_at,
      customer: { name: order.cust_name, email: order.cust_email, phone: order.cust_phone },
      items: items.map((i: any) => ({
        id: i.id, name: i.name, quantity: Number(i.quantity),
        unit_price: fromCents(i.unit_price_cents), total: fromCents(i.total_cents),
      })),
      payments: payments.map((p: any) => ({
        id: p.id, method: p.method, amount: fromCents(p.amount_cents),
        reference: p.reference, status: p.status, created_at: p.created_at,
      })),
    },
  });
}));

router.put('/orders/:id/status', asyncHandler(async (req, res) => {
  const { status } = z.object({ status: z.string() }).parse(req.body);
  await execute('UPDATE orders SET status=?,updated_at=NOW() WHERE id=?', [status, req.params.id]);
  res.json({ success: true, message: 'Estado actualizado.' });
}));

router.put('/orders/:id/payment', asyncHandler(async (req, res) => {
  const { payment_status } = z.object({ payment_status: z.string() }).parse(req.body);
  await execute('UPDATE orders SET payment_status=?,updated_at=NOW() WHERE id=?', [payment_status, req.params.id]);

  if (payment_status === 'paid') {
    const order = await queryOne<any>(
      `SELECT o.order_number, u.id user_id FROM orders o
       LEFT JOIN customers c ON c.id=o.customer_id LEFT JOIN users u ON u.id=c.user_id
       WHERE o.id=?`, [req.params.id]
    );
    if (order?.user_id) {
      sendPushToUser(order.user_id, 'Pagamento Confirmado', `O pagamento do pedido ${order.order_number} foi confirmado.`, `/orders/${req.params.id}`).catch(()=>{});
    }
  }

  res.json({ success: true, message: 'Estado de pagamento actualizado.' });
}));

// ══ CUSTOMERS ═════════════════════════════════════════════════════════════════
router.get('/customers', asyncHandler(async (req, res) => {
  const { page, perPage, offset } = parsePagination(req.query);
  const search = (req.query.search as string) || '';
  const where = search ? "WHERE u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?" : '';
  const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
  const total = await queryOne<any>(
    `SELECT COUNT(*) n FROM users u LEFT JOIN customers c ON c.user_id=u.id ${where} AND u.role='customer'`,
    params
  );
  const rows = await query<any>(
    `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.last_login_at, u.created_at,
            c.company, c.city, c.country,
            (SELECT COUNT(*) FROM orders o JOIN customers cc ON cc.id=o.customer_id WHERE cc.user_id=u.id) order_count
     FROM users u LEFT JOIN customers c ON c.user_id=u.id
     ${where} ${where ? 'AND' : 'WHERE'} u.role='customer'
     ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );
  res.json({ success: true, data: rows, meta: paginationMeta(Number(total?.n ?? 0), page, perPage) });
}));

// ══ CATEGORIES ════════════════════════════════════════════════════════════════
router.get('/categories', asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT * FROM categories ORDER BY type, sort_order, name');
  res.json({ success: true, data: rows });
}));

router.post('/categories', asyncHandler(async (req, res) => {
  const { type, name, parent_id } = z.object({ type: z.enum(['product','service']), name: z.string().min(1), parent_id: z.number().nullable().optional() }).parse(req.body);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
  const id = await insert('INSERT INTO categories (type,name,slug,parent_id) VALUES (?,?,?,?)', [type, name, slug, parent_id||null]);
  res.status(201).json({ success: true, data: { id }, message: 'Categoria criada.' });
}));

// ══ TICKETS (admin view) ══════════════════════════════════════════════════════
router.get('/tickets', asyncHandler(async (req, res) => {
  const { page, perPage, offset } = parsePagination(req.query);
  const status = (req.query.status as string) || '';
  const where = status ? 'WHERE t.status=?' : '';
  const params = status ? [status] : [];
  const total = await queryOne<any>(`SELECT COUNT(*) n FROM tickets t ${where}`, params);
  const rows = await query<any>(
    `SELECT t.*, u.name cust_name, u.email cust_email,
            (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket_id=t.id) msg_count
     FROM tickets t JOIN customers c ON c.id=t.customer_id JOIN users u ON u.id=c.user_id
     ${where} ORDER BY t.updated_at DESC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );
  res.json({ success: true, data: rows, meta: paginationMeta(Number(total?.n ?? 0), page, perPage) });
}));

router.put('/tickets/:id/status', asyncHandler(async (req, res) => {
  const { status } = z.object({ status: z.string() }).parse(req.body);
  await execute('UPDATE tickets SET status=?,updated_at=NOW() WHERE id=?', [status, req.params.id]);
  res.json({ success: true });
}));

router.post('/tickets/:id/messages', asyncHandler(async (req: any, res) => {
  const { body } = z.object({ body: z.string().min(1) }).parse(req.body);
  await insert('INSERT INTO ticket_messages (ticket_id,user_id,body) VALUES (?,?,?)', [req.params.id, req.user.uid, body]);
  await execute('UPDATE tickets SET updated_at=NOW() WHERE id=?', [req.params.id]);
  res.status(201).json({ success: true });
}));

// ══ USERS (admin only) ════════════════════════════════════════════════════════
router.get('/users', requireRole('admin'), asyncHandler(async (req, res) => {
  const { page, perPage, offset } = parsePagination(req.query);
  const search = (req.query.search as string) || '';
  const where = search ? "WHERE name LIKE ? OR email LIKE ?" : '';
  const params = search ? [`%${search}%`, `%${search}%`] : [];
  const total = await queryOne<any>(`SELECT COUNT(*) n FROM users ${where}`, params);
  const rows = await query<any>(
    `SELECT id,name,email,phone,role,is_active,last_login_at,created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );
  res.json({ success: true, data: rows, meta: paginationMeta(Number(total?.n ?? 0), page, perPage) });
}));

router.put('/users/:id/active', requireRole('admin'), asyncHandler(async (req, res) => {
  const { is_active } = z.object({ is_active: z.boolean() }).parse(req.body);
  await execute('UPDATE users SET is_active=? WHERE id=?', [is_active?1:0, req.params.id]);
  res.json({ success: true });
}));

// ══ SETTINGS ══════════════════════════════════════════════════════════════════
router.get('/settings', requireRole('admin'), asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT `key`, `value` FROM settings');
  const obj: Record<string, string> = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json({ success: true, data: obj });
}));

router.post('/settings', requireRole('admin'), asyncHandler(async (req, res) => {
  const updates = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(updates)) {
    await execute('INSERT INTO settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?', [key, value, value]);
  }
  res.json({ success: true, message: 'Definições guardadas.' });
}));

// ══ REPORTS ═══════════════════════════════════════════════════════════════════
router.get('/reports/revenue', asyncHandler(async (req, res) => {
  const period = (req.query.period as string) || '30d';
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const rows = await query<any>(
    `SELECT DATE(created_at) d, COUNT(*) n, COALESCE(SUM(total_cents),0) rev
     FROM orders WHERE payment_status='paid' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY DATE(created_at) ORDER BY d ASC`,
    [days]
  );
  res.json({
    success: true,
    data: rows.map((r: any) => ({ date: r.d, orders: Number(r.n), revenue: fromCents(Number(r.rev)) })),
  });
}));

router.get('/reports/top-products', asyncHandler(async (_req, res) => {
  const rows = await query<any>(
    `SELECT p.name, p.sku, COALESCE(SUM(oi.quantity),0) qty, COALESCE(SUM(oi.total_cents),0) rev
     FROM order_items oi JOIN products p ON p.id=oi.product_id
     GROUP BY oi.product_id ORDER BY qty DESC LIMIT 10`
  );
  res.json({ success: true, data: rows.map((r: any) => ({ ...r, revenue: fromCents(Number(r.rev)), qty: Number(r.qty) })) });
}));

router.get('/reports/stock', asyncHandler(async (_req, res) => {
  const rows = await query<any>(
    `SELECT id, sku, name, stock, min_stock, unit,
            CASE WHEN stock <= 0 THEN 'out' WHEN min_stock > 0 AND stock <= min_stock THEN 'low' ELSE 'ok' END status
     FROM products WHERE is_active=1 ORDER BY stock ASC`
  );
  res.json({ success: true, data: rows });
}));

export default router;
