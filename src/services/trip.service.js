import mongoose from 'mongoose';
import { Trip } from '../models/Trip.js';
import { Itinerary } from '../models/Itinerary.js';
import { AppError } from '../utils/AppError.js';
import { getItinerary } from './itinerary.service.js';

const parseDate = (s) => (s ? new Date(`${s}T00:00:00Z`) : null);

function toPublicTrip(t, itinerary) {
  return {
    id: String(t._id),
    title: t.title,
    startDate: t.startDate,
    travelers: t.travelers,
    notes: t.notes,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    itineraryId: String(t.itinerary?._id ?? t.itinerary),
    ...(itinerary ? { itinerary } : {}),
  };
}

async function findOwned(id, userId) {
  if (!mongoose.isValidObjectId(id)) throw AppError.notFound('Trip not found');
  const trip = await Trip.findOne({ _id: id, user: userId });
  if (!trip) throw AppError.notFound('Trip not found');
  return trip;
}

export async function saveTrip(userId, { itineraryId, title, startDate, travelers, notes }) {
  const itinerary = await Itinerary.findById(itineraryId).select('title travelers').lean();
  if (!itinerary) throw AppError.notFound('Itinerary not found');
  const trip = await Trip.create({
    user: userId,
    itinerary: itineraryId,
    title: title ?? itinerary.title,
    startDate: parseDate(startDate),
    travelers: travelers ?? itinerary.travelers ?? null,
    notes: notes ?? '',
  });
  return toPublicTrip(trip.toObject());
}

export async function listTrips(userId) {
  const trips = await Trip.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('itinerary', 'title base days.day days.stops.name days.stops.slug estimate.total')
    .lean();
  return trips.map((t) =>
    toPublicTrip(t, t.itinerary && {
      id: String(t.itinerary._id),
      title: t.itinerary.title,
      base: t.itinerary.base,
      dayCount: t.itinerary.days.length,
      stops: t.itinerary.days.flatMap((d) => d.stops.map((s) => s.name)),
      estimatedTotal: t.itinerary.estimate?.total ?? null,
    }),
  );
}

export async function getTrip(id, userId) {
  const trip = await findOwned(id, userId);
  return toPublicTrip(trip.toObject(), await getItinerary(String(trip.itinerary)));
}

export async function updateTrip(id, userId, patch) {
  const trip = await findOwned(id, userId);
  if (patch.title !== undefined) trip.title = patch.title;
  if (patch.startDate !== undefined) trip.startDate = parseDate(patch.startDate);
  if (patch.travelers !== undefined) trip.travelers = patch.travelers;
  if (patch.notes !== undefined) trip.notes = patch.notes;
  await trip.save();
  return toPublicTrip(trip.toObject());
}

export async function deleteTrip(id, userId) {
  const trip = await findOwned(id, userId);
  await trip.deleteOne();
}
