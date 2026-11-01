import { AppError } from '../../utils/AppError.js';
import {
  findDestinationByText,
  getDestinationDetail,
  getImages,
  listDestinations,
  toCard,
} from '../../services/destination.service.js';
import { getWeather } from '../../services/weather.service.js';
import { getNearby } from '../../services/nearby.service.js';
import { getRoute, resolvePlace } from '../../services/routing.service.js';
import { createItinerary } from '../../services/itinerary.service.js';
import { getGuidelines } from '../../services/guidelines.service.js';
import { draftBlock, evaluateDraft, getBooking, listUserBookings, mergeDraft } from '../../services/booking.service.js';
import { TOOL_DEFINITIONS } from './definitions.js';

/** Thrown when a tool needs the user's location and it hasn't been shared. */
class LocationRequired extends AppError {
  constructor(purpose) {
    super(428, 'LOCATION_REQUIRED', 'The user has not shared their location. Ask them to share it or name a starting place.');
    this.purpose = purpose;
  }
}

/** Thrown when a tool needs a signed-in user. */
class SignInRequired extends AppError {
  constructor(purpose) {
    super(401, 'SIGN_IN_REQUIRED', `The user is not signed in. Ask them to sign in to ${purpose}.`);
    this.purpose = purpose;
  }
}

async function requireDestination(text) {
  const d = await findDestinationByText(text);
  if (!d) {
    throw new AppError(
      404,
      'UNKNOWN_DESTINATION',
      `"${text}" is not in the OdishaVirtual catalogue. Use search_destinations to see what is available.`,
    );
  }
  return d;
}

async function placeOrUser(place, useUser, ctx, purpose) {
  if (useUser) {
    if (!ctx.userLocation) throw new LocationRequired(purpose);
    return { name: 'Your location', ...ctx.userLocation, kind: 'coordinates' };
  }
  if (!place) throw AppError.badRequest('A place name is required when not using the user location.');
  return resolvePlace({ query: place });
}

