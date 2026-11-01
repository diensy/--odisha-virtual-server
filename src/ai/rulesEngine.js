import { CATEGORIES } from '../models/Destination.js';
import { findDestinationsInText } from '../services/destination.service.js';
import { executeTool } from './tools/executors.js';
import { BOOKING_START, parseBookingMessage, runBookingRules } from './bookingRules.js';

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const NEARBY_WORDS = {
  restaurant: /\b(food|eat|eating|restaurants?|cafes?|caf[eé]s?|lunch|dinner|breakfast|snacks?)\b/,
  hotel: /\b(hotels?|stay|stays|lodges?|guest ?house|hostels?|accommodation|rooms?)\b/,
  toilet: /\b(toilets?|washrooms?|restrooms?|bathrooms?|loo)\b/,
  hospital: /\b(hospitals?|doctors?|clinics?|medical|emergency)\b/,
  pharmacy: /\b(pharmac(y|ies)|chemists?|medicines?|drug ?store)\b/,
  atm: /\b(atms?|cash|banks?)\b/,
  transport: /\b(bus|buses|train|railway|station|taxi|cab|transport)\b/,
};

const CATEGORY_WORDS = {
  temple: /\btemples?\b/,
  heritage: /\b(heritage|history|historic|monuments?|caves?|buddhist)\b/,
  beach: /\b(beach|beaches|sea|coast)\b/,
  nature: /\b(nature|wildlife|lake|birds?|zoo|dolphins?)\b/,
  culture: /\b(culture|crafts?|art|villages?|pattachitra|festivals?)\b/,
};

