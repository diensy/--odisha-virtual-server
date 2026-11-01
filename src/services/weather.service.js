import { getForecast } from '../providers/openMeteo.js';
import { cached } from '../utils/cache.js';
import { roundCoord } from '../utils/geo.js';

export async function getWeather({ lat, lng }) {
  const point = { lat: roundCoord(lat, 2), lng: roundCoord(lng, 2) };
  const result = await cached(
    { key: `weather:${point.lat},${point.lng}`, provider: 'open-meteo', ttlSeconds: 30 * 60, staleSeconds: 6 * 3600 },
    () => getForecast(point),
  );
  return {
    ...result.data,
    fetchedAt: result.fetchedAt,
    stale: result.stale,
    source: { label: 'Open-Meteo', url: 'https://open-meteo.com/' },
  };
}
