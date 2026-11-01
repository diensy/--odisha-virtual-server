import { searchAmenity } from './nominatim.js';
import { AppError } from '../utils/AppError.js';

/**
 * Nearby places from Nominatim, for when every Overpass server is down. Nominatim answers one
 * search word at a time (and at most once a second), so this covers each category with its
 * most common kinds only, and returns the same place shape as the Overpass provider.
 */
const SEARCHES = [
  { term: 'restaurant', category: 'restaurant', match: (r) => ['restaurant', 'cafe', 'fast_food'].includes(r.type) },
  { term: 'cafe', category: 'restaurant', match: (r) => ['restaurant', 'cafe', 'fast_food'].includes(r.type) },
  { term: 'hotel', category: 'hotel', match: (r) => ['hotel', 'guest_house', 'hostel', 'motel'].includes(r.type) },
  { term: 'toilets', category: 'toilet', match: (r) => r.type === 'toilets' },
  { term: 'hospital', category: 'hospital', match: (r) => ['hospital', 'clinic'].includes(r.type) },
  { term: 'pharmacy', category: 'pharmacy', match: (r) => r.type === 'pharmacy' },
  { term: 'atm', category: 'atm', match: (r) => ['atm', 'bank'].includes(r.type) },
  { term: 'bus station', category: 'transport', match: (r) => ['bus_station', 'taxi', 'station'].includes(r.type) },
];

function toPlace(r, category) {
  const t = r.extratags ?? {};
  const a = r.address ?? {};
  const osmType = { N: 'node', W: 'way', R: 'relation' }[r.osm_type?.[0]?.toUpperCase()] ?? r.osm_type;
  const address = [a.house_number, a.road, a.village || a.town || a.city].filter(Boolean).join(', ');
  return {
    id: `${osmType}/${r.osm_id}`,
    name: r.name || null,
    category,
    subtype: (r.type ?? 'place').replace(/_/g, ' '),
    lat: Number(r.lat),
    lng: Number(r.lon),
    address: address || null,
    phone: t.phone || t['contact:phone'] || null,
    website: t.website || t['contact:website'] || null,
    openingHours: t.opening_hours || null,
    wheelchair: t.wheelchair || null,
    osmUrl: `https://www.openstreetmap.org/${osmType}/${r.osm_id}`,
  };
}

export async function findAllNearbyViaNominatim(center, radius) {
  const places = new Map();
  let answered = 0;
  for (const s of SEARCHES) {
    try {
      const results = await searchAmenity(center, radius, s.term);
      answered += 1;
      for (const r of results) {
        if (!s.match(r)) continue;
        const place = toPlace(r, s.category);
        if (!places.has(place.id)) places.set(place.id, place);
      }
    } catch {
      // One failed word leaves that kind empty; the rest still help.
    }
  }
  if (!answered) throw AppError.provider('OpenStreetMap', 'OpenStreetMap search is unavailable');
  return [...places.values()];
}
