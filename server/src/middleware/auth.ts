import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

export interface AuthedRequest extends Request {
  user?: { uid: number; role: string };
}

/** Require a valid access token in the Authorization header */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Não autenticado.' });
  }
  try {
    const payload = verifyAccessToken(match[1]);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
  }
}

/** Restrict to specific roles. Use after requireAuth. */
export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Não autenticado.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Sem permissão para este recurso.' });
    }
    next();
  };
}
