import { Router } from 'express';
import { me, updateMe, deleteMe, search } from '../controllers/users';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { UpdateUserSchema } from '../services/users';

export const usersRouter = Router();
usersRouter.get('/me', authMiddleware, me);
usersRouter.patch('/me', authMiddleware, validateBody(UpdateUserSchema), updateMe);
usersRouter.delete('/me', authMiddleware, deleteMe);
usersRouter.get('/search', authMiddleware, search);
