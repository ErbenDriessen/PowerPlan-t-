import type { Request, Response } from 'express';
import { getMessages, sendMessage } from '../services/messages';

export async function listMessages(req: Request, res: Response): Promise<void> {
  try { res.json(await getMessages(parseInt(req.params.id, 10), res.locals.userId as number, req.query.since as string | undefined)); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}

export async function createMessage(req: Request, res: Response): Promise<void> {
  try { res.status(201).json(await sendMessage(parseInt(req.params.id, 10), res.locals.userId as number, req.body)); }
  catch (err: unknown) { const e = err as { status?: number; message: string }; res.status(e.status ?? 500).json({ error: e.message }); }
}
