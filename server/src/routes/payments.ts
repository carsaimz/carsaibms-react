import { Router } from 'express';
import { z } from 'zod';
import { queryOne, insert, execute } from '../db/connection.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth.js';
import { fromCents } from '../utils/money.js';

const router = Router();

/** Resolve customers.id for the logged-in user */
async function getCustomerId(userId: number): Promise<number> {
  const row = await queryOne<{ id: number }>('SELECT id FROM customers WHERE user_id = ?', [userId]);
  if (!row) throw new ApiError('Perfil de cliente não encontrado.', 404);
  return row.id;
}

// ── GET /api/payments/gateways — list enabled gateways (public-ish, auth required) ──
router.get('/gateways', requireAuth, asyncHandler(async (_req, res) => {
  const rows = await queryOne<any>('SELECT gateway, label, is_active FROM payment_gateways WHERE is_active = 1') as any;
  const { query } = await import('../db/connection.js');
  const all = await query<any>('SELECT gateway, label FROM payment_gateways WHERE is_active = 1 ORDER BY sort_order');
  res.json({ success: true, data: all });
}));

// ── POST /api/payments/initiate ─────────────────────────────────────────────
const initiateSchema = z.object({
  order_id: z.number().int().positive(),
  method: z.enum(['mpesa', 'emola', 'paypal', 'stripe']),
  phone: z.string().optional(),
});

router.post('/initiate', requireAuth, requireRole('customer'), asyncHandler(async (req: AuthedRequest, res) => {
  const data = initiateSchema.parse(req.body);
  const customerId = await getCustomerId(req.user!.uid);

  const order = await queryOne<any>('SELECT * FROM orders WHERE id = ? AND customer_id = ?', [data.order_id, customerId]);
  if (!order) throw new ApiError('Pedido não encontrado.', 404);
  if (order.payment_status === 'paid') throw new ApiError('Este pedido já foi pago.', 409);

  const gateway = await queryOne<any>('SELECT * FROM payment_gateways WHERE gateway = ?', [data.method]);
  if (!gateway || !gateway.is_active) throw new ApiError(`Gateway '${data.method}' não está activo.`, 422);

  if (['mpesa', 'emola'].includes(data.method) && !data.phone) {
    throw new ApiError('Número de telemóvel obrigatório para este método.', 400);
  }

  // Record a pending payment attempt
  const paymentId = await insert(
    `INSERT INTO payments (order_id, method, amount_cents, status, reference) VALUES (?, ?, ?, 'pending', ?)`,
    [order.id, data.method, order.total_cents, `INIT-${Date.now()}`]
  );
  await execute(`UPDATE orders SET payment_status = 'processing' WHERE id = ?`, [order.id]);

  // NOTE: real gateway integration (M-Pesa C2B, PayPal Orders, Stripe PaymentIntents)
  // is planned for a future session — this records the attempt and returns a
  // status_url the client can poll, matching the PHP version's behaviour.
  res.json({
    success: true,
    data: {
      gateway: data.method,
      order: order.order_number,
      payment_id: paymentId,
      status_url: `/api/payments/status/${order.order_number}`,
      message: 'Pedido de pagamento registado. Integração com o gateway real está planeada.',
    },
  });
}));

// ── GET /api/payments/status/:orderNumber ────────────────────────────────────
router.get('/status/:orderNumber', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const order = await queryOne<any>('SELECT id, order_number, status, payment_status, total_cents FROM orders WHERE order_number = ?', [req.params.orderNumber]);
  if (!order) throw new ApiError('Pedido não encontrado.', 404);

  res.json({
    success: true,
    data: {
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      total: fromCents(order.total_cents),
    },
  });
}));

export default router;
