import { Router } from 'express';
import mongoose from 'mongoose';
import { validate } from '../middleware/validate.js';
import { authLimiter, bookingLimiter, chatLimiter } from '../middleware/rateLimits.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import * as destinations from '../controllers/destinations.controller.js';
import * as chat from '../controllers/chat.controller.js';
import * as itineraries from '../controllers/itineraries.controller.js';
import * as travel from '../controllers/travel.controller.js';
import * as auth from '../controllers/auth.controller.js';
import * as bookings from '../controllers/bookings.controller.js';
import * as trips from '../controllers/trips.controller.js';
import {
  adminBookingQuery,
  adminStatusBody,
  bookingBody,
  chatBody,
  chatConfirmBody,
  itineraryBody,
  listQuery,
  loginBody,
  staffRegisterBody,
  nearbyQuery,
  preferencesBody,
  registerBody,
  routeQuery,
  tripBody,
  tripPatchBody,
} from './schemas.js';

export const api = Router();

api.get('/health', (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

api.post('/auth/register', authLimiter, validate(registerBody, 'body'), auth.register);
api.post('/auth/login', authLimiter, validate(loginBody, 'body'), auth.login);
api.post('/auth/logout', auth.logout);
// Admin sign-up, used only by the unlisted staff page. Admins sign in with /auth/login.
api.get('/auth/staff/config', auth.staffConfig);
api.post('/auth/staff/register', authLimiter, validate(staffRegisterBody, 'body'), auth.staffRegister);
api.get('/auth/me', auth.me);
api.patch('/auth/preferences', requireAuth, validate(preferencesBody, 'body'), auth.preferences);

api.get('/destinations', validate(listQuery), destinations.list);
api.get('/destinations/:slug', destinations.detail);
api.get('/destinations/:slug/images', destinations.images);
api.get('/destinations/:slug/nearby', validate(nearbyQuery), destinations.nearby);
api.get('/destinations/:slug/weather', destinations.weather);

api.get('/routes', validate(routeQuery), travel.route);
api.get('/guidelines', travel.guidelines);

api.get('/chat/status', chat.status);
api.post('/chat', chatLimiter, validate(chatBody, 'body'), chat.send);
api.post('/chat/:sessionId/booking', bookingLimiter, validate(chatConfirmBody, 'body'), chat.booking);
api.get('/chat/:sessionId', chat.history);

api.get('/itineraries/bases', itineraries.bases);
api.post('/itineraries', validate(itineraryBody, 'body'), itineraries.create);
api.get('/itineraries/:id', itineraries.show);

api.post('/bookings', requireAuth, bookingLimiter, validate(bookingBody, 'body'), bookings.create);
api.get('/bookings/my-bookings', requireAuth, bookings.mine);
api.get('/bookings/:id', requireAuth, bookings.show);
api.patch('/bookings/:id/cancel', requireAuth, bookings.cancel);

api.post('/trips', requireAuth, validate(tripBody, 'body'), trips.create);
api.get('/trips/my-trips', requireAuth, trips.mine);
api.get('/trips/:id', requireAuth, trips.show);
api.patch('/trips/:id', requireAuth, validate(tripPatchBody, 'body'), trips.update);
api.delete('/trips/:id', requireAuth, trips.remove);

api.get('/admin/bookings', requireAdmin, validate(adminBookingQuery), bookings.adminList);
api.get('/admin/stats', requireAdmin, bookings.adminStats);
api.patch('/admin/bookings/:id/status', requireAdmin, validate(adminStatusBody, 'body'), bookings.adminUpdate);
