import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const AUTH_COOKIE = 'ov_session';

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    // The production client and API live on different domains, which needs SameSite=None.
    sameSite: env.isProd ? 'none' : 'lax',
    maxAge: env.JWT_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, { expiresIn: `${env.JWT_EXPIRES_DAYS}d` });
}

/** Attaches req.user when a valid session cookie is present. Never rejects the request. */
export async function loadUser(req, _res, next) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return next();
  try {
    const { sub } = jwt.verify(token, env.jwtSecret);
    if (mongoose.isValidObjectId(sub)) {
      const user = await User.findById(sub).lean();
      if (user) req.user = { id: String(user._id), name: user.name, email: user.email, role: user.role, preferences: user.preferences };
    }
  } catch {
    // Expired or tampered tokens are treated as signed out.
  }
  next();
}

export function requireAuth(req, _res, next) {
  next(req.user ? undefined : AppError.unauthorized());
}

export function requireAdmin(req, _res, next) {
  if (!req.user) return next(AppError.unauthorized());
  next(req.user.role === 'admin' ? undefined : AppError.forbidden());
}
