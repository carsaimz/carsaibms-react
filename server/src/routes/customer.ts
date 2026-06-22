import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, queryOne, insert, execute } from '../db/connection.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth.js';
import { fromCents } from '../utils/money.js';

const router = Router();

// All routes here require an authenticated customer
router.use(requireAuth, requireRole('customer'));

/** Resolve the customers.id row for the logged-in user */
async function getCustomerId(userId: number): Promise<number> {
  const row = await queryOne<{ id: number }>('SELECT id FROM customers WHERE user_id = ?', [userId]);
  if (!row) throw new ApiError('Perfil de cliente não encontrado.', 404);
  return row.id;
}

/** Reshape an order row: cents -> decimal */
function shapeOrder(o: any) {
  return {
    id: o.id,
    order_number: o.order_number,
    status: o.status,
    payment_status: o.payment_status,
    payment_method: o.payment_method,
    subtotal: fromCents(o.subtotal_cents),
    discount: fromCents(o.discount_cents),
    tax: fromCents(o.tax_cents),
    shipping: fromCents(o.shipping_cents),
    total: fromCents(o.total_cents),
    currency: o.currency,
    delivery_address: o.delivery_address,
    notes: o.notes,
    created_at: o.created_at,
    updated_at: o.updated_at,
  };
}

function shapeItem(i: any) {
  return {
    id: i.id,
    product_id: i.product_id,
    name: i.name,
    quantity: Number(i.quantity),
    unit_price: fromCents(i.unit_price_cents),
    discount: fromCents(i.discount_cents),
    total: fromCents(i.total_cents),
  };
}

// ── GET /api/customer/dashboard ─────────────────────────────────────────────
router.get('/dashboard', asyncHandler(async (req: AuthedRequest, res) => {
  const customerId = await getCustomerId(req.user!.uid);

  const totals = await queryOne<any>(
    `SELECT
       COUNT(*) AS total_orders,
       COALESCE(SUM(CASE WHEN payment_status='unpaid' THEN total_cents ELSE 0 END), 0) AS due_cents,
       COALESCE(SUM(CASE WHEN payment_status='paid'   THEN total_cents ELSE 0 END), 0) AS paid_cents
     FROM orders WHERE customer_id = ?`,
    [customerId]
  );

  const recentOrders = await query<any>(
    `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 5`,
    [customerId]
  );

  const openTickets = await queryOne<any>(
    `SELECT COUNT(*) AS n FROM tickets WHERE customer_id = ? AND status IN ('open','pending')`,
    [customerId]
  );

  const unreadNotifications = await queryOne<any>(
    `SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0`,
    [req.user!.uid]
  );

  res.json({
    success: true,
    data: {
      total_orders: Number(totals?.total_orders ?? 0),
      amount_due: fromCents(totals?.due_cents ?? 0),
      amount_paid: fromCents(totals?.paid_cents ?? 0),
      open_tickets: Number(openTickets?.n ?? 0),
      unread_notifications: Number(unreadNotifications?.n ?? 0),
      recent_orders: recentOrders.map(shapeOrder),
    },
  });
}));

