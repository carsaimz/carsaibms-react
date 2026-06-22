import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: 'Endpoint não encontrado.' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos.',
      errors: err.flatten().fieldErrors,
    });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  console.error('[ERROR]', err);
  return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
}

/** Wrap an async route handler so thrown errors reach errorHandler */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
