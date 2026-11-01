import { z } from 'zod';
import { CATEGORIES } from '../models/Destination.js';
import { NEARBY_CATEGORY_KEYS } from '../services/nearby.service.js';
import { BASES } from '../services/itinerary.service.js';
import { BOOKING_STATUSES, BOOKING_TYPES, TRAVEL_STYLES } from '../models/Booking.js';

const COORDS = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

// "20.29,85.82" becomes coordinates; anything else is a destination slug/name or a place to geocode.
const placeParam = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .transform((s) => {
    const m = s.match(COORDS);
    return m ? { lat: Number(m[1]), lng: Number(m[2]) } : { query: s };
  });

const latLng = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

export const listQuery = z.object({
  category: z.enum(CATEGORIES).optional(),
  q: z.string().trim().max(80).optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export const nearbyQuery = z.object({
  categories: z
    .string()
    .optional()
    .transform((s) => (s ? s.split(',').map((c) => c.trim()) : NEARBY_CATEGORY_KEYS))
    .pipe(z.array(z.enum(NEARBY_CATEGORY_KEYS)).min(1)),
  radius: z.coerce.number().int().min(200).max(5000).default(1500),
});

export const routeQuery = z.object({ origin: placeParam, destination: placeParam });

export const chatBody = z.object({
  sessionId: z.string().max(40).nullish(),
  message: z.string().trim().min(1, 'Message is empty').max(1000, 'Message is too long'),
  userLocation: latLng.nullish(),
  // Interface language chosen on the site; the assistant replies in it.
  language: z.enum(['en', 'hi', 'or']).default('en'),
});

// Buttons on the chat's booking summary card. Only these can create a booking from chat.
export const chatConfirmBody = z.object({ action: z.enum(['confirm', 'discard']) });

export const itineraryBody = z.object({
  days: z.number().int().min(1).max(5),
  base: z.enum(Object.keys(BASES)).default('bhubaneswar'),
  interests: z.array(z.enum(CATEGORIES)).max(5).default([]),
  include: z.array(z.string().max(80)).max(12).default([]),
  travelers: z.number().int().min(1).max(20).default(2),
  travelStyle: z.enum(TRAVEL_STYLES).default('standard'),
});

const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(160);

export const registerBody = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  email,
  password: z.string().min(8, 'Use at least 8 characters').max(128),
});

export const loginBody = z.object({ email, password: z.string().min(1, 'Enter your password').max(128) });

export const staffRegisterBody = registerBody.extend({ code: z.string().max(200).optional() });

export const preferencesBody = z.object({
  homeCity: z.string().trim().max(80).nullable().default(null),
  travelStyle: z.enum(TRAVEL_STYLES).nullable().default(null),
  interests: z.array(z.enum(CATEGORIES)).max(5).default([]),
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

// Completeness and date rules are checked in booking.service so chat and form share them.
export const bookingBody = z.object({
  type: z.enum(BOOKING_TYPES),
  destination: z.string().trim().min(2).max(100).optional(),
  origin: z.string().trim().min(2).max(100).optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  travelers: z.number().int().optional(),
  budgetInr: z.number().optional(),
  travelStyle: z.enum(TRAVEL_STYLES).optional(),
  hotelType: z.string().trim().max(60).optional(),
  breakfast: z.boolean().optional(),
  accessibility: z.string().trim().max(200).optional(),
  tripType: z.enum(['one_way', 'round_trip']).optional(),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).optional(),
  interests: z.array(z.enum(CATEGORIES)).max(5).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const adminBookingQuery = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  type: z.enum(BOOKING_TYPES).optional(),
});

export const adminStatusBody = z.object({
  status: z.enum(BOOKING_STATUSES.filter((s) => s !== 'cancelled')),
  note: z.string().trim().max(500).optional(),
});

export const tripBody = z.object({
  itineraryId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid itinerary'),
  title: z.string().trim().min(2).max(120).optional(),
  startDate: isoDate.nullish(),
  travelers: z.number().int().min(1).max(20).nullish(),
  notes: z.string().max(2000).optional(),
});

export const tripPatchBody = tripBody.omit({ itineraryId: true }).partial();