// ── GET /api/customer/orders ─────────────────────────────────────────────────
router.get('/orders', asyncHandler(async (req: AuthedRequest, res) => {
  const customerId = await getCustomerId(req.user!.uid);
  const page    = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.min(50, Math.max(1, Number(req.query.per_page) || 10));
  const offset  = (page - 1) * perPage;
  const status  = (req.query.status as string) || '';

  const where: string[] = ['customer_id = ?'];
  const params: any[] = [customerId];
  if (status) { where.push('status = ?'); params.push(status); }

  const total = await queryOne<any>(
    `SELECT COUNT(*) AS n FROM orders WHERE ${where.join(' AND ')}`, params
  );

  const rows = await query<any>(
    `SELECT * FROM orders WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  res.json({
    success: true,
    data: rows.map(shapeOrder),
    meta: {
      total: Number(total?.n ?? 0),
      per_page: perPage,
      current_page: page,
      last_page: Math.max(1, Math.ceil(Number(total?.n ?? 0) / perPage)),
    },
  });
}));

// ── GET /api/customer/orders/:id ──────────────────────────────────────────────
router.get('/orders/:id', asyncHandler(async (req: AuthedRequest, res) => {
  const customerId = await getCustomerId(req.user!.uid);
  const order = await queryOne<any>(
    'SELECT * FROM orders WHERE id = ? AND customer_id = ?',
    [req.params.id, customerId]
  );
  if (!order) throw new ApiError('Pedido não encontrado.', 404);

  const items = await query<any>('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  const payments = await query<any>('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC', [order.id]);

  res.json({
    success: true,
    data: {
      ...shapeOrder(order),
      items: items.map(shapeItem),
      payments: payments.map((p) => ({
        id: p.id,
        method: p.method,
        amount: fromCents(p.amount_cents),
        reference: p.reference,
        status: p.status,
        created_at: p.created_at,
      })),
    },
  });
}));

// ── GET /api/customer/tickets ────────────────────────────────────────────────
router.get('/tickets', asyncHandler(async (req: AuthedRequest, res) => {
  const customerId = await getCustomerId(req.user!.uid);
  const page    = Math.max(1, Number(req.query.page) || 1);
  const perPage = 10;
  const offset  = (page - 1) * perPage;

  const total = await queryOne<any>('SELECT COUNT(*) AS n FROM tickets WHERE customer_id = ?', [customerId]);
  const rows  = await query<any>(
    `SELECT t.*, (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket_id = t.id) AS message_count
     FROM tickets t WHERE customer_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [customerId, perPage, offset]
  );

  res.json({
    success: true,
    data: rows,
    meta: {
      total: Number(total?.n ?? 0),
      per_page: perPage,
      current_page: page,
      last_page: Math.max(1, Math.ceil(Number(total?.n ?? 0) / perPage)),
    },
  });
}));

// ── POST /api/customer/tickets ───────────────────────────────────────────────
const createTicketSchema = z.object({
  subject: z.string().min(3).max(180),
  message: z.string().min(3),
  priority: z.enum(['low','medium','high']).optional(),
});

router.post('/tickets', asyncHandler(async (req: AuthedRequest, res) => {
  const data = createTicketSchema.parse(req.body);
  const customerId = await getCustomerId(req.user!.uid);

  const ticketNumber = 'TKT-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6);
  const ticketId = await insert(
    `INSERT INTO tickets (ticket_number, customer_id, subject, priority) VALUES (?, ?, ?, ?)`,
    [ticketNumber, customerId, data.subject, data.priority || 'medium']
  );
  await insert(
    `INSERT INTO ticket_messages (ticket_id, user_id, body) VALUES (?, ?, ?)`,
    [ticketId, req.user!.uid, data.message]
  );

  res.status(201).json({ success: true, data: { id: ticketId, ticket_number: ticketNumber, status: 'open' } });
}));

// ── GET /api/customer/tickets/:id ─────────────────────────────────────────────
router.get('/tickets/:id', asyncHandler(async (req: AuthedRequest, res) => {
  const customerId = await getCustomerId(req.user!.uid);
  const ticket = await queryOne<any>('SELECT * FROM tickets WHERE id = ? AND customer_id = ?', [req.params.id, customerId]);
  if (!ticket) throw new ApiError('Ticket não encontrado.', 404);

  const messages = await query<any>(
    `SELECT m.*, u.name AS author_name, u.role AS author_role
     FROM ticket_messages m JOIN users u ON u.id = m.user_id
     WHERE m.ticket_id = ? ORDER BY m.created_at ASC`,
    [ticket.id]
  );

  res.json({ success: true, data: { ...ticket, messages } });
}));

// ── POST /api/customer/tickets/:id/messages ───────────────────────────────────
const replySchema = z.object({ body: z.string().min(1) });

