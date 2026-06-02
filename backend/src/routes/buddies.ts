import { Router } from 'express';
import { createBuddy, getBuddies, patchBuddy } from '../controllers/buddies';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { CreateBuddySchema, UpdateBuddySchema } from '../services/buddies';

export const buddiesRouter = Router();
buddiesRouter.post('/', authMiddleware, validateBody(CreateBuddySchema), createBuddy);
buddiesRouter.get('/', authMiddleware, getBuddies);
buddiesRouter.patch('/:id', authMiddleware, validateBody(UpdateBuddySchema), patchBuddy);
