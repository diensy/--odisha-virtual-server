import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const limitResponse = (message) => ({ error: { code: 'RATE_LIMITED', message } });

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitResponse('Too many requests. Please slow down.'),
});

// Slows password guessing; successful sign-ins do not count.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitResponse('Too many sign-in attempts. Please wait 15 minutes and try again.'),
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitResponse('You have submitted a lot of requests. Please try again later.'),
});

// The chat endpoint calls a paid model and several public providers, so it is limited separately.
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.CHAT_RATE_LIMIT_PER_15_MIN,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: limitResponse('You have sent a lot of messages. Please wait a few minutes and try again.'),
});
