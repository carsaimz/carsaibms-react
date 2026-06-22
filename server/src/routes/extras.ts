import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne, insert, execute } from '../db/connection.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { fromCents, toCents } from '../utils/money.js';
import { sendPushToUser, sendPushToAll } from '../utils/push.js';

const router = Router();

// ══ COUPONS ═══════════════════════════════════════════════════════════════════
router.get('/admin/coupons', requireAuth, requireRole('admin','manager'), asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT * FROM coupons ORDER BY created_at DESC');
  res.json({ success: true, data: rows });
}));
router.post('/admin/coupons', requireAuth, requireRole('admin','manager'), asyncHandler(async (req, res) => {
  const d = z.object({ code:z.string().min(2), type:z.enum(['percent','fixed']), value:z.number().min(0), min_order:z.number().min(0).default(0), max_uses:z.number().int().min(0).default(0), expires_at:z.string().nullable().optional() }).parse(req.body);
  const id = await insert('INSERT INTO coupons (code,type,value,min_order_cents,max_uses,expires_at) VALUES (?,?,?,?,?,?)', [d.code, d.type, d.value, toCents(d.min_order), d.max_uses, d.expires_at||null]);
  res.status(201).json({ success:true, data:{id} });
}));
router.delete('/admin/coupons/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  await execute('DELETE FROM coupons WHERE id=?', [req.params.id]);
  res.json({ success:true });
}));

// ══ SERVICES (admin CRUD) ══════════════════════════════════════════════════════
router.get('/admin/services', requireAuth, requireRole('admin','manager'), asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT s.*, c.name cat_name FROM services s LEFT JOIN categories c ON c.id=s.category_id ORDER BY s.name');
  res.json({ success:true, data: rows.map((s:any) => ({ ...s, price: fromCents(s.price_cents) })) });
}));
router.post('/admin/services', requireAuth, requireRole('admin','manager'), asyncHandler(async (req, res) => {
  const d = z.object({ name:z.string().min(1), price:z.number().min(0), duration:z.number().int().min(0).optional(), description:z.string().optional(), is_active:z.boolean().default(true) }).parse(req.body);
  const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + Date.now();
  const id = await insert('INSERT INTO services (name,slug,price_cents,duration_min,description,is_active) VALUES (?,?,?,?,?,?)', [d.name, slug, toCents(d.price), d.duration||null, d.description||null, d.is_active?1:0]);
  res.status(201).json({ success:true, data:{id} });
}));
router.put('/admin/services/:id', requireAuth, requireRole('admin','manager'), asyncHandler(async (req, res) => {
  const d = z.object({ name:z.string().min(1), price:z.number().min(0), duration:z.number().int().min(0).optional(), description:z.string().optional(), is_active:z.boolean().default(true) }).parse(req.body);
  await execute('UPDATE services SET name=?,price_cents=?,duration_min=?,description=?,is_active=?,updated_at=NOW() WHERE id=?', [d.name, toCents(d.price), d.duration||null, d.description||null, d.is_active?1:0, req.params.id]);
  res.json({ success:true });
}));

// ══ POSTS (admin CRUD) ════════════════════════════════════════════════════════
router.get('/admin/posts', requireAuth, requireRole('admin','manager'), asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT id,slug,title,excerpt,is_published,views,published_at,created_at FROM posts ORDER BY created_at DESC');
  res.json({ success:true, data:rows });
}));
router.post('/admin/posts', requireAuth, requireRole('admin','manager'), asyncHandler(async (req:any, res) => {
  const d = z.object({ title:z.string().min(1), excerpt:z.string().optional(), body:z.string().optional(), is_published:z.boolean().default(false) }).parse(req.body);
  const slug = d.title.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + Date.now();
  const id = await insert('INSERT INTO posts (slug,title,excerpt,body,author_id,is_published,published_at) VALUES (?,?,?,?,?,?,?)',
    [slug, d.title, d.excerpt||null, d.body||null, req.user.uid, d.is_published?1:0, d.is_published?new Date():null]);
  res.status(201).json({ success:true, data:{id} });
}));
router.put('/admin/posts/:id', requireAuth, requireRole('admin','manager'), asyncHandler(async (req:any, res) => {
  const d = z.object({ title:z.string().min(1), excerpt:z.string().optional(), body:z.string().optional(), is_published:z.boolean().default(false) }).parse(req.body);
  const post = await queryOne<any>('SELECT * FROM posts WHERE id=?', [req.params.id]);
  const publishedAt = d.is_published && !post?.published_at ? new Date() : post?.published_at;
  await execute('UPDATE posts SET title=?,excerpt=?,body=?,is_published=?,published_at=?,updated_at=NOW() WHERE id=?',
    [d.title, d.excerpt||null, d.body||null, d.is_published?1:0, publishedAt, req.params.id]);
  res.json({ success:true });
}));

