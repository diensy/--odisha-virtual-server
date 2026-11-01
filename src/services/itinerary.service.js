import mongoose from 'mongoose';
import { Destination } from '../models/Destination.js';
import { Itinerary } from '../models/Itinerary.js';
import { AppError } from '../utils/AppError.js';
import { haversineMeters } from '../utils/geo.js';
import { getMultiStopRoute } from './routing.service.js';
import { TOWNS } from '../config/towns.js';
import { estimateTripCost } from './estimate.service.js';

const { bhubaneswar, puri, konark } = TOWNS;
export const BASES = { bhubaneswar, puri, konark };

const DAY_BUDGET_MINUTES = 8 * 60;
// Rough planning figures only; real distances come from OSRM once the days are fixed.
const ROAD_FACTOR = 1.35;
const PLANNING_SPEED_KMH = 38;

// Rough allowance for travel between stops when deciding how many places fit.
const SELECTION_OVERHEAD_MINUTES = 50;

/** Must-sees first, then catalogue priority, until the days are reasonably full. */
function selectForDays(candidates, include, dayCount) {
  const ranked = [...candidates].sort(
    (a, b) => Number(include.includes(b.slug)) - Number(include.includes(a.slug)) || a.order - b.order,
  );
  const capacity = dayCount * DAY_BUDGET_MINUTES * 0.85;
  const chosen = [];
  let used = 0;
  for (const d of ranked) {
    const cost = (d.visitorInfo?.visitMinutes ?? 90) + SELECTION_OVERHEAD_MINUTES;
    if (used + cost <= capacity || include.includes(d.slug)) {
      chosen.push(d);
      used += cost;
    }
  }
  return chosen;
}

const estimateDriveMinutes = (a, b) => ((haversineMeters(a, b) / 1000) * ROAD_FACTOR * 60) / PLANNING_SPEED_KMH;
const point = (d) => ({ lat: d.location.latitude, lng: d.location.longitude });

function orderByNearestNeighbour(start, docs) {
  const remaining = [...docs];
  const ordered = [];
  let cursor = start;
  while (remaining.length) {
    remaining.sort((a, b) => haversineMeters(cursor, point(a)) - haversineMeters(cursor, point(b)));
    const next = remaining.shift();
    ordered.push(next);
    cursor = point(next);
  }
  return ordered;
}

function packIntoDays(start, ordered, dayCount) {
  const days = [];
  const skipped = [];
  let cursor = start;
  let current = { stops: [], minutes: 0 };

  for (const d of ordered) {
    const cost = estimateDriveMinutes(cursor, point(d)) + (d.visitorInfo?.visitMinutes ?? 90);
    if (current.stops.length && current.minutes + cost > DAY_BUDGET_MINUTES) {
      days.push(current);
      current = { stops: [], minutes: 0 };
    }
    if (days.length >= dayCount) {
      skipped.push(d);
      continue;
    }
    current.stops.push(d);
    current.minutes += cost;
    cursor = point(d);
  }
  if (current.stops.length && days.length < dayCount) days.push(current);
  return { days, skipped };
}

async function measureDay(startPoint, stops) {
  const points = [startPoint, ...stops.map(point)];
  try {
    const route = await getMultiStopRoute(points);
    const names = [startPoint.name, ...stops.map((s) => s.name)];
    return {
      legs: route.legs.map((leg, i) => ({ from: names[i], to: names[i + 1], ...leg })),
      totalDistanceKm: route.distanceKm,
      totalDriveMinutes: route.durationMinutes,
      geometry: route.geometry,
      ok: true,
    };
  } catch {
    return { legs: [], totalDistanceKm: null, totalDriveMinutes: null, geometry: [], ok: false };
  }
}

export async function createItinerary({ days, base = 'bhubaneswar', interests = [], include = [], travelers = 2, travelStyle = 'standard' }) {
  const start = BASES[base];
  if (!start) throw AppError.badRequest(`Unknown base "${base}". Use one of: ${Object.keys(BASES).join(', ')}`);

  // Interests narrow the pool; must-see places are always added on top of it.
  const filter = { published: true };
  if (interests.length) filter.$or = [{ category: { $in: interests } }, { slug: { $in: include } }];
  const candidates = await Destination.find(filter).lean();
  if (!candidates.length) throw new AppError(422, 'NO_DESTINATIONS', 'No destinations match those interests yet.');

  const ordered = orderByNearestNeighbour(start, selectForDays(candidates, include, days));
  const packed = packIntoDays(start, ordered, days);

  let cursor = { ...start };
  const planned = [];
  for (const [i, day] of packed.days.entries()) {
    const measured = await measureDay(cursor, day.stops);
    planned.push({
      day: i + 1,
      theme: [...new Set(day.stops.map((s) => s.location.district))].join(' · '),
      stops: day.stops.map((s) => ({
        slug: s.slug,
        name: s.name,
        category: s.category,
        lat: s.location.latitude,
        lng: s.location.longitude,
        suggestedDuration: s.visitorInfo?.suggestedDuration ?? null,
      })),
      legs: measured.legs.map(({ from, to, distanceKm, durationMinutes }) => ({ from, to, distanceKm, durationMinutes })),
      geometry: measured.geometry,
      totalDistanceKm: measured.totalDistanceKm,
      totalDriveMinutes: measured.totalDriveMinutes,
      routingOk: measured.ok,
    });
    const last = day.stops.at(-1);
    cursor = { name: last.name, ...point(last) };
  }

  const notes = ['Drive times are road-network estimates and do not include traffic, parking or queues.'];
  if (packed.skipped.length) {
    notes.push(`Not enough time for ${packed.skipped.map((d) => d.name).join(', ')}. Add a day to include them.`);
  }
  if (planned.length < days) notes.push(`These selections fit into ${planned.length} day(s); the remaining time is free.`);
  const routingAvailable = planned.every((d) => d.routingOk);
  if (!routingAvailable) notes.push('Road distances are temporarily unavailable for some days.');

  const measuredKm = planned.every((d) => d.totalDistanceKm != null) ? planned.reduce((n, d) => n + d.totalDistanceKm, 0) : null;
  const estimate = estimateTripCost({ days: planned.length || days, totalDistanceKm: measuredKm, travelers, travelStyle });

  const doc = await Itinerary.create({
    title: `${days}-day Odisha plan from ${start.name}`,
    base: start.name,
    days: planned.map(({ routingOk, ...rest }) => rest),
    notes,
    routingAvailable,
    travelers,
    travelStyle,
    estimate,
  });

  return formatItinerary(doc.toObject());
}

export async function getItinerary(id) {
  if (!mongoose.isValidObjectId(id)) throw AppError.notFound('Itinerary not found');
  const doc = await Itinerary.findById(id).lean();
  if (!doc) throw AppError.notFound('Itinerary not found');
  return formatItinerary(doc);
}

function formatItinerary(doc) {
  return {
    id: String(doc._id),
    title: doc.title,
    base: doc.base,
    days: doc.days,
    notes: doc.notes,
    routingAvailable: doc.routingAvailable,
    travelers: doc.travelers ?? null,
    travelStyle: doc.travelStyle ?? null,
    estimate: doc.estimate ?? null,
    createdAt: doc.createdAt,
    source: { label: 'OSRM · © OpenStreetMap contributors', url: 'https://project-osrm.org/' },
  };
}
