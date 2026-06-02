import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ error: 'Token ontbreekt' }); return; }
  try {
    const payload = verifyToken(header.slice(7));
    res.locals.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Ongeldig of verlopen token' });
  }
}