const ME = /\b(me|my location|here|i am|i'm|current location)\b/;
const STOP = '(?=[?.!,]|\\s+(?:and|by|in|today|tomorrow|now)\\b|$)';

function detectRoute(text) {
  let m = text.match(new RegExp(`how far is (.+?) from (.+?)${STOP}`));
  if (m) return { destination: m[1], origin: m[2] };
  m = text.match(new RegExp(`from (.+?) to (.+?)${STOP}`));
  if (m) return { origin: m[1], destination: m[2] };
  m = text.match(new RegExp(`(?:reach|get to|go to|route to|directions to|distance to|drive to) (.+?)${STOP}`));
  if (m) return { origin: null, destination: m[1] };
  return null;
}

const isUserRef = (s) => !s || /^(here|me|my (current )?location|where i am|current location)$/.test(s.trim());

function planTools(text, mentioned, ctx) {
  const calls = [];
  const first = mentioned[0]?.name ?? null;

  const days = text.match(/(\d)\s*-?\s*days?/);
  const isPackage = /\b(packages?|budget trip|cheap trip)\b/.test(text) || (/\btrip\b/.test(text) && /\b(under|within|budget)\b.*\d/.test(text));
  if ((/\b(plan|itinerary|trip)\b/.test(text) && (days || /\bday trip\b/.test(text))) || isPackage) {
    const base = /\bfrom puri\b/.test(text) ? 'puri' : /\bfrom konark\b/.test(text) ? 'konark' : 'bhubaneswar';
    const interests = CATEGORIES.filter((c) => CATEGORY_WORDS[c].test(text));
    const parsed = parseBookingMessage(text);
    calls.push({
      name: 'create_itinerary',
      args: {
        days: Math.min(Math.max(Number(days?.[1] ?? (isPackage ? 2 : 1)), 1), 5),
        base,
        interests,
        include_destinations: mentioned.map((d) => d.name),
        travelers: parsed.travelers && parsed.travelers <= 20 ? parsed.travelers : null,
        travel_style: parsed.travelStyle ?? (isPackage && parsed.budgetInr ? 'budget' : null),
      },
      budgetInr: parsed.budgetInr,
    });
    return calls;
  }

  if (/\b(how far|distance|route|directions|reach|get to|drive|way to)\b/.test(text)) {
    const r = detectRoute(text);
    if (r) {
      const userOrigin = isUserRef(r.origin);
      calls.push({
        name: 'get_route',
        args: { origin: userOrigin ? null : r.origin, origin_is_user_location: userOrigin, destination: r.destination },
      });
    } else if (mentioned.length >= 2) {
      calls.push({ name: 'get_route', args: { origin: mentioned[0].name, origin_is_user_location: false, destination: mentioned[1].name } });
    } else if (first) {
      calls.push({ name: 'get_route', args: { origin: null, origin_is_user_location: true, destination: first } });
    }
  }

  if (/\b(weather|temperature|rain|forecast|hot|humid|climate today)\b/.test(text)) {
    calls.push({ name: 'get_weather', args: { place: first, use_user_location: !first } });
  }

  const nearbyCats = Object.keys(NEARBY_WORDS).filter((k) => NEARBY_WORDS[k].test(text));
  if (nearbyCats.length && !calls.some((c) => c.name === 'get_route')) {
    const useUser = !first && (ME.test(text) || Boolean(ctx.userLocation));
    calls.push({
      name: 'get_nearby_places',
      args: { place: first, use_user_location: useUser, categories: nearbyCats, radius_meters: null },
    });
  }

  if (/\b(photos?|images?|pictures?|pics?|gallery)\b/.test(text) && first) {
    calls.push({ name: 'get_destination_images', args: { destination: first, limit: 8 } });
  }

  if (/\b(guidelines?|rules?|dress|etiquette|tips|know before|allowed|foreigners?|foreign|safety|emergency number)\b/.test(text)) {
    calls.push({ name: 'get_visitor_guidelines', args: { destination: first } });
  }

  if (!calls.length && first) {
    for (const d of mentioned.slice(0, 2)) calls.push({ name: 'get_destination_details', args: { destination: d.name } });
  }

  if (!calls.length) {
    const category = CATEGORIES.find((c) => CATEGORY_WORDS[c].test(text)) ?? null;
    if (category || /\b(visit|see|places|destinations|explore|attractions?)\b/.test(text)) {
      calls.push({ name: 'search_destinations', args: { query: null, category } });
    }
  }
  return calls;
}

const formatDuration = (min) => (min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`);
const formatKm = (km) => `${km >= 10 ? Math.round(km) : km.toFixed(1)} km`;
const formatMeters = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);

function describe(name, result) {
  if (!result.ok) return result.forModel.error;
  const r = result.forModel;
  switch (name) {
    case 'search_destinations':
      return r.count ? `I found ${r.count} destination${r.count > 1 ? 's' : ''} that fit. Open any card for photos, the map and nearby facilities.` : 'Nothing in the catalogue matches that yet.';
    case 'get_destination_details':
      return `${r.name}, ${r.district}. ${r.description[0] ?? ''}`.trim();
    case 'get_destination_images':
      return r.imageCount ? `Here are ${r.imageCount} photographs of ${r.destination}, each credited to its photographer.` : `I don't have licensed photos of ${r.destination} yet.`;
    case 'get_weather': {
      const c = r.current;
      const stale = r.stale ? ' (latest available reading; live data is temporarily unavailable)' : '';
      return `Right now near ${r.place}: ${c.condition.toLowerCase()}, ${Math.round(c.temperatureC)}°C, feels like ${Math.round(c.feelsLikeC)}°C${stale}. The 5-day outlook is below.`;
    }
    case 'get_nearby_places': {
      if (r.error) return `Nearby listings around ${r.place} are temporarily unavailable. Please try again in a few minutes.`;
      const parts = r.groups.map((g) => {
        if (!g.places.length) return `no ${g.category} listings found nearby`;
        const n = g.places[0];
        return `nearest ${g.category === 'toilet' ? 'washroom' : g.category}: ${n.name} (${formatMeters(n.distanceMeters)})`;
      });
      return `Around ${r.place} — ${parts.join('; ')}. Listings come from OpenStreetMap and may be incomplete.`;
    }
    case 'get_route':
      return `${r.origin.name} to ${r.destination.name} is about ${formatKm(r.distanceKm)} by road, roughly ${formatDuration(r.durationMinutes)} of driving. That is an estimate without traffic or stops.`;
    case 'create_itinerary': {
      const cost = r.estimate
        ? ` Rough cost for ${r.estimate.travelers}: about ${inr(r.estimate.rangeInr.low)}–${inr(r.estimate.rangeInr.high)} (an estimate, excluding travel to Odisha).`
        : '';
      return `${r.title}: ${r.days.map((d) => `Day ${d.day} — ${d.stops.join(', ')}`).join('; ')}.${cost} ${r.notes.slice(1).join(' ')}`.trim();
    }
    case 'get_my_booking_requests':
      if (r.reference) return `Request ${r.reference} (${r.type} to ${r.destination}) is ${r.status}. You can cancel it from the card while it is pending or under review.`;
      return r.count ? `You have ${r.count} booking request${r.count > 1 ? 's' : ''}. The latest are below.` : 'You have not submitted any booking requests yet.';
    case 'get_visitor_guidelines':
      return r.destination ? `Here's what to know before visiting ${r.destination.name}.` : 'Here is general guidance for travelling in Odisha.';
    default:
      return '';
  }
}

