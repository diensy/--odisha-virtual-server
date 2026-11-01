import { INTENTS } from '../models/Chat.js';

// Checked in order; the first match wins. Booking words beat topic words so
// "book a hotel in Puri" is a hotel request, not a destination question.
const TEXT_RULES = [
  ['cancellation', /\b(cancel|withdraw)\b.*\b(booking|request|reservation|trip|OV-\w+)\b|\bcancel OV-/i],
  ['booking_status', /\b(status|track|my (bookings?|requests?|reservations?))\b|\bOV-[0-9A-F]{6}\b/i],
  ['flight_search', /\b(flights?|fly|flying|airfare|air ticket|plane)\b/i],
  ['hotel_search', /\b(hotels?|resorts?|homestays?|stay|accommodation|rooms?|check[- ]?in)\b.*\b(book|find|need|want|looking|search|suggest)\b|\b(book|find|need|want|looking for|search|suggest)\b.*\b(hotels?|resorts?|homestays?|accommodation|rooms?)\b/i],
  ['package_search', /\b(packages?|all[- ]inclusive)\b|\bbudget trip\b|\bunder\s*(₹|rs\.?|inr)?\s*\d/i],
  ['booking', /\b(book|reserve|booking)\b/i],
  ['trip_planning', /\b(plan|itinerary|\d+\s*-?\s*days?\s+trip|day trip)\b/i],
  ['route_distance', /\b(how far|distance|route|directions|how (do|can) i (get|reach)|drive to)\b/i],
  ['weather', /\b(weather|temperature|forecast|rain(ing)?|humid)\b/i],
  ['nearby_places', /\b(near|nearby|around)\b.*\b(food|restaurants?|eat|hotels?|toilets?|washrooms?|hospitals?|pharmac\w*|atms?|bus|taxi)\b|\b(restaurants?|washrooms?|toilets?|atms?|hospitals?)\b/i],
  ['destination_search', /\b(suggest|recommend|which|where (can|should) i|places to (visit|see)|destinations?|beaches|temples)\b/i],
  ['travel_information', /\b(tell me about|what is|best time|history|timings?|entry fee|dress|rules|guidelines|tips)\b/i],
];

const TOOL_INTENTS = {
  search_destinations: 'destination_search',
  get_destination_details: 'travel_information',
  get_destination_images: 'travel_information',
  get_visitor_guidelines: 'travel_information',
  get_weather: 'weather',
  get_route: 'route_distance',
  create_itinerary: 'trip_planning',
  get_my_booking_requests: 'booking_status',
  discard_booking_request: 'cancellation',
};

const BOOKING_TYPE_INTENTS = { hotel: 'hotel_search', flight: 'flight_search', package: 'package_search', trip: 'booking' };

export function classifyText(text) {
  return TEXT_RULES.find(([, re]) => re.test(text))?.[0] ?? 'general_chat';
}

/**
 * Intent for one exchange. Text rules are tried first; if they find nothing specific, the
 * tools that actually ran decide. The result is always one of INTENTS.
 */
export function resolveIntent({ text, toolCalls = [], bookingDraft = null }) {
  const fromText = classifyText(text);
  if (fromText !== 'general_chat') return fromText;

  for (const call of toolCalls) {
    if (call.name === 'update_booking_request') return BOOKING_TYPE_INTENTS[bookingDraft?.type] ?? 'booking';
    if (call.name === 'get_nearby_places') {
      return call.args?.categories?.length === 1 && call.args.categories[0] === 'hotel' ? 'hotel_search' : 'nearby_places';
    }
    if (TOOL_INTENTS[call.name]) return TOOL_INTENTS[call.name];
  }
  // A short answer while a booking is being collected ("2 people", "Goa") continues the booking.
  if (bookingDraft) return BOOKING_TYPE_INTENTS[bookingDraft.type] ?? 'booking';
  return 'general_chat';
}

export { INTENTS };