router.post('/tickets/:id/messages', asyncHandler(async (req: AuthedRequest, res) => {
  const customerId = await getCustomerId(req.user!.uid);
  const ticket = await queryOne<any>('SELECT * FROM tickets WHERE id = ? AND customer_id = ?', [req.params.id, customerId]);
  if (!ticket) throw new ApiError('Ticket não encontrado.', 404);

  const data = replySchema.parse(req.body);
  const messageId = await insert(
    `INSERT INTO ticket_messages (ticket_id, user_id, body) VALUES (?, ?, ?)`,
    [ticket.id, req.user!.uid, data.body]
  );
  await execute(`UPDATE tickets SET status = 'open', updated_at = NOW() WHERE id = ?`, [ticket.id]);

  res.status(201).json({ success: true, data: { id: messageId } });
}));

// ── GET /api/customer/profile ────────────────────────────────────────────────
router.get('/profile', asyncHandler(async (req: AuthedRequest, res) => {
  const user = await queryOne<any>('SELECT * FROM users WHERE id = ?', [req.user!.uid]);
  const customer = await queryOne<any>('SELECT * FROM customers WHERE user_id = ?', [req.user!.uid]);

  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      company: customer?.company || null,
      nuit: customer?.nuit || null,
      address: customer?.address || null,
      city: customer?.city || null,
      country: customer?.country || null,
    },
  });
}));

// ── PUT /api/customer/profile ────────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(30).optional(),
  company: z.string().max(160).optional(),
  nuit: z.string().max(30).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
});

router.put('/profile', asyncHandler(async (req: AuthedRequest, res) => {
  const data = updateProfileSchema.parse(req.body);

  if (data.name !== undefined || data.phone !== undefined) {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.name !== undefined)  { fields.push('name = ?');  values.push(data.name); }
    if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
    if (fields.length) {
      await execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...values, req.user!.uid]);
    }
  }

  const custFields: string[] = [];
  const custValues: any[] = [];
  for (const key of ['company','nuit','address','city'] as const) {
    if (data[key] !== undefined) { custFields.push(`${key} = ?`); custValues.push(data[key]); }
  }
  if (custFields.length) {
    await execute(`UPDATE customers SET ${custFields.join(', ')} WHERE user_id = ?`, [...custValues, req.user!.uid]);
  }

  res.json({ success: true, message: 'Perfil actualizado.' });
}));

// ── PUT /api/customer/password ──────────────────────────────────────────────
const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(6).max(72),
});

router.put('/password', asyncHandler(async (req: AuthedRequest, res) => {
  const data = changePasswordSchema.parse(req.body);
  const user = await queryOne<any>('SELECT * FROM users WHERE id = ?', [req.user!.uid]);

  const ok = await bcrypt.compare(data.current_password, user.password_hash);
  if (!ok) throw new ApiError('Senha actual incorrecta.', 400);

  const newHash = await bcrypt.hash(data.new_password, 10);
  await execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user!.uid]);

  res.json({ success: true, message: 'Senha alterada com sucesso.' });
}));

// ── GET /api/customer/notifications ──────────────────────────────────────────
router.get('/notifications', asyncHandler(async (req: AuthedRequest, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = 20;
  const offset = (page - 1) * perPage;

  const total = await queryOne<any>('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ?', [req.user!.uid]);
  const rows = await query<any>(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [req.user!.uid, perPage, offset]
  );

  res.json({
    success: true,
    data: rows,
    meta: {
      total: Number(total?.n ?? 0),
      per_page: perPage,
      current_page: page,
      last_page: Math.max(1, Math.ceil(Number(total?.n ?? 0) / perPage)),
    },
  });
}));

// ── POST /api/customer/notifications/:id/read ─────────────────────────────────
router.post('/notifications/:id/read', asyncHandler(async (req: AuthedRequest, res) => {
  await execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user!.uid]);
  res.json({ success: true });
}));

export default router;
