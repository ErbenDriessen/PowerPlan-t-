import { Router } from 'express';
import { register, login } from '../controllers/auth';
import { validateBody } from '../middleware/validate';
import { RegisterSchema, LoginSchema } from '../services/auth';

export const authRouter = Router();
authRouter.post('/register', validateBody(RegisterSchema), register);
authRouter.post('/login', validateBody(LoginSchema), login);
