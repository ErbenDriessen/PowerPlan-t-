import { Router } from 'express';
import { listMessages, createMessage } from '../controllers/messages';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { SendMessageSchema } from '../services/messages';

export const messagesRouter = Router();
messagesRouter.get('/:id/messages', authMiddleware, listMessages);
messagesRouter.post('/:id/messages', authMiddleware, validateBody(SendMessageSchema), createMessage);
