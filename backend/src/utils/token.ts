import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
