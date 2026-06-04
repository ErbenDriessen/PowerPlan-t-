import type { Request, Response } from 'express';
import { getUser, updateUser, softDeleteUser, searchUsers } from '../services/users';

export async function me(_req: Request, res: Response): Promise<void> {
  try { res.json(await getUser(res.locals.userId as number)); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  try { res.json(await updateUser(res.locals.userId as number, req.body)); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}

export async function deleteMe(_req: Request, res: Response): Promise<void> {
  try { await softDeleteUser(res.locals.userId as number); res.status(204).send(); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}

export async function search(req: Request, res: Response): Promise<void> {
  try { res.json(await searchUsers(String(req.query.q ?? ''), res.locals.userId as number)); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}
