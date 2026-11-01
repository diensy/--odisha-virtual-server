import { ApiCache } from '../models/ApiCache.js';

const inFlight = new Map();

/**
 * Read-through cache backed by MongoDB. Entries stay fresh for ttlSeconds and are kept
 * for staleSeconds more so a provider outage can fall back to the last good result.
 */
export async function cached({ key, provider, ttlSeconds, staleSeconds = 86400 }, fetcher) {
  const entry = await ApiCache.findOne({ key }).lean();
  const now = Date.now();
  if (entry && entry.fetchedAt.getTime() + ttlSeconds * 1000 > now) {
    return { data: entry.data, fetchedAt: entry.fetchedAt, stale: false, cached: true };
  }

  if (!inFlight.has(key)) {
    const task = (async () => {
      const data = await fetcher();
      const fetchedAt = new Date();
      await ApiCache.updateOne(
        { key },
        { key, provider, data, fetchedAt, expiresAt: new Date(fetchedAt.getTime() + (ttlSeconds + staleSeconds) * 1000) },
        { upsert: true },
      );
      return { data, fetchedAt, stale: false, cached: false };
    })().finally(() => inFlight.delete(key));
    inFlight.set(key, task);
  }

  try {
    return await inFlight.get(key);
  } catch (err) {
    if (entry) return { data: entry.data, fetchedAt: entry.fetchedAt, stale: true, cached: true };
    throw err;
  }
}
