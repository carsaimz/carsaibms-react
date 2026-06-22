import { Router } from 'express';
import { query, queryOne, execute } from '../db/connection.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { page, perPage, offset } = parsePagination(req.query);
  const search = (req.query.search as string) || '';
  const where = search ? "WHERE p.is_published=1 AND p.title LIKE ?" : "WHERE p.is_published=1";
  const params = search ? [`%${search}%`] : [];

  const total = await queryOne<any>(`SELECT COUNT(*) n FROM posts p ${where}`, params);
  const rows  = await query<any>(
    `SELECT p.id, p.slug, p.title, p.excerpt, p.image, p.views, p.published_at
     FROM posts p ${where} ORDER BY p.published_at DESC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );
  res.json({ success: true, data: rows, meta: paginationMeta(Number(total?.n ?? 0), page, perPage) });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const post = await queryOne<any>(
    'SELECT * FROM posts WHERE slug=? AND is_published=1', [req.params.slug]
  );
  if (!post) throw new ApiError('Artigo não encontrado.', 404);
  await execute('UPDATE posts SET views=views+1 WHERE id=?', [post.id]);
  res.json({ success: true, data: { ...post, views: (post.views || 0) + 1 } });
}));

export default router;
