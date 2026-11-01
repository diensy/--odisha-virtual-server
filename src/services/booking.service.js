import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Booking, BOOKING_STATUSES, BOOKING_TYPES, TRAVEL_STYLES } from '../models/Booking.js';
import { AppError } from '../utils/AppError.js';

/**
 * Booking requests are collected step by step (in chat or a form), validated here, shown
 * back as a summary and saved only after the user confirms. Nothing is reserved with a
 * hotel, airline or operator: staff review each request and update its status.
 */

const BASE_FIELDS = ['destination', 'startDate', 'travelers'];
const REQUIRED = {
  trip: ['destination', 'origin', 'startDate', 'endDate', 'travelers', 'budgetInr'],
  hotel: ['destination', 'startDate', 'endDate', 'travelers', 'budgetInr'],
  flight: ['origin', 'destination', 'tripType', 'startDate', 'travelers', 'cabinClass'],
  package: ['destination', 'origin', 'startDate', 'endDate', 'travelers', 'budgetInr'],
};

// What to ask for each missing field, worded per request type where it matters.
const QUESTIONS = {
  type: 'What would you like to request: a full trip, a hotel stay, a flight or a travel package?',
  destination: { flight: 'Which city are you flying to?', default: 'Where would you like to go?' },
  origin: { flight: 'Which city are you flying from?', default: 'Which city will you be travelling from?' },
  tripType: 'Is this a one-way or a round trip?',
  startDate: { hotel: 'What is your check-in date?', flight: 'What date would you like to fly?', default: 'What date would you like to start?' },
  endDate: { hotel: 'What is your check-out date?', flight: 'What date would you like to fly back?', default: 'What date will the trip end?' },
  travelers: { hotel: 'How many guests will be staying?', flight: 'How many passengers?', default: 'How many people are travelling?' },
  cabinClass: 'Which cabin would you prefer: economy, premium economy, business or first?',
  budgetInr: { hotel: 'What is your approximate total budget for the stay, in rupees?', default: 'What is your approximate total budget, in rupees?' },
};

export const FIELD_LABELS = {
  type: 'Request type',
  destination: 'Destination',
  origin: 'From',
  tripType: 'Trip type',
  startDate: 'Start date',
  endDate: 'End date',
  travelers: 'Travellers',
  cabinClass: 'Cabin',
  budgetInr: 'Budget',
};

const question = (field, type) => {
  const q = QUESTIONS[field];
  return typeof q === 'string' ? q : (q[type] ?? q.default);
};

export function requiredFields(draft) {
  if (!draft?.type) return ['type', ...BASE_FIELDS];
  const fields = [...REQUIRED[draft.type]];
  if (draft.type === 'flight' && draft.tripType === 'round_trip') fields.splice(fields.indexOf('startDate') + 1, 0, 'endDate');
  return fields;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const todayIst = () => new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
const parseDate = (s) => (ISO_DATE.test(s ?? '') ? new Date(`${s}T00:00:00Z`) : null);

/** Checks values that are present. Missing values are reported separately. */
function fieldErrors(d) {
  const errors = [];
  const start = parseDate(d.startDate);
  const end = parseDate(d.endDate);
  const today = todayIst();
  const maxAhead = new Date(today);
  maxAhead.setUTCFullYear(maxAhead.getUTCFullYear() + 1);

  if (d.startDate && !start) errors.push({ field: 'startDate', message: 'Start date must be a calendar date (YYYY-MM-DD).' });
  if (d.endDate && !end) errors.push({ field: 'endDate', message: 'End date must be a calendar date (YYYY-MM-DD).' });
  if (start && start < today) errors.push({ field: 'startDate', message: 'The start date is in the past.' });
  if (start && start > maxAhead) errors.push({ field: 'startDate', message: 'Requests can be made up to one year ahead.' });
  if (start && end && end <= start) errors.push({ field: 'endDate', message: 'The end date must be after the start date.' });
  if (start && end && (end - start) / 86400000 > 30) errors.push({ field: 'endDate', message: 'Requests can cover at most 30 days.' });
  if (d.travelers != null && !(Number.isInteger(d.travelers) && d.travelers >= 1 && d.travelers <= 20)) {
    errors.push({ field: 'travelers', message: 'Travellers must be between 1 and 20.' });
  }
  if (d.budgetInr != null && !(d.budgetInr >= 500 && d.budgetInr <= 10_000_000)) {
    errors.push({ field: 'budgetInr', message: 'Budget must be between ₹500 and ₹1,00,00,000.' });
  }
  if (d.origin && d.destination && d.origin.trim().toLowerCase() === d.destination.trim().toLowerCase()) {
    errors.push({ field: 'destination', message: 'Origin and destination are the same place.' });
  }
  return errors;
}

const DRAFT_KEYS = [
  'type', 'destination', 'origin', 'startDate', 'endDate', 'travelers', 'budgetInr', 'travelStyle',
  'hotelType', 'breakfast', 'accessibility', 'tripType', 'cabinClass', 'interests', 'notes',
];

/** Merges new values into a draft; null/undefined values in the patch leave fields unchanged. */
export function mergeDraft(existing, patch) {
  const draft = { ...(existing ?? {}) };
  for (const key of DRAFT_KEYS) {
    const v = patch[key];
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim())) continue;
    draft[key] = typeof v === 'string' ? v.trim() : v;
  }
  // A one-way flight has no return date.
  if (draft.type === 'flight' && draft.tripType === 'one_way') delete draft.endDate;
  return draft;
}

