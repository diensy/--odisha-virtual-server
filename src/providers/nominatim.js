import { env } from '../config/env.js';
import { fetchJson } from './http.js';

// Bias results to Odisha and its immediate surroundings.
const ODISHA_VIEWBOX = '81.3,22.6,87.6,17.7';

let lastCall = 0;
// Nominatim's public usage policy allows at most one request per second.
async function throttle() {
  const wait = lastCall + 1100 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
}

/**
 * Named places of one kind ("toilets", "hospital"…) inside a box around a point. Nominatim
 * maps such words to OpenStreetMap tags. Used when the Overpass servers are unavailable.
 */
export async function searchAmenity({ lat, lng }, radiusMeters, term) {
  await throttle();
  const dLat = radiusMeters / 111320;
  const dLng = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  const params = new URLSearchParams({
    q: term,
    format: 'jsonv2',
    limit: '20',
    viewbox: [lng - dLng, lat + dLat, lng + dLng, lat - dLat].map((n) => n.toFixed(5)).join(','),
    bounded: '1',
    extratags: '1',
    addressdetails: '1',
  });
  return fetchJson(`${env.NOMINATIM_URL}/search?${params}`, { provider: 'Nominatim', timeoutMs: 8000 });
}

export async function geocode(query) {
  await throttle();
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '5',
    countrycodes: 'in',
    viewbox: ODISHA_VIEWBOX,
    bounded: '1',
    addressdetails: '0',
  });
  const json = await fetchJson(`${env.NOMINATIM_URL}/search?${params}`, { provider: 'Nominatim' });
  return json.map((r) => ({
    name: r.name || r.display_name.split(',')[0],
    label: r.display_name,
    lat: Number(r.lat),
    lng: Number(r.lon),
  }));
}
