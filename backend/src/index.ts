import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { globalRateLimit, loginRateLimit } from './middleware/rateLimit';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { buddiesRouter } from './routes/buddies';
import { messagesRouter } from './routes/messages';

const app = express();
app.use(cors());
app.use(express.json());
app.use(globalRateLimit);
app.use('/auth', loginRateLimit, authRouter);
app.use('/users', usersRouter);
app.use('/buddies', buddiesRouter);
app.use('/buddies', messagesRouter);
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, '0.0.0.0', () => console.log(`Backend draait op http://0.0.0.0:${PORT}`));

export default app;