/** The state of a draft: what is missing, what is invalid and what to ask next. */
export function evaluateDraft(draft) {
  const missing = requiredFields(draft).filter((f) => draft?.[f] == null || draft[f] === '');
  const errors = draft ? fieldErrors(draft) : [];
  const nextField = errors[0]?.field ?? missing[0] ?? null;
  return {
    missing,
    errors,
    ready: Boolean(draft?.type) && !missing.length && !errors.length,
    nextQuestion: errors[0]?.message ?? (nextField ? question(nextField, draft?.type) : null),
  };
}

export function draftBlock(draft) {
  const state = evaluateDraft(draft);
  return {
    type: 'booking_summary',
    draft,
    ready: state.ready,
    missing: state.missing.map((f) => FIELD_LABELS[f]),
    errors: state.errors,
  };
}

const newReference = () => `OV-${crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6)}`;

function toDoc(data) {
  return {
    type: data.type,
    destination: data.destination,
    origin: data.origin ?? null,
    startDate: parseDate(data.startDate),
    endDate: data.endDate ? parseDate(data.endDate) : null,
    travelers: data.travelers,
    budgetInr: data.budgetInr ?? null,
    travelStyle: data.travelStyle ?? null,
    preferences: {
      hotelType: data.hotelType ?? null,
      breakfast: data.breakfast ?? null,
      accessibility: data.accessibility ?? null,
      tripType: data.tripType ?? null,
      cabinClass: data.cabinClass ?? null,
      interests: data.interests ?? [],
      notes: data.notes ?? null,
    },
  };
}

export function toPublicBooking(b) {
  return {
    id: String(b._id),
    reference: b.reference,
    type: b.type,
    destination: b.destination,
    origin: b.origin,
    startDate: b.startDate,
    endDate: b.endDate,
    travelers: b.travelers,
    budgetInr: b.budgetInr,
    travelStyle: b.travelStyle,
    preferences: b.preferences,
    status: b.status,
    statusHistory: b.statusHistory,
    adminNote: b.adminNote,
    source: b.source,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    ...(b.user?.email ? { user: { name: b.user.name, email: b.user.email } } : {}),
  };
}

export async function createBooking(userId, data, { source = 'form', chatSession = null } = {}) {
  const state = evaluateDraft(data);
  if (!state.ready) {
    const details = [...state.missing.map((f) => ({ path: f, message: `${FIELD_LABELS[f]} is required.` })), ...state.errors.map((e) => ({ path: e.field, message: e.message }))];
    throw AppError.badRequest('The booking request is incomplete', details);
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const doc = await Booking.create({
        ...toDoc(data),
        reference: newReference(),
        user: userId,
        source,
        chatSession,
        statusHistory: [{ status: 'pending', note: 'Request submitted' }],
      });
      return toPublicBooking(doc.toObject());
    } catch (err) {
      if (err.code !== 11000) throw err; // retry only on a reference collision
    }
  }
  throw new AppError(500, 'INTERNAL', 'Could not generate a booking reference. Please try again.');
}

export async function listUserBookings(userId) {
  const docs = await Booking.find({ user: userId }).sort({ createdAt: -1 }).limit(100).lean();
  return docs.map(toPublicBooking);
}

async function findOwned(idOrRef, user) {
  const query = mongoose.isValidObjectId(idOrRef) ? { _id: idOrRef } : { reference: String(idOrRef).toUpperCase() };
  const doc = await Booking.findOne(query);
  // Someone else's booking looks the same as a missing one.
  if (!doc || (String(doc.user) !== user.id && user.role !== 'admin')) throw AppError.notFound('Booking request not found');
  return doc;
}

export async function getBooking(idOrRef, user) {
  return toPublicBooking((await findOwned(idOrRef, user)).toObject());
}

export async function cancelBooking(idOrRef, user) {
  const doc = await findOwned(idOrRef, user);
  if (!['pending', 'reviewing'].includes(doc.status)) {
    throw AppError.conflict(doc.status === 'cancelled' ? 'This request is already cancelled.' : `This request has been ${doc.status} and can no longer be cancelled.`);
  }
  doc.status = 'cancelled';
  doc.statusHistory.push({ status: 'cancelled', note: 'Cancelled by traveller' });
  await doc.save();
  return toPublicBooking(doc.toObject());
}

export async function adminListBookings({ status, type } = {}) {
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  const docs = await Booking.find(filter).sort({ createdAt: -1 }).limit(200).populate('user', 'name email').lean();
  return docs.map(toPublicBooking);
}

export async function adminUpdateStatus(id, { status, note }) {
  if (!mongoose.isValidObjectId(id)) throw AppError.notFound('Booking request not found');
  const doc = await Booking.findById(id);
  if (!doc) throw AppError.notFound('Booking request not found');
  if (doc.status === 'cancelled') throw AppError.conflict('The traveller cancelled this request.');
  doc.status = status;
  doc.adminNote = note ?? doc.adminNote;
  doc.statusHistory.push({ status, note: note ?? null });
  await doc.save();
  await doc.populate('user', 'name email');
  return toPublicBooking(doc.toObject());
}

export async function adminStats() {
  const [byStatus, byType] = await Promise.all([
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
  ]);
  const tally = (rows, keys) => Object.fromEntries(keys.map((k) => [k, rows.find((r) => r._id === k)?.count ?? 0]));
  return { byStatus: tally(byStatus, BOOKING_STATUSES), byType: tally(byType, BOOKING_TYPES) };
}

export { BOOKING_TYPES, BOOKING_STATUSES, TRAVEL_STYLES };
