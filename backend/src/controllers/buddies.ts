import type { Request, Response } from 'express';
import { createBuddyRequest, listBuddies, updateBuddyStatus } from '../services/buddies';

export async function createBuddy(req: Request, res: Response): Promise<void> {
  try { res.status(201).json(await createBuddyRequest(res.locals.userId as number, Number(req.body.receiverId))); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}

export async function getBuddies(_req: Request, res: Response): Promise<void> {
  try { res.json(await listBuddies(res.locals.userId as number)); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}

export async function patchBuddy(req: Request, res: Response): Promise<void> {
  try { res.json(await updateBuddyStatus(parseInt(req.params.id, 10), res.locals.userId as number, req.body.status as 'accepted' | 'blocked')); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}
