import { Router } from 'express';
import { query } from '../db/connection.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();
const BASE = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://carsai.co.mz';

// ── GET /sitemap.xml ─────────────────────────────────────────────────────────
router.get('/sitemap.xml', asyncHandler(async (_req, res) => {
  const [products, services, posts, pages] = await Promise.all([
    query<any>('SELECT slug, updated_at FROM products WHERE is_active=1 ORDER BY updated_at DESC'),
    query<any>('SELECT slug, created_at FROM services WHERE is_active=1'),
    query<any>('SELECT slug, published_at FROM posts WHERE is_published=1 ORDER BY published_at DESC'),
    query<any>('SELECT slug, updated_at FROM pages WHERE is_published=1'),
  ]);

  const staticUrls = [
    { loc: '/',          changefreq: 'weekly',  priority: '1.0' },
    { loc: '/products',  changefreq: 'daily',   priority: '0.9' },
    { loc: '/services',  changefreq: 'weekly',  priority: '0.8' },
    { loc: '/blog',      changefreq: 'daily',   priority: '0.7' },
    { loc: '/contact',   changefreq: 'monthly', priority: '0.5' },
    { loc: '/quote',     changefreq: 'monthly', priority: '0.5' },
    { loc: '/api-docs',  changefreq: 'monthly', priority: '0.4' },
  ];

  const toUrl = (loc: string, lastmod?: string, changefreq = 'weekly', priority = '0.6') =>
    `  <url>\n    <loc>${BASE}${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod.slice(0,10)}</lastmod>` : ''}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticUrls.map(u => toUrl(u.loc, undefined, u.changefreq, u.priority)),
    ...products.map((p: any) => toUrl(`/products/${p.slug}`, p.updated_at, 'weekly', '0.8')),
    ...services.map((s: any) => toUrl(`/services/${s.slug}`, s.created_at, 'monthly', '0.7')),
    ...posts.map((p: any) => toUrl(`/blog/${p.slug}`, p.published_at, 'monthly', '0.7')),
    ...pages.map((p: any) => toUrl(`/p/${p.slug}`, p.updated_at, 'monthly', '0.5')),
    '</urlset>',
  ].join('\n');

  res.set('Content-Type', 'application/xml');
  res.send(xml);

  // Async ping search engines (non-blocking)
  const sitemapUrl = encodeURIComponent(`${BASE}/sitemap.xml`);
  Promise.all([
    fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`).catch(() => {}),
    fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`).catch(() => {}),
  ]);
}));

// ── GET /robots.txt ──────────────────────────────────────────────────────────
router.get('/robots.txt', asyncHandler(async (_req, res) => {
  const rows = await query<any>("SELECT value FROM settings WHERE `key`='robots_disallow'");
  const extra = rows[0]?.value || '';
  const txt = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /dashboard',
    'Disallow: /staff',
    'Disallow: /pos',
    'Disallow: /api/',
    extra,
    '',
    `Sitemap: ${BASE}/sitemap.xml`,
  ].filter(l => l !== undefined).join('\n');

  res.set('Content-Type', 'text/plain');
  res.send(txt);
}));

// ── GET /rss.xml ─────────────────────────────────────────────────────────────
router.get('/rss.xml', asyncHandler(async (_req, res) => {
  const posts = await query<any>(
    'SELECT * FROM posts WHERE is_published=1 ORDER BY published_at DESC LIMIT 20'
  );
  const companyName = process.env.COMPANY_NAME || 'Carsai BMS';

  const escape = (s: string) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const items = posts.map((p: any) => `
  <item>
    <title>${escape(p.title)}</title>
    <link>${BASE}/blog/${p.slug}</link>
    <description>${escape(p.excerpt || '')}</description>
    <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
    <guid>${BASE}/blog/${p.slug}</guid>
  </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(companyName)} — Blog</title>
    <link>${BASE}</link>
    <description>Notícias e novidades do ${escape(companyName)}</description>
    <language>pt</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  res.set('Content-Type', 'application/rss+xml');
  res.send(xml);
}));

export default router;
