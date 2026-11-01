import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export async function fetchJson(url, { provider, timeoutMs = 12000, ...init } = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...init,
      headers: { 'User-Agent': env.userAgent, Accept: 'application/json', ...init.headers },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const reason = err.name === 'TimeoutError' ? 'timed out' : 'could not be reached';
    throw AppError.provider(provider, `${provider} ${reason}`);
  }
  if (!res.ok) throw AppError.provider(provider, `${provider} responded with ${res.status}`);
  try {
    return await res.json();
  } catch {
    throw AppError.provider(provider, `${provider} returned an unreadable response`);
  }
}