// ══ SUPPLIERS ══════════════════════════════════════════════════════════════════
router.get('/admin/suppliers', requireAuth, requireRole('admin','manager'), asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT * FROM suppliers ORDER BY name');
  res.json({ success:true, data:rows });
}));
router.post('/admin/suppliers', requireAuth, requireRole('admin','manager'), asyncHandler(async (req, res) => {
  const d = z.object({ name:z.string().min(1), email:z.string().email().optional(), phone:z.string().optional(), address:z.string().optional(), nuit:z.string().optional() }).parse(req.body);
  const id = await insert('INSERT INTO suppliers (name,email,phone,address,nuit) VALUES (?,?,?,?,?)', [d.name,d.email||null,d.phone||null,d.address||null,d.nuit||null]);
  res.status(201).json({ success:true, data:{id} });
}));
router.delete('/admin/suppliers/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  await execute('DELETE FROM suppliers WHERE id=?', [req.params.id]);
  res.json({ success:true });
}));

// ══ LOGS ══════════════════════════════════════════════════════════════════════
router.get('/admin/logs', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const { page, perPage, offset } = parsePagination(req.query);
  const total = await queryOne<any>('SELECT COUNT(*) n FROM audit_logs');
  const rows  = await query<any>('SELECT l.*, u.name user_name FROM audit_logs l LEFT JOIN users u ON u.id=l.user_id ORDER BY l.created_at DESC LIMIT ? OFFSET ?', [perPage, offset]);
  res.json({ success:true, data:rows, meta:paginationMeta(Number(total?.n??0), page, perPage) });
}));

// ══ NOTIFICATIONS (admin send) ═════════════════════════════════════════════════
router.get('/admin/notifications', requireAuth, requireRole('admin','manager'), asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT n.*, u.name FROM notifications n LEFT JOIN users u ON u.id=n.user_id ORDER BY n.created_at DESC LIMIT 100');
  res.json({ success:true, data:rows });
}));
router.post('/admin/notifications', requireAuth, requireRole('admin','manager'), asyncHandler(async (req, res) => {
  const d = z.object({ title:z.string().min(1), body:z.string().optional(), user_id:z.number().int().positive().optional() }).parse(req.body);
  if (d.user_id) {
    await insert('INSERT INTO notifications (user_id,title,body) VALUES (?,?,?)', [d.user_id, d.title, d.body||null]);
    sendPushToUser(d.user_id, d.title, d.body||'').catch(()=>{});
  } else {
    const users = await query<any>('SELECT id FROM users WHERE is_active=1');
    for (const u of users) await insert('INSERT INTO notifications (user_id,title,body) VALUES (?,?,?)', [u.id, d.title, d.body||null]);
    sendPushToAll(d.title, d.body||'').catch(()=>{});
  }
  res.json({ success:true, message:'Notificação enviada.' });
}));

// ══ PAGES CMS ══════════════════════════════════════════════════════════════════
router.get('/admin/pages', requireAuth, requireRole('admin','manager'), asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT * FROM pages ORDER BY title');
  res.json({ success:true, data:rows });
}));
router.post('/admin/pages', requireAuth, requireRole('admin','manager'), asyncHandler(async (req, res) => {
  const d = z.object({ title:z.string().min(1), slug:z.string().min(1), content:z.string().optional(), is_published:z.boolean().default(false) }).parse(req.body);
  const id = await insert('INSERT INTO pages (title,slug,content,is_published) VALUES (?,?,?,?)', [d.title, d.slug, d.content||null, d.is_published?1:0]);
  res.status(201).json({ success:true, data:{id} });
}));
router.put('/admin/pages/:id', requireAuth, requireRole('admin','manager'), asyncHandler(async (req, res) => {
  const d = z.object({ title:z.string().min(1), slug:z.string().min(1), content:z.string().optional(), is_published:z.boolean().default(false) }).parse(req.body);
  await execute('UPDATE pages SET title=?,slug=?,content=?,is_published=?,updated_at=NOW() WHERE id=?', [d.title, d.slug, d.content||null, d.is_published?1:0, req.params.id]);
  res.json({ success:true });
}));

// ══ PUBLIC PAGES ════════════════════════════════════════════════════════════════
router.get('/pages/:slug', asyncHandler(async (req, res) => {
  const p = await queryOne<any>('SELECT * FROM pages WHERE slug=? AND is_published=1', [req.params.slug]);
  if (!p) throw new ApiError('Página não encontrada.', 404);
  res.json({ success:true, data:p });
}));

// ══ STOCK ADJUST ══════════════════════════════════════════════════════════════
router.post('/admin/stock/adjust', requireAuth, requireRole('admin','manager','seller'), asyncHandler(async (req:any, res) => {
  const d = z.object({ product_id:z.number().int().positive(), type:z.enum(['add','subtract','set']), qty:z.number().min(0), reason:z.string().optional() }).parse(req.body);
  const product = await queryOne<any>('SELECT * FROM products WHERE id=?', [d.product_id]);
  if (!product) throw new ApiError('Produto não encontrado.', 404);
  let newStock = Number(product.stock);
  if (d.type==='add')      newStock += d.qty;
  else if (d.type==='subtract') newStock = Math.max(0, newStock - d.qty);
  else newStock = d.qty;
  await execute('UPDATE products SET stock=? WHERE id=?', [newStock, d.product_id]);
  await insert('INSERT INTO stock_movements (product_id,type,quantity,reason,user_id) VALUES (?,?,?,?,?)',
    [d.product_id, d.type, d.qty, d.reason||null, req.user.uid]).catch(()=>{});
  res.json({ success:true, data:{ new_stock:newStock } });
}));

