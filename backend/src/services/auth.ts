import { z } from 'zod';
import { prisma } from '../db/client';
import { hashPassword, verifyPassword } from '../utils/hash';
import { signToken } from '../utils/token';

export const RegisterSchema = z.object({
  username: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(8).regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Minimaal 1 letter en 1 cijfer'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerUser(data: z.infer<typeof RegisterSchema>) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });
  if (existing) throw Object.assign(new Error('E-mail of gebruikersnaam al in gebruik'), { status: 409 });

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({ data: { username: data.username, email: data.email, passwordHash } });
  return { token: signToken({ userId: user.id }), user: { id: user.id, username: user.username } };
}

export async function loginUser(data: z.infer<typeof LoginSchema>) {
  const GENERIC = 'E-mail of wachtwoord klopt niet';
  const user = await prisma.user.findFirst({ where: { email: data.email, deletedAt: null } });
  if (!user) throw Object.assign(new Error(GENERIC), { status: 401 });
  if (!await verifyPassword(data.password, user.passwordHash)) throw Object.assign(new Error(GENERIC), { status: 401 });
  return { token: signToken({ userId: user.id }), user: { id: user.id, username: user.username } };
}
