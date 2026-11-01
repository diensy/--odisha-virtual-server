import { getDrivingRoute } from '../providers/osrm.js';
import { geocode } from '../providers/nominatim.js';
import { AppError } from '../utils/AppError.js';
import { cached } from '../utils/cache.js';
import { haversineMeters, isInOdishaRegion, roundCoord } from '../utils/geo.js';
import { findDestinationByText, getDestinationDoc } from './destination.service.js';
import { findTown } from '../config/towns.js';

const ROUTE_SOURCE = { label: 'OSRM · © OpenStreetMap contributors', url: 'https://project-osrm.org/' };

/**
 * Turns a slug, coordinates or free text into a named point.
 * Town names resolve to the town centre, then catalogue destinations, then geocoding.
 */
export async function resolvePlace(input) {
  if (input.lat != null && input.lng != null) {
    return { name: input.label || 'Your location', lat: input.lat, lng: input.lng, kind: 'coordinates' };
  }
  if (input.slug) {
    const d = await getDestinationDoc(input.slug);
    return { name: d.name, slug: d.slug, lat: d.location.latitude, lng: d.location.longitude, kind: 'destination' };
  }
  const query = input.query?.trim();
  if (!query) throw AppError.badRequest('A place name, destination or coordinates is required.');

  const town = findTown(query);
  if (town) return { ...town, kind: 'town' };

  const d = await findDestinationByText(query);
  if (d) return { name: d.name, slug: d.slug, lat: d.location.latitude, lng: d.location.longitude, kind: 'destination' };

  const result = await cached(
    { key: `geocode:${query.toLowerCase()}`, provider: 'nominatim', ttlSeconds: 30 * 86400 },
    () => geocode(query),
  );
  const hit = result.data[0];
  if (!hit) throw new AppError(422, 'PLACE_NOT_FOUND', `Couldn't find "${query}" in Odisha. Try a nearby town or landmark.`);
  return { name: hit.name, label: hit.label, lat: hit.lat, lng: hit.lng, kind: 'geocoded' };
}

export function directionsUrl(origin, destination) {
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: 'driving',
  });
  return `https://www.google.com/maps/dir/?${params}`;
}

export async function getRoute(originInput, destinationInput) {
  const [origin, destination] = await Promise.all([resolvePlace(originInput), resolvePlace(destinationInput)]);
  for (const p of [origin, destination]) {
    if (!isInOdishaRegion(p)) {
      throw new AppError(422, 'OUT_OF_REGION', `${p.name} is outside the region OdishaVirtual covers.`);
    }
  }

  const straightLineKm = Math.round(haversineMeters(origin, destination) / 100) / 10;
  const key = `route:${roundCoord(origin.lat)},${roundCoord(origin.lng)}:${roundCoord(destination.lat)},${roundCoord(destination.lng)}`;
  const result = await cached({ key, provider: 'osrm', ttlSeconds: 7 * 86400 }, () => getDrivingRoute([origin, destination]));

  return {
    origin,
    destination,
    distanceKm: result.data.distanceKm,
    durationMinutes: result.data.durationMinutes,
    straightLineKm,
    geometry: result.data.geometry,
    mode: 'driving',
    isEstimate: true,
    directionsUrl: directionsUrl(origin, destination),
    fetchedAt: result.fetchedAt,
    stale: result.stale,
    source: ROUTE_SOURCE,
  };
}

/** Multi-stop driving route, used by the itinerary planner. */
export async function getMultiStopRoute(points) {
  const key = `multiroute:${points.map((p) => `${roundCoord(p.lat)},${roundCoord(p.lng)}`).join(';')}`;
  const result = await cached({ key, provider: 'osrm', ttlSeconds: 7 * 86400 }, () => getDrivingRoute(points));
  return result.data;
}