// ══ FINANCIAL ══════════════════════════════════════════════════════════════════
router.get('/admin/financial', requireAuth, requireRole('admin','manager'), asyncHandler(async (_req, res) => {
  const [revenue, revenue30, paidOrders, unpaidOrders, payments] = await Promise.all([
    queryOne<any>("SELECT COALESCE(SUM(total_cents),0) v FROM orders WHERE payment_status='paid'"),
    queryOne<any>("SELECT COALESCE(SUM(total_cents),0) v FROM orders WHERE payment_status='paid' AND created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY)"),
    queryOne<any>("SELECT COUNT(*) n FROM orders WHERE payment_status='paid'"),
    queryOne<any>("SELECT COUNT(*) n FROM orders WHERE payment_status='unpaid'"),
    query<any>("SELECT p.*, o.order_number FROM payments p LEFT JOIN orders o ON o.id=p.order_id ORDER BY p.created_at DESC LIMIT 20"),
  ]);
  res.json({ success:true, data:{
    revenue: fromCents(Number(revenue?.v??0)),
    revenue_30d: fromCents(Number(revenue30?.v??0)),
    paid_orders: Number(paidOrders?.n??0),
    unpaid_orders: Number(unpaidOrders?.n??0),
    recent_payments: payments.map((p:any)=>({...p, amount: fromCents(p.amount_cents)})),
  }});
}));

// ══ PAYMENTS (admin list) ══════════════════════════════════════════════════════
router.get('/admin/payments', requireAuth, requireRole('admin','manager'), asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT p.*, o.order_number FROM payments p LEFT JOIN orders o ON o.id=p.order_id ORDER BY p.created_at DESC LIMIT 100');
  res.json({ success:true, data: rows.map((p:any)=>({...p, amount: fromCents(p.amount_cents)})) });
}));

// ══ USERS (admin create) ════════════════════════════════════════════════════════
router.post('/admin/users', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const bcrypt = await import('bcryptjs');
  const d = z.object({ name:z.string().min(2), email:z.string().email(), password:z.string().min(6), role:z.string() }).parse(req.body);
  const exists = await queryOne('SELECT id FROM users WHERE email=?', [d.email]);
  if (exists) throw new ApiError('Email já existe.', 409);
  const hash = await bcrypt.default.hash(d.password, 10);
  const id = await insert('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)', [d.name,d.email,hash,d.role]);
  res.status(201).json({ success:true, data:{id} });
}));

// ══ CUSTOMER PAYMENTS ══════════════════════════════════════════════════════════
router.get('/customer/payments', requireAuth, asyncHandler(async (req:any, res) => {
  const custRow = await queryOne<any>('SELECT id FROM customers WHERE user_id=?', [req.user.uid]);
  if (!custRow) return res.json({ success:true, data:[] });
  const rows = await query<any>('SELECT p.*, o.order_number FROM payments p JOIN orders o ON o.id=p.order_id WHERE o.customer_id=? ORDER BY p.created_at DESC', [custRow.id]);
  res.json({ success:true, data: rows.map((p:any)=>({...p, amount: fromCents(p.amount_cents)})) });
}));

// ══ PUSH TOKENS ════════════════════════════════════════════════════════════
router.post('/customer/push-token', requireAuth, asyncHandler(async (req:any, res) => {
  const d = z.object({ token: z.string().min(1), platform: z.string().default('android') }).parse(req.body);
  await execute('INSERT INTO push_tokens (user_id,token,platform) VALUES (?,?,?) ON DUPLICATE KEY UPDATE platform=VALUES(platform), updated_at=NOW()',
    [req.user.uid, d.token, d.platform]).catch(()=>{});
  res.json({ success:true });
}));

// ══ CUSTOMER QUOTES ════════════════════════════════════════════════════════════
router.post('/customer/quotes', requireAuth, asyncHandler(async (req:any, res) => {
  const d = z.object({ subject:z.string().min(1), items:z.string().min(1), notes:z.string().optional() }).parse(req.body);
  const user = await queryOne<any>('SELECT * FROM users WHERE id=?', [req.user.uid]);
  await insert('INSERT INTO tickets (ticket_number,customer_id,subject,status,priority) SELECT ?,id,?,\'open\',\'medium\' FROM customers WHERE user_id=?',
    ['QT-'+Date.now(), `[ORÇAMENTO] ${d.subject}`, req.user.uid]).catch(()=>{});
  res.json({ success:true, message:'Pedido de orçamento enviado.' });
}));

export default router;
