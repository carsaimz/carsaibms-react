import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import customerRoutes from './routes/customer.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes   from './routes/admin.js';
import blogRoutes    from './routes/blog.js';
import staffRoutes   from './routes/staff.js';
import extrasRoutes  from './routes/extras.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── API v1 info ──────────────────────────────────────────────────────────
app.get('/api/v1', (_req, res) => {
  res.json({ success: true, version: '1.0', endpoints: [
    '/api/auth', '/api/products', '/api/services', '/api/categories',
    '/api/blog', '/api/contact', '/api/customer', '/api/payments', '/api/admin',
  ]});
});

// ── Health check ─────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Carsai BMS API (React rewrite) — online', version: '0.1.0' });
});

// ── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✓ Carsai BMS API running at http://localhost:${PORT}`);
});
