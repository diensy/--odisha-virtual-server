// Prefetches nearby amenities for every published destination so destination pages do not
// depend on the public Overpass service being available at request time.
import { connectDb, disconnectDb } from '../config/db.js';
import { Destination } from '../models/Destination.js';
import { loadNearby } from '../services/nearby.service.js';
import { resetOverpassCooldown } from '../providers/overpass.js';

const RADIUS = 1500;
const ATTEMPTS = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await connectDb();
const destinations = await Destination.find({ published: true }).lean();
let failed = 0;

for (const d of destinations) {
  const center = { lat: d.location.latitude, lng: d.location.longitude };
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    resetOverpassCooldown();
    try {
      const { data, cached } = await loadNearby(center, RADIUS);
      console.log(`✓ ${d.name}: ${data.length} places${cached ? ' (already cached)' : ''}`);
      break;
    } catch (err) {
      if (attempt === ATTEMPTS) {
        failed += 1;
        console.warn(`! ${d.name}: ${err.message}`);
      } else {
        await sleep(5000 * 2 ** (attempt - 1));
      }
    }
  }
  await sleep(1500);
}

await disconnectDb();
process.exit(failed ? 1 : 0);
