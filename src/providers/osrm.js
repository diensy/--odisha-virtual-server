import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { fetchJson } from './http.js';

/** Road route through the given points ([{lat,lng}, ...]) using the OSRM driving profile. */
export async function getDrivingRoute(points) {
  const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = `${env.OSRM_URL}/route/v1/driving/${coords}?overview=simplified&geometries=geojson&steps=false`;
  const json = await fetchJson(url, { provider: 'OSRM', timeoutMs: 15000 });

  if (json.code !== 'Ok' || !json.routes?.length) {
    throw new AppError(422, 'NO_ROUTE', 'No drivable route was found between these places.');
  }
  const route = json.routes[0];
  return {
    distanceKm: Math.round(route.distance / 100) / 10,
    durationMinutes: Math.round(route.duration / 60),
    // Leaflet expects [lat, lng]
    geometry: route.geometry.coordinates.map(([lng, lat]) => [Number(lat.toFixed(5)), Number(lng.toFixed(5))]),
    legs: route.legs.map((leg) => ({
      distanceKm: Math.round(leg.distance / 100) / 10,
      durationMinutes: Math.round(leg.duration / 60),
    })),
  };
}
