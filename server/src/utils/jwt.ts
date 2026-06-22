import jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
  uid: number;
  role: string;
}

const ACCESS_SECRET  = process.env.JWT_SECRET || 'dev_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES  || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d';

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyRefreshToken(token: string): AccessTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as AccessTokenPayload;
}

/** Convert "30d" / "15m" style strings to milliseconds, for cookie maxAge */
export function expiresToMs(expr: string): number {
  const match = expr.match(/^(\d+)([smhd])$/);
  if (!match) return 0;
  const n = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * (multipliers[unit] ?? 0);
}

export const REFRESH_EXPIRES_MS = expiresToMs(REFRESH_EXPIRES);
