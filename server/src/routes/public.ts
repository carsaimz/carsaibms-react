import { Router } from 'express';
import { query, queryOne } from '../db/connection.js';
import { asyncHandler, ApiError } from '../middleware/error.js';

const router = Router();

// ── GET /api/products ───────────────────────────────────────────────────────
router.get('/products', asyncHandler(async (req, res) => {
  const page    = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(req.query.per_page) || 20));
  const offset  = (page - 1) * perPage;
  const search  = (req.query.search as string) || '';
  const catId   = req.query.category ? Number(req.query.category) : null;
  const featured= req.query.featured === '1' || req.query.featured === 'true';

  const where: string[] = ['is_active = 1'];
  const params: any[] = [];
  if (search)   { where.push('(name LIKE ? OR sku LIKE ? OR barcode = ?)'); params.push(`%${search}%`, `%${search}%`, search); }
  if (catId)    { where.push('category_id = ?'); params.push(catId); }
  if (featured) { where.push('is_featured = 1'); }

  const total  = await queryOne<any>(`SELECT COUNT(*) AS n FROM products WHERE ${where.join(' AND ')}`, params);
  const rows   = await query<any>(
    `SELECT id, sku, barcode, name, slug, short_desc, price_cents, stock, unit, image, is_featured, sold_count
     FROM products WHERE ${where.join(' AND ')} ORDER BY is_featured DESC, name ASC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  res.json({
    success: true,
    data: rows.map((p) => ({
      id: p.id, sku: p.sku, barcode: p.barcode, pname: p.name, slug: p.slug,
      short_description: p.short_desc,
      price: p.price_cents / 100,
      stock: Number(p.stock), unit: p.unit,
      image: p.image, is_featured: !!p.is_featured, sold_count: p.sold_count,
    })),
    meta: {
      total: Number(total?.n ?? 0), per_page: perPage, current_page: page,
      last_page: Math.max(1, Math.ceil(Number(total?.n ?? 0) / perPage)),
    },
  });
}));

// ── GET /api/products/:idOrSlug ──────────────────────────────────────────────
router.get('/products/:ref', asyncHandler(async (req, res) => {
  const ref = req.params.ref;
  const product = await queryOne<any>(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.is_active = 1 AND (p.id = ? OR p.slug = ?)`,
    [Number(ref) || 0, ref]
  );
  if (!product) throw new ApiError('Produto não encontrado.', 404);

  res.json({
    success: true,
    data: {
      id: product.id, sku: product.sku, barcode: product.barcode, pname: product.name, slug: product.slug,
      description: product.description, short_description: product.short_desc,
      price: product.price_cents / 100, cost: product.cost_cents / 100,
      stock: Number(product.stock), min_stock: Number(product.min_stock),
      unit: product.unit, image: product.image,
      is_featured: !!product.is_featured, sold_count: product.sold_count,
      category: product.category_name ? { id: product.category_id, name: product.category_name } : null,
      created_at: product.created_at, updated_at: product.updated_at,
    },
  });
}));

// ── GET /api/services ────────────────────────────────────────────────────────
router.get('/services', asyncHandler(async (req, res) => {
  const page    = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.min(100, Number(req.query.per_page) || 20);
  const offset  = (page - 1) * perPage;
  const search  = (req.query.search as string) || '';

  const where: string[] = ['s.is_active = 1'];
  const params: any[] = [];
  if (search) { where.push('s.name LIKE ?'); params.push(`%${search}%`); }

  const total = await queryOne<any>(`SELECT COUNT(*) AS n FROM services s WHERE ${where.join(' AND ')}`, params);
  const rows  = await query<any>(
    `SELECT s.*, c.name AS category_name FROM services s
     LEFT JOIN categories c ON c.id = s.category_id
     WHERE ${where.join(' AND ')} ORDER BY s.name ASC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  res.json({
    success: true,
    data: rows.map((s) => ({
      id: s.id, sname: s.name, slug: s.slug, description: s.description,
      price: s.price_cents / 100, duration: s.duration_min, image: s.image,
      category: s.category_name ? { id: s.category_id, name: s.category_name } : null,
    })),
    meta: {
      total: Number(total?.n ?? 0), per_page: perPage, current_page: page,
      last_page: Math.max(1, Math.ceil(Number(total?.n ?? 0) / perPage)),
    },
  });
}));


// ── GET /api/services/:slug ─────────────────────────────────────────────────
router.get('/services/:slug', asyncHandler(async (req, res) => {
  const s = await queryOne<any>(
    `SELECT s.*, c.name cat_name FROM services s
     LEFT JOIN categories c ON c.id=s.category_id
     WHERE s.is_active=1 AND (s.id=? OR s.slug=?)`,
    [Number(req.params.slug) || 0, req.params.slug]
  );
  if (!s) throw new ApiError('Serviço não encontrado.', 404);
  res.json({ success: true, data: {
    id: s.id, sname: s.name, slug: s.slug, description: s.description,
    price: s.price_cents / 100, duration: s.duration_min, image: s.image,
    category: s.cat_name ? { id: s.category_id, name: s.cat_name } : null,
  }});
}));

// ── GET /api/categories ─────────────────────────────────────────────────────
router.get('/categories', asyncHandler(async (_req, res) => {
  const rows = await query<any>('SELECT * FROM categories ORDER BY sort_order, name');
  res.json({ success: true, data: rows });
}));

// ── POST /api/contact ────────────────────────────────────────────────────────
router.post('/contact', asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    throw new ApiError('name, email, subject e message são obrigatórios.', 400);
  }
  // In future: send email via Resend and save to DB messages table
  res.json({ success: true, message: 'Mensagem recebida. Entraremos em contacto brevemente.' });
}));

// ── GET /api/blog (forwarded from blog router, also accessible via public) ──
router.get('/blog', async (req, res, next) => {
  req.url = '/';
  next();
});

// ── GET /api/health ──────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Carsai BMS React API — online', version: '0.1.0' });
});

export default router;
