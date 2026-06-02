import { z } from 'zod';
import { prisma } from '../db/client';

export const SendMessageSchema = z.object({ body: z.string().min(1).max(2000), type: z.string().default('text') });

async function assertParticipant(buddyId: number, userId: number) {
  const buddy = await prisma.buddy.findFirst({ where: { id: buddyId, status: 'accepted', OR: [{ requesterId: userId }, { receiverId: userId }] } });
  if (!buddy) throw Object.assign(new Error('Geen toegang tot dit gesprek'), { status: 403 });
  return buddy;
}

export async function getMessages(buddyId: number, userId: number, since?: string) {
  await assertParticipant(buddyId, userId);
  return prisma.message.findMany({ where: { buddyId, ...(since ? { sentAt: { gt: new Date(since) } } : {}) }, orderBy: { sentAt: 'asc' } });
}

export async function sendMessage(buddyId: number, senderId: number, data: z.infer<typeof SendMessageSchema>) {
  await assertParticipant(buddyId, senderId);
  return prisma.message.create({ data: { buddyId, senderId, body: data.body, type: data.type } });
}
