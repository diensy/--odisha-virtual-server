import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const toPublic = (u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role, preferences: u.preferences });

// Public sign-up always creates a traveller account; staff accounts come from staffRegister.
export async function register({ name, email, password }) {
  if (await User.exists({ email })) throw AppError.conflict('An account with this email already exists. Try signing in.');
  const user = await User.create({ name, email, role: 'user', passwordHash: await bcrypt.hash(password, 12) });
  return { user, publicUser: toPublic(user) };
}

const INVALID_STAFF = () => new AppError(403, 'STAFF_DENIED', 'These details cannot be used for a staff account.');

/** True when no code is configured, or when the given code matches it. */
function codeMatches(code) {
  if (!env.ADMIN_SIGNUP_CODE) return true;
  const expected = Buffer.from(env.ADMIN_SIGNUP_CODE);
  const given = Buffer.from(code ?? '');
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export const staffSignupConfig = () => ({ codeRequired: Boolean(env.ADMIN_SIGNUP_CODE) });

/**
 * Creates an admin account, or promotes an existing account after checking its password.
 * Needs an email listed in ADMIN_EMAILS, plus ADMIN_SIGNUP_CODE when one is configured.
 * Every failure gives the same answer so the page cannot be used to learn which part was wrong.
 */
export async function staffRegister({ name, email, password, code }) {
  if (!codeMatches(code) || !env.adminEmails.includes(email)) throw INVALID_STAFF();

  const existing = await User.findOne({ email }).select('+passwordHash');
  if (existing) {
    if (!(await bcrypt.compare(password, existing.passwordHash))) throw INVALID_STAFF();
    existing.role = 'admin';
    await existing.save();
    return { user: existing, publicUser: toPublic(existing) };
  }
  const user = await User.create({ name, email, role: 'admin', passwordHash: await bcrypt.hash(password, 12) });
  return { user, publicUser: toPublic(user) };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  // Same message for unknown email and wrong password so accounts cannot be probed.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }
  // Removing someone from ADMIN_EMAILS takes away their admin role at their next sign-in.
  if (user.role === 'admin' && !env.adminEmails.includes(user.email)) {
    user.role = 'user';
    await user.save();
  }
  return { user, publicUser: toPublic(user) };
}

export async function updatePreferences(userId, preferences) {
  const user = await User.findByIdAndUpdate(userId, { $set: { preferences } }, { new: true, runValidators: true });
  if (!user) throw AppError.notFound('Account not found');
  return toPublic(user);
}
