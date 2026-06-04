import { z } from 'zod';
import { prisma } from '../db/client';
import { hashPassword, verifyPassword } from '../utils/hash';

export const UpdateUserSchema = z.object({
  username: z.string().min(2).max(30).optional(),
  currentPassword: z.string().optional(),
  password: z.string().min(8).regex(/(?=.*[a-zA-Z])(?=.*\d)/).optional(),
}).refine((d) => !d.password || d.currentPassword, { message: 'currentPassword vereist', path: ['currentPassword'] });

export async function getUser(userId: number) {
  const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: { id: true, username: true, email: true, createdAt: true } });
  if (!user) throw Object.assign(new Error('Gebruiker niet gevonden'), { status: 404 });
  return user;
}

export async function updateUser(userId: number, data: z.infer<typeof UpdateUserSchema>) {
  const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
  if (!user) throw Object.assign(new Error('Gebruiker niet gevonden'), { status: 404 });
  const updates: { username?: string; passwordHash?: string } = {};
  if (data.username) updates.username = data.username;
  if (data.password && data.currentPassword) {
    if (!await verifyPassword(data.currentPassword, user.passwordHash)) throw Object.assign(new Error('Huidig wachtwoord klopt niet'), { status: 400 });
    updates.passwordHash = await hashPassword(data.password);
  }
  return prisma.user.update({ where: { id: userId }, data: updates, select: { id: true, username: true, email: true } });
}

export async function softDeleteUser(userId: number): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { username: 'Verwijderde gebruiker', email: `deleted-${userId}@removed.invalid`, passwordHash: '', deletedAt: new Date() } }),
    prisma.buddy.updateMany({ where: { OR: [{ requesterId: userId }, { receiverId: userId }] }, data: { status: 'blocked' } }),
  ]);
}

export async function searchUsers(query: string, currentUserId: number) {
  if (query.length < 2) return [];
  return prisma.user.findMany({ where: { username: { contains: query }, id: { not: currentUserId }, deletedAt: null }, select: { id: true, username: true }, take: 10 });
}
