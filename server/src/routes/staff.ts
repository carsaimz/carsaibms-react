import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne, insert, execute } from '../db/connection.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { fromCents, toCents } from '../utils/money.js';

const router = Router();
router.use(requireAuth, requireRole('admin', 'manager', 'seller', 'staff'));

// ══ TASKS ════════════════════════════════════════════════════════════════════
router.get('/tasks', asyncHandler(async (req: any, res) => {
  const rows = await query<any>(
    'SELECT * FROM tasks WHERE assigned_to=? OR assigned_to IS NULL ORDER BY is_done ASC, priority DESC, deadline IS NULL ASC, deadline ASC',
    [req.user.uid]
  );
  res.json({ success: true, data: rows });
}));

router.post('/tasks', asyncHandler(async (req: any, res) => {
  const { title, priority, deadline } = z.object({
    title:    z.string().min(1).max(220),
    priority: z.enum(['low','medium','high']).optional().default('medium'),
    deadline: z.string().nullable().optional(),
  }).parse(req.body);

  const id = await insert(
    'INSERT INTO tasks (title, priority, deadline, assigned_to) VALUES (?,?,?,?)',
    [title, priority, deadline || null, req.user.uid]
  );
  res.status(201).json({ success: true, data: { id } });
}));

router.put('/tasks/:id', asyncHandler(async (req: any, res) => {
  const { is_done, title, priority, deadline } = req.body;
  await execute(
    'UPDATE tasks SET is_done=?, title=COALESCE(?,title), priority=COALESCE(?,priority), deadline=COALESCE(?,deadline) WHERE id=? AND assigned_to=?',
    [is_done ? 1 : 0, title || null, priority || null, deadline || null, req.params.id, req.user.uid]
  );
  res.json({ success: true });
}));

router.delete('/tasks/:id', asyncHandler(async (req: any, res) => {
  await execute('DELETE FROM tasks WHERE id=? AND assigned_to=?', [req.params.id, req.user.uid]);
  res.json({ success: true });
}));

// ══ SALES (POS) ══════════════════════════════════════════════════════════════
const saleItemSchema = z.object({
  product_id: z.number().int().positive(),
  name:       z.string(),
  qty:        z.number().positive(),
  unit_price: z.number().min(0),
});

router.post('/sales', asyncHandler(async (req: any, res) => {
  const { items, payment_method, discount, total } = z.object({
    items:          z.array(saleItemSchema).min(1),
    payment_method: z.string().default('cash'),
    discount:       z.number().min(0).default(0),
    total:          z.number().min(0),
  }).parse(req.body);

  const saleNum = 'VND-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.qty, 0);

  const saleId = await insert(
    `INSERT INTO sales (sale_number, seller_id, subtotal_cents, discount_cents, total_cents, payment_method, payment_status)
     VALUES (?,?,?,?,?,?,'paid')`,
    [saleNum, req.user.uid, toCents(subtotal), toCents(discount), toCents(total), payment_method]
  );

  for (const item of items) {
    await insert(
      'INSERT INTO sale_items (sale_id, product_id, name, quantity, unit_price_cents, total_cents) VALUES (?,?,?,?,?,?)',
      [saleId, item.product_id, item.name, item.qty, toCents(item.unit_price), toCents(item.unit_price * item.qty)]
    );
    // Decrement stock
    await execute('UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id=?',
      [item.qty, item.qty, item.product_id]);
  }

  res.status(201).json({
    success: true,
    data: { id: saleId, sale_number: saleNum, total: fromCents(toCents(total)) },
  });
}));

router.get('/sales', asyncHandler(async (req: any, res) => {
  const { page, perPage, offset } = parsePagination(req.query);
  const isAdmin = ['admin','manager'].includes(req.user.role);
  const where = isAdmin ? '' : 'WHERE s.seller_id=?';
  const params: any[] = isAdmin ? [] : [req.user.uid];

  const total = await queryOne<any>(`SELECT COUNT(*) n FROM sales s ${where}`, params);
  const rows  = await query<any>(
    `SELECT s.*, u.name seller_name FROM sales s
     LEFT JOIN users u ON u.id=s.seller_id ${where}
     ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  res.json({
    success: true,
    data: rows.map((r: any) => ({
      ...r, total: fromCents(r.total_cents), subtotal: fromCents(r.subtotal_cents), discount: fromCents(r.discount_cents),
    })),
    meta: paginationMeta(Number(total?.n ?? 0), page, perPage),
  });
}));

router.get('/sales/:id', asyncHandler(async (req: any, res) => {
  const sale = await queryOne<any>('SELECT s.*, u.name seller_name FROM sales s LEFT JOIN users u ON u.id=s.seller_id WHERE s.id=?', [req.params.id]);
  if (!sale) throw new ApiError('Venda não encontrada.', 404);
  const items = await query<any>('SELECT * FROM sale_items WHERE sale_id=?', [sale.id]);
  res.json({
    success: true,
    data: {
      ...sale, total: fromCents(sale.total_cents), subtotal: fromCents(sale.subtotal_cents),
      items: items.map((i: any) => ({ ...i, unit_price: fromCents(i.unit_price_cents), total: fromCents(i.total_cents) })),
    },
  });
}));

export default router;
