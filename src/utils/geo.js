const EARTH_RADIUS_M = 6371000;
const toRad = (deg) => (deg * Math.PI) / 180;

export function haversineMeters(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h)));
}

// Rounded coordinates make cache keys reusable across nearly identical requests.
export const roundCoord = (n, places = 3) => Number(n.toFixed(places));

export const isInOdishaRegion = ({ lat, lng }) => lat > 17 && lat < 23.5 && lng > 81 && lng < 88.5;
