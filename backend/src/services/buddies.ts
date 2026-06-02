import { z } from 'zod';
import { prisma } from '../db/client';
import type { BuddyWithOther } from '../types';

export const CreateBuddySchema = z.object({ receiverId: z.number().int().positive() });
export const UpdateBuddySchema = z.object({ status: z.enum(['accepted', 'blocked']) });

export async function createBuddyRequest(requesterId: number, receiverId: number) {
  if (requesterId === receiverId) throw Object.assign(new Error('Je kunt jezelf niet toevoegen'), { status: 400 });
  const existing = await prisma.buddy.findFirst({ where: { OR: [{ requesterId, receiverId }, { requesterId: receiverId, receiverId: requesterId }] } });
  if (existing) throw Object.assign(new Error('Er bestaat al een koppeling'), { status: 409 });
  return prisma.buddy.create({ data: { requesterId, receiverId } });
}

export async function listBuddies(userId: number): Promise<BuddyWithOther[]> {
  const buddies = await prisma.buddy.findMany({
    where: { OR: [{ requesterId: userId }, { receiverId: userId }] },
    include: { requester: { select: { id: true, username: true, createdAt: true } }, receiver: { select: { id: true, username: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return buddies.map((b) => {
    const isRequester = b.requesterId === userId;
    return { id: b.id, status: b.status as 'pending' | 'accepted' | 'blocked', createdAt: b.createdAt, other: isRequester ? b.receiver : b.requester, isRequester };
  });
}

export async function updateBuddyStatus(buddyId: number, userId: number, newStatus: 'accepted' | 'blocked') {
  const buddy = await prisma.buddy.findUnique({ where: { id: buddyId } });
  if (!buddy) throw Object.assign(new Error('Koppeling niet gevonden'), { status: 404 });
  if (buddy.requesterId !== userId && buddy.receiverId !== userId) throw Object.assign(new Error('Geen toegang'), { status: 403 });
  if (newStatus === 'accepted' && buddy.receiverId !== userId) throw Object.assign(new Error('Alleen de ontvanger kan accepteren'), { status: 403 });
  return prisma.buddy.update({ where: { id: buddyId }, data: { status: newStatus } });
}
