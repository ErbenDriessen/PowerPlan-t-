import rateLimit from 'express-rate-limit';

export const globalRateLimit = rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false });

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60_000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Te veel pogingen. Probeer over 15 minuten opnieuw.' },
});