const executors = {
  async search_destinations({ query, category }, ctx) {
    const items = await listDestinations({ q: query ?? undefined, category: category ?? undefined, lang: ctx.language });
    return {
      forModel: { count: items.length, destinations: items.map(({ name, slug, category: c, district, tagline }) => ({ name, slug, category: c, district, tagline })) },
      block: items.length ? { type: 'destinations', items } : null,
    };
  },

  async get_destination_details({ destination }, ctx) {
    const d = await requireDestination(destination);
    const detail = await getDestinationDetail(d.slug, ctx.language);
    return {
      forModel: {
        name: detail.name,
        slug: detail.slug,
        category: detail.category,
        district: detail.district,
        address: detail.address,
        description: detail.description,
        highlights: detail.highlights,
        visitorInfo: detail.visitorInfo,
        sources: detail.sources,
        story: detail.story.map(({ era, title, text }) => ({ era, title, text: text.join(' ') })),
        nearbyDestinations: detail.related.map((r) => ({ name: r.name, straightLineKm: r.distanceKm })),
      },
      block: {
        type: 'destination',
        item: {
          ...toCard(d, ctx.language),
          highlights: detail.highlights,
          visitorInfo: detail.visitorInfo,
          sources: detail.sources,
          images: detail.images.slice(0, 4),
        },
      },
    };
  },

  async get_destination_images({ destination, limit }) {
    const d = await requireDestination(destination);
    const images = await getImages(d._id, limit ?? 8);
    return {
      forModel: { destination: d.name, imageCount: images.length, note: 'Images are displayed to the user with attribution.' },
      block: images.length ? { type: 'images', destination: { name: d.name, slug: d.slug }, images } : null,
    };
  },

  async get_weather({ place, use_user_location }, ctx) {
    const p = await placeOrUser(place, use_user_location, ctx, 'weather');
    const w = await getWeather(p);
    return {
      forModel: { place: p.name, current: w.current, daily: w.daily, fetchedAt: w.fetchedAt, stale: w.stale },
      block: { type: 'weather', place: { name: p.name, slug: p.slug ?? null }, ...w },
    };
  },

  async get_nearby_places({ place, use_user_location, categories, radius_meters }, ctx) {
    const p = await placeOrUser(place, use_user_location, ctx, 'nearby');
    const result = await getNearby(p, categories, { radius: radius_meters ?? 1500, limit: 6 });
    return {
      forModel: {
        place: p.name,
        error: result.error,
        stale: result.stale,
        groups: result.groups.map((g) => ({
          category: g.category,
          places: g.places.map(({ name, subtype, distanceMeters, openingHours }) => ({ name, subtype, distanceMeters, openingHours })),
        })),
      },
      block: { type: 'nearby', place: { name: p.name, lat: p.lat, lng: p.lng, slug: p.slug ?? null }, ...result },
    };
  },

  async get_route({ origin, origin_is_user_location, destination }, ctx) {
    if (origin_is_user_location && !ctx.userLocation) throw new LocationRequired('route');
    const originInput = origin_is_user_location ? { ...ctx.userLocation, label: 'Your location' } : { query: origin ?? '' };
    const route = await getRoute(originInput, { query: destination });
    const { geometry, ...summary } = route;
    return { forModel: summary, block: { type: 'route', ...route } };
  },

  async create_itinerary({ days, base, interests, include_destinations, travelers, travel_style }) {
    const include = [];
    for (const name of include_destinations) {
      const d = await findDestinationByText(name);
      if (d) include.push(d.slug);
    }
    const plan = await createItinerary({ days, base, interests, include, travelers: travelers ?? 2, travelStyle: travel_style ?? 'standard' });
    return {
      forModel: {
        title: plan.title,
        notes: plan.notes,
        estimate: plan.estimate && {
          isEstimate: true,
          travelers: plan.estimate.travelers,
          totalInr: plan.estimate.total,
          rangeInr: plan.estimate.range,
          perPersonInr: plan.estimate.perPerson,
          lines: plan.estimate.lines.map(({ label, amount }) => ({ label, amount })),
          excludes: 'Travel to and from Odisha',
        },
        days: plan.days.map((d) => ({
          day: d.day,
          stops: d.stops.map((s) => s.name),
          totalDistanceKm: d.totalDistanceKm,
          totalDriveMinutes: d.totalDriveMinutes,
        })),
      },
      block: { type: 'itinerary', ...plan },
    };
  },

  async get_visitor_guidelines({ destination }) {
    const slug = destination ? (await requireDestination(destination)).slug : null;
    const g = await getGuidelines(slug);
    return { forModel: g, block: { type: 'guidelines', ...g } };
  },

  // The draft lives on ctx.booking and is saved with the chat session by chat.service.
  async update_booking_request(args, ctx) {
    const patch = {
      type: args.type,
      destination: args.destination,
      origin: args.origin,
      startDate: args.start_date,
      endDate: args.end_date,
      travelers: args.travelers,
      budgetInr: args.budget_inr,
      travelStyle: args.travel_style,
      hotelType: args.hotel_type,
      breakfast: args.breakfast,
      accessibility: args.accessibility,
      tripType: args.trip_type,
      cabinClass: args.cabin_class,
      notes: args.notes,
    };
    ctx.booking.draft = mergeDraft(ctx.booking.draft, patch);
    ctx.booking.changed = true;
    const state = evaluateDraft(ctx.booking.draft);
    return {
      forModel: {
        draft: ctx.booking.draft,
        missing: state.missing,
        problems: state.errors.map((e) => e.message),
        ready: state.ready,
        nextQuestion: state.nextQuestion,
        instruction: state.ready
          ? 'All details are collected. A summary card with a Submit button is shown below your reply. Ask the user to check it and press Submit request (or reply "confirm"). Do not say the request is submitted or confirmed.'
          : 'Ask the user only for the next missing detail, using nextQuestion as a guide.',
      },
      block: state.ready ? draftBlock(ctx.booking.draft) : null,
    };
  },

  async discard_booking_request(_args, ctx) {
    const had = Boolean(ctx.booking.draft);
    ctx.booking.draft = null;
    ctx.booking.changed = true;
    return { forModel: { discarded: had }, block: null };
  },

  async get_my_booking_requests({ reference }, ctx) {
    if (!ctx.user) throw new SignInRequired('view your booking requests');
    if (reference) {
      const booking = await getBooking(reference.trim(), ctx.user);
      return {
        forModel: { reference: booking.reference, type: booking.type, destination: booking.destination, status: booking.status, startDate: booking.startDate },
        block: { type: 'bookings', items: [booking] },
      };
    }
    const items = await listUserBookings(ctx.user.id);
    return {
      forModel: { count: items.length, requests: items.slice(0, 10).map(({ reference: r, type, destination, status, startDate }) => ({ reference: r, type, destination, status, startDate })) },
      block: { type: 'bookings', items: items.slice(0, 10) },
    };
  },
};

/**
 * Validates and runs one tool. Never throws: failures become a structured error the model
 * can explain, plus an optional UI block (for example a "share location" prompt).
 */
export async function executeTool(name, rawArgs, ctx) {
  const def = TOOL_DEFINITIONS[name];
  if (!def) return { ok: false, forModel: { error: `Unknown tool ${name}` }, block: null };

  const parsed = def.zod.safeParse(rawArgs);
  if (!parsed.success) {
    return { ok: false, args: rawArgs, forModel: { error: 'Invalid arguments', issues: parsed.error.issues.map((i) => i.message) }, block: null };
  }

  try {
    const { forModel, block } = await executors[name](parsed.data, ctx);
    return { ok: true, args: parsed.data, forModel, block };
  } catch (err) {
    const message = err instanceof AppError ? err.message : 'The service is temporarily unavailable.';
    if (!(err instanceof AppError)) console.error(`[tool:${name}]`, err);
    const block =
      err instanceof LocationRequired
        ? { type: 'location_request', purpose: err.purpose }
        : err instanceof SignInRequired
          ? { type: 'sign_in', purpose: err.purpose }
          : err.code === 'PROVIDER_UNAVAILABLE'
          ? { type: 'notice', tone: 'warning', message: `${message}. Please try again shortly.` }
          : null;
    return { ok: false, args: parsed.data, forModel: { error: message, code: err.code ?? 'ERROR' }, block };
  }
}
