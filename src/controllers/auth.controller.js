import { AUTH_COOKIE, cookieOptions, signToken } from '../middleware/auth.js';
import * as auth from '../services/auth.service.js';

function startSession(res, user) {
  res.cookie(AUTH_COOKIE, signToken(user), cookieOptions());
}

export async function register(req, res) {
  const { user, publicUser } = await auth.register(req.valid.body);
  startSession(res, user);
  res.status(201).json({ user: publicUser });
}

export async function login(req, res) {
  const { user, publicUser } = await auth.login(req.valid.body);
  startSession(res, user);
  res.json({ user: publicUser });
}

export async function staffRegister(req, res) {
  const { user, publicUser } = await auth.staffRegister(req.valid.body);
  startSession(res, user);
  res.status(201).json({ user: publicUser });
}

export function staffConfig(_req, res) {
  res.json(auth.staffSignupConfig());
}

export function logout(_req, res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(AUTH_COOKIE, opts);
  res.status(204).end();
}

export function me(req, res) {
  res.json({ user: req.user ?? null });
}

export async function preferences(req, res) {
  res.json({ user: await auth.updatePreferences(req.user.id, req.valid.body) });
}
