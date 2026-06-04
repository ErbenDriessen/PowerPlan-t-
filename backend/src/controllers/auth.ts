import type { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth';

export async function register(req: Request, res: Response): Promise<void> {
  try { res.status(201).json(await registerUser(req.body)); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}

export async function login(req: Request, res: Response): Promise<void> {
  try { res.json(await loginUser(req.body)); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}