export const RULES_HELP =
  'I can help with destinations, photos, weather, routes and travel times, nearby food, stays, washrooms, hospitals and ATMs, and day-by-day trip plans. Try naming a place, for example "Weather in Puri" or "How far is Konark from Bhubaneswar?"';

const REFERENCE = /\bOV-[0-9A-F]{6}\b/i;

export async function runRules({ message, ctx }) {
  const text = message.toLowerCase();
  const mentioned = await findDestinationsInText(message);
  let calls = planTools(text, mentioned, ctx);

  // Booking status and cancellation: the card shows the status and a Cancel button.
  const reference = message.match(REFERENCE)?.[0]?.toUpperCase() ?? null;
  if (reference || /\b(my (bookings?|booking requests?|requests?|reservations?)|booking status)\b/.test(text)) {
    calls = [{ name: 'get_my_booking_requests', args: { reference } }];
  } else if (ctx.booking.draft || BOOKING_START.test(message)) {
    const booking = runBookingRules({ message, mentioned, ctx });
    // A question unrelated to the open request ("weather in Puri?") is answered normally.
    if (booking && !(booking.parsedNothing && calls.length)) return booking;
  }
  if (!calls.length) return { text: RULES_HELP, blocks: [], toolCalls: [] };

  const blocks = [];
  const toolCalls = [];
  const sentences = [];
  for (const call of calls) {
    const result = await executeTool(call.name, call.args, ctx);
    toolCalls.push({ name: call.name, args: result.args ?? call.args, ok: result.ok });
    if (result.block) blocks.push(result.block);
    if (!['location_request', 'sign_in'].includes(result.block?.type)) sentences.push(describe(call.name, result));
    const estimate = result.ok && call.name === 'create_itinerary' ? result.forModel.estimate : null;
    if (estimate && call.budgetInr) {
      sentences.push(
        estimate.rangeInr.high <= call.budgetInr
          ? `That fits within your ${inr(call.budgetInr)} budget.`
          : `That may go over your ${inr(call.budgetInr)} budget; try fewer days or a budget style in the Trip Planner.`,
      );
    }
  }
  if (blocks.some((b) => b.type === 'location_request')) {
    sentences.push('Share your location below, or tell me where you are starting from.');
  }
  if (blocks.some((b) => b.type === 'sign_in')) sentences.push('Please sign in to see your booking requests.');
  if (ctx.booking.draft) sentences.push('Your booking request is still open. Answer the last question when you are ready, or say "discard".');
  return { text: sentences.filter(Boolean).join(' '), blocks, toolCalls };
}
