import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { fetchJson } from './http.js';

// Order matters: an element is filed under the first category whose test matches.
export const NEARBY_CATEGORIES = {
  restaurant: {
    label: 'Food & cafés',
    selectors: ['nwr["amenity"~"^(restaurant|cafe|fast_food)$"]'],
    test: (t) => ['restaurant', 'cafe', 'fast_food'].includes(t.amenity),
  },
  hotel: {
    label: 'Stays',
    selectors: ['nwr["tourism"~"^(hotel|guest_house|hostel|motel)$"]'],
    test: (t) => ['hotel', 'guest_house', 'hostel', 'motel'].includes(t.tourism),
  },
  toilet: { label: 'Washrooms', selectors: ['nwr["amenity"="toilets"]'], test: (t) => t.amenity === 'toilets' },
  hospital: {
    label: 'Hospitals & clinics',
    selectors: ['nwr["amenity"~"^(hospital|clinic)$"]'],
    test: (t) => ['hospital', 'clinic'].includes(t.amenity),
  },
  pharmacy: { label: 'Pharmacies', selectors: ['nwr["amenity"="pharmacy"]'], test: (t) => t.amenity === 'pharmacy' },
  atm: {
    label: 'ATMs & banks',
    selectors: ['nwr["amenity"~"^(atm|bank)$"]'],
    test: (t) => ['atm', 'bank'].includes(t.amenity),
  },
  transport: {
    label: 'Transport',
    selectors: ['nwr["amenity"~"^(bus_station|taxi)$"]', 'nwr["railway"="station"]'],
    test: (t) => ['bus_station', 'taxi'].includes(t.amenity) || t.railway === 'station',
  },
};

const CATEGORY_ENTRIES = Object.entries(NEARBY_CATEGORIES);

function buildQuery({ lat, lng }, radius) {
  const parts = CATEGORY_ENTRIES.flatMap(([, c]) => c.selectors.map((s) => `${s}(around:${radius},${lat},${lng});`));
  return `[out:json][timeout:20];(${parts.join('')});out center tags 400;`;
}

function toPlace(el) {
  const t = el.tags ?? {};
  const category = CATEGORY_ENTRIES.find(([, c]) => c.test(t))?.[0];
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!category || lat == null) return null;
  const address = [t['addr:housenumber'], t['addr:street'], t['addr:city']].filter(Boolean).join(', ');
  return {
    id: `${el.type}/${el.id}`,
    name: t['name:en'] || t.name || null,
    category,
    subtype: (t.amenity || t.tourism || (t.railway ? 'railway station' : 'place')).replace(/_/g, ' '),
    lat,
    lng,
    address: address || null,
    phone: t.phone || t['contact:phone'] || null,
    website: t.website || t['contact:website'] || null,
    openingHours: t.opening_hours || null,
    wheelchair: t.wheelchair || null,
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
  };
}

const REQUEST_BUDGET_MS = 20000;
const COOLDOWN_MS = 2 * 60 * 1000;
let cooldownUntil = 0;

// Batch jobs that schedule their own retries (the cache warmer) skip the cooldown.
export const resetOverpassCooldown = () => {
  cooldownUntil = 0;
};

/**
 * Every supported amenity around a point, in one Overpass request.
 * Public Overpass instances are frequently overloaded, so mirrors are tried in turn within a
 * time budget, and after a full failure we back off briefly instead of retrying every request.
 */
export async function findAllNearby(center, radius) {
  if (Date.now() < cooldownUntil) {
    throw AppError.provider('OpenStreetMap Overpass', 'OpenStreetMap Overpass is busy');
  }
  const body = new URLSearchParams({ data: buildQuery(center, radius) });
  const deadline = Date.now() + REQUEST_BUDGET_MS;
  let lastError;
  for (const url of env.overpassUrls) {
    const remaining = deadline - Date.now();
    if (remaining < 2000) break;
    try {
      const json = await fetchJson(url, {
        provider: 'OpenStreetMap Overpass',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeoutMs: Math.min(12000, remaining),
      });
      return (json.elements ?? []).map(toPlace).filter(Boolean);
    } catch (err) {
      lastError = err;
    }
  }
  cooldownUntil = Date.now() + COOLDOWN_MS;
  throw lastError ?? AppError.provider('OpenStreetMap Overpass', 'No Overpass endpoint configured');
}
