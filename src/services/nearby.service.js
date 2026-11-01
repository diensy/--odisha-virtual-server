import { NEARBY_CATEGORIES, findAllNearby } from '../providers/overpass.js';
import { findAllNearbyViaNominatim } from '../providers/nearbyFallback.js';
import { cached } from '../utils/cache.js';
import { haversineMeters, roundCoord } from '../utils/geo.js';

export const NEARBY_CATEGORY_KEYS = Object.keys(NEARBY_CATEGORIES);

const OSM_SOURCE = { label: '© OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' };

const FALLBACK_NAMES = {
  toilet: 'Public washroom',
  atm: 'ATM',
  pharmacy: 'Pharmacy',
  transport: 'Transport stop',
};

/**
 * All amenities around a point, from Overpass, cached for a week and served stale for a month.
 * When Overpass is down and nothing is cached, Nominatim search fills in; that smaller result is
 * kept for a day only, so a full Overpass answer replaces it soon.
 */
export async function loadNearby(center, radius) {
  const point = { lat: roundCoord(center.lat), lng: roundCoord(center.lng) };
  try {
    return await cached(
      { key: `nearby:${point.lat},${point.lng}:${radius}`, provider: 'overpass', ttlSeconds: 7 * 86400, staleSeconds: 30 * 86400 },
      () => findAllNearby(point, radius),
    );
  } catch (overpassError) {
    try {
      return await cached(
        { key: `nearby-search:${point.lat},${point.lng}:${radius}`, provider: 'nominatim', ttlSeconds: 86400, staleSeconds: 30 * 86400 },
        () => findAllNearbyViaNominatim(point, radius),
      );
    } catch {
      throw overpassError;
    }
  }
}

export async function getNearby({ lat, lng }, categories = NEARBY_CATEGORY_KEYS, { radius = 1500, limit = 8 } = {}) {
  const center = { lat, lng };
  let result;
  try {
    result = await loadNearby(center, radius);
  } catch (err) {
    return {
      center,
      groups: categories.map((c) => ({ category: c, label: NEARBY_CATEGORIES[c].label, places: [] })),
      error: err.message,
      source: OSM_SOURCE,
    };
  }

  const groups = categories.map((category) => ({
    category,
    label: NEARBY_CATEGORIES[category].label,
    radiusMeters: radius,
    places: result.data
      .filter((p) => p.category === category)
      // Unnamed restaurants or hotels are not useful to a visitor; unnamed washrooms and ATMs are.
      .filter((p) => p.name || FALLBACK_NAMES[category])
      .map((p) => ({ ...p, name: p.name ?? FALLBACK_NAMES[category], distanceMeters: haversineMeters(center, p) }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, limit),
  }));

  return { center, radiusMeters: radius, groups, fetchedAt: result.fetchedAt, stale: result.stale, source: OSM_SOURCE };
}
