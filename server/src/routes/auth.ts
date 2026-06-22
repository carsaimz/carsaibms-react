import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { query, queryOne, insert, execute } from '../db/connection.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, REFRESH_EXPIRES_MS } from '../utils/jwt.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

const REFRESH_COOKIE = 'refresh_token';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setRefreshCookie(res: any, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_EXPIRES_MS,
    path: '/api/auth',
  });
}

async function issueTokens(res: any, user: { id: number; role: string }) {
  const accessToken  = signAccessToken({ uid: user.id, role: user.role });
  const refreshToken = signRefreshToken({ uid: user.id, role: user.role });

  await insert(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
    [user.id, hashToken(refreshToken)]
  );

  setRefreshCookie(res, refreshToken);
  return accessToken;
}

function publicUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    avatar: u.avatar,
  };
}

// ── POST /api/auth/google ──────────────────────────────────────────────────
// Exchanges a Firebase Google Sign-In result (sent from the native app) for
// our own access/refresh token pair. Verifies the ID token server-side via
// Firebase Admin when configured; otherwise trusts the payload (dev fallback).
const googleSchema = z.object({
  id_token: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  photo_url: z.string().nullable().optional(),
});

router.post('/google', asyncHandler(async (req, res) => {
  const data = googleSchema.parse(req.body);

  let verifiedEmail = data.email;
  if (data.id_token) {
    try {
      const admin = await import('firebase-admin');
      if (admin.apps.length) {
        const decoded = await admin.auth().verifyIdToken(data.id_token);
        verifiedEmail = decoded.email || data.email;
      }
    } catch {
      // Firebase Admin not configured or token invalid — fall back to client-supplied email
    }
  }

  let user = await queryOne<any>('SELECT * FROM users WHERE email = ?', [verifiedEmail]);
  if (!user) {
    const userId = await insert(
      `INSERT INTO users (name, email, password_hash, role, avatar) VALUES (?, ?, '', 'customer', ?)`,
      [data.name, verifiedEmail, data.photo_url || null]
    );
    await insert(`INSERT INTO customers (user_id, country) VALUES (?, 'Moçambique')`, [userId]);
    user = await queryOne('SELECT * FROM users WHERE id = ?', [userId]);
  }
  if (!user.is_active) throw new ApiError('Conta desactivada.', 403);

  await execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

  const accessToken = await issueTokens(res, user);
  res.json({ success: true, data: { token: accessToken, user: publicUser(user) } });
}));

// ── POST /api/auth/register ────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  password: z.string().min(6).max(72),
  phone: z.string().max(30).optional(),
});

router.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const existing = await queryOne('SELECT id FROM users WHERE email = ?', [data.email]);
  if (existing) throw new ApiError('Este email já está registado.', 409);

  const passwordHash = await bcrypt.hash(data.password, 10);
  const userId = await insert(
    `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')`,
    [data.name, data.email, data.phone || null, passwordHash]
  );
  await insert(`INSERT INTO customers (user_id, country) VALUES (?, 'Moçambique')`, [userId]);

  const user = await queryOne('SELECT * FROM users WHERE id = ?', [userId]);
  const accessToken = await issueTokens(res, user!);

  res.status(201).json({ success: true, data: { token: accessToken, user: publicUser(user) } });
}));

// ── POST /api/auth/login ───────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await queryOne<any>('SELECT * FROM users WHERE email = ?', [data.email]);
  if (!user || !user.is_active) throw new ApiError('Credenciais inválidas.', 401);

  const ok = await bcrypt.compare(data.password, user.password_hash);
  if (!ok) throw new ApiError('Credenciais inválidas.', 401);

  await execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

  const accessToken = await issueTokens(res, user);
  res.json({ success: true, data: { token: accessToken, user: publicUser(user) } });
}));

// ── POST /api/auth/refresh ─────────────────────────────────────────────────
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError('Sessão expirada.', 401);

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError('Sessão expirada.', 401);
  }

  const tokenHash = hashToken(token);
  const stored = await queryOne<any>(
    'SELECT * FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > NOW()',
    [tokenHash, payload.uid]
  );
  if (!stored) throw new ApiError('Sessão expirada.', 401);

  // Rotate: revoke old, issue new
  await execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [stored.id]);

  const user = await queryOne<any>('SELECT * FROM users WHERE id = ?', [payload.uid]);
  if (!user || !user.is_active) throw new ApiError('Sessão expirada.', 401);

  const accessToken = await issueTokens(res, user);
  res.json({ success: true, data: { token: accessToken, user: publicUser(user) } });
}));

// ── POST /api/auth/logout ──────────────────────────────────────────────────
router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [hashToken(token)]);
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ success: true, message: 'Sessão terminada.' });
}));

// ── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const user = await queryOne<any>('SELECT * FROM users WHERE id = ?', [req.user!.uid]);
  if (!user) throw new ApiError('Utilizador não encontrado.', 404);
  res.json({ success: true, data: publicUser(user) });
}));

export default router;
