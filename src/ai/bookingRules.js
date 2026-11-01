import { extractDates, todayIstIso } from '../utils/dates.js';
import { draftBlock, evaluateDraft, mergeDraft, requiredFields } from '../services/booking.service.js';

/**
 * Rule-based booking-request collection for when no AI model is configured.
 * Pulls whatever details it can from each message, then asks for the next missing one.
 */

const WORD_NUMBERS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
const NUM = '(\\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)';
const toNumber = (s) => WORD_NUMBERS[s] ?? Number(s);

// Words that start a date, number, pronoun or verb rather than a place name.
const NOT_PLACE =
  /^(\d|(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?|today|tomorrow|next|this|the|one|two|three|four|five|six|seven|eight|nine|ten|my|our|me|us|book|go|travel|visit|fly|see|plan|stay|find|reserve|get|have|make|know|do|be|spend)\b)/i;
const PLACE_STOP = '(?=\\s+(?:to|from|on|for|in|with|by|between|starting|during|under|around|next|this)\\b|[,.!?]|$)';
const FILLER = /\b(please|a|an|the|trip|tour|holiday|vacation|hotel|flight|package|city)\b/gi;

export const BOOKING_START = /\b(book|reserve|booking request|arrange)\b|\b(i want|i need|i'd like|looking for|help me (find|get|book))\b.*\b(hotels?|stay|rooms?|flights?|tickets?|packages?)\b|\bflights?\s+from\b/i;
const DISCARD = /^(cancel|stop|never ?mind|forget (it|this)|discard|don'?t book|no thanks)\b/i;

function cleanPlace(raw) {
  const s = raw.replace(FILLER, ' ').replace(/\s+/g, ' ').trim();
  if (!s || s.length < 2 || NOT_PLACE.test(s) || s.split(' ').length > 4) return null;
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function detectType(t) {
  if (/\b(flights?|fly|flying|air ?tickets?|plane)\b/.test(t)) return 'flight';
  if (/\b(hotels?|resorts?|homestays?|rooms?|stay|accommodation|lodging)\b/.test(t)) return 'hotel';
  if (/\b(packages?|all[- ]inclusive)\b/.test(t)) return 'package';
  if (/\b(trip|tour|holiday|vacation|getaway)\b/.test(t)) return 'trip';
  return null;
}

function detectTravelers(t, asking) {
  let m = t.match(new RegExp(`\\b${NUM}\\s*(?:people|persons?|adults?|travell?ers?|guests?|passengers?|pax|of us|members)\\b`));
  if (m) return toNumber(m[1]);
  m = t.match(new RegExp(`\\bfor\\s+${NUM}\\b(?!\\s*(?:days?|nights?|k\\b|lakh))`));
  if (m) return toNumber(m[1]);
  if (/\b(just me|solo|alone|myself only|only me)\b/.test(t)) return 1;
  if (/\b(couple|two of us|me and my (wife|husband|partner))\b/.test(t)) return 2;
  if (asking === 'travelers') {
    m = t.match(new RegExp(`^\\s*${NUM}\\s*$`));
    if (m) return toNumber(m[1]);
  }
  return null;
}

function detectBudget(t, asking) {
  const amount = (num, unit) => {
    const n = Number(num.replace(/,/g, ''));
    if (!Number.isFinite(n)) return null;
    if (/^k$/.test(unit ?? '')) return n * 1000;
    if (/^(lakh|lac|l)$/.test(unit ?? '')) return n * 100000;
    return n;
  };
  const N = '(\\d[\\d,]*(?:\\.\\d+)?)\\s*(k|lakh|lac)?';
  let m = t.match(new RegExp(`(?:₹|\\brs\\.?|\\binr|\\brupees)\\s*${N}\\b`));
  if (m) return amount(m[1], m[2]);
  m = t.match(new RegExp(`\\b${N}\\s*(?:rupees|rs\\b|inr\\b|₹)`));
  if (m) return amount(m[1], m[2]);
  m = t.match(new RegExp(`\\b(?:budget|under|within|max(?:imum)?|up to)\\b[^\\d]{0,12}${N}\\b`));
  if (m) return amount(m[1], m[2]);
  if (asking === 'budgetInr') {
    m = t.match(new RegExp(`\\b${N}\\b`));
    if (m) return amount(m[1], m[2]);
  }
  return null;
}

function detectPlaces(text, t, mentioned) {
  const out = {};
  const from = text.match(new RegExp(`\\bfrom\\s+([A-Za-z][A-Za-z .'-]*?)${PLACE_STOP}`, 'i'));
  if (from) out.origin = cleanPlace(from[1]);
  // "want to book a trip to Goa": skip candidates that are verbs and take the first real place.
  for (const m of text.matchAll(new RegExp(`\\b(?:to|visit|visiting|in)\\s+([A-Za-z][A-Za-z .'-]*?)${PLACE_STOP}`, 'gi'))) {
    out.destination = cleanPlace(m[1]);
    if (out.destination) break;
  }
  if (!out.destination && mentioned[0] && !/\bfrom\b/.test(t)) out.destination = mentioned[0].name;
  if (out.destination && out.destination === out.origin) delete out.destination;
  return out;
}

function addNights(isoDate, nights) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + nights);
  return d.toISOString().slice(0, 10);
}

/** Extracts booking fields from one message. `asking` is the field we last asked for. */
export function parseBookingMessage(text, { mentioned = [], asking = null, draft = null } = {}) {
  const t = text.toLowerCase();
  const patch = {};
  patch.type = detectType(t);
  if (asking === 'type' && !patch.type && /\b(trip|everything|all)\b/.test(t)) patch.type = 'trip';

  Object.assign(patch, detectPlaces(text, t, mentioned));
  // A bare answer to "where?" or "from which city?".
  if ((asking === 'destination' || asking === 'origin') && !patch[asking] && t.split(/\s+/).length <= 4) {
    patch[asking] = cleanPlace(text);
    if (asking === 'origin') delete patch.destination;
  }

  const dates = extractDates(text, todayIstIso());
  if (dates.length >= 2) [patch.startDate, patch.endDate] = dates;
  else if (dates.length === 1) {
    if (asking === 'endDate' || (draft?.startDate && !draft?.endDate && asking !== 'startDate')) patch.endDate = dates[0];
    else patch.startDate = dates[0];
  }
  const nights = t.match(new RegExp(`\\b${NUM}\\s*(nights?|days?)\\b`));
  const start = patch.startDate ?? draft?.startDate;
  if (nights && start && !patch.endDate) {
    const n = toNumber(nights[1]);
    patch.endDate = addNights(start, /night/.test(nights[2]) ? n : Math.max(n - 1, 1));
  }

  patch.travelers = detectTravelers(t, asking);
  patch.budgetInr = detectBudget(t, asking);

  if (/\bone[- ]?way\b/.test(t)) patch.tripType = 'one_way';
  else if (/\b(round[- ]?trip|return)\b/.test(t)) patch.tripType = 'round_trip';
  if (/\bpremium economy\b/.test(t)) patch.cabinClass = 'premium_economy';
  else if (/\beconomy\b/.test(t)) patch.cabinClass = 'economy';
  else if (/\bbusiness\b/.test(t)) patch.cabinClass = 'business';
  else if (/\bfirst( class)?\b/.test(t) && (asking === 'cabinClass' || /\bclass\b/.test(t))) patch.cabinClass = 'first';

  if (/\b(luxury|5[- ]star|five[- ]star)\b/.test(t)) patch.travelStyle = 'luxury';
  else if (/\b(on a budget|cheap|low[- ]cost|budget (trip|hotel|stay|travel))\b/.test(t)) patch.travelStyle = 'budget';
  else if (/\bfamily\b/.test(t)) patch.travelStyle = 'family';
  else if (/\b(honeymoon|couple)\b/.test(t)) patch.travelStyle = 'couple';
  if (/\bwith breakfast\b|\bbreakfast included\b/.test(t)) patch.breakfast = true;
  if (/\b(resort|homestay|boutique|business hotel|guest ?house)\b/.test(t)) patch.hotelType = t.match(/\b(resort|homestay|boutique|business hotel|guest ?house)\b/)[1];
  if (/\b(wheelchair|accessible|step-free)\b/.test(t)) patch.accessibility = 'Step-free / wheelchair access';
  return patch;
}

const QUICK_REPLIES = {
  type: ['A hotel stay', 'A flight', 'A full trip', 'A travel package'],
  travelers: ['1 person', '2 people', '4 people'],
  tripType: ['One-way', 'Round trip'],
  cabinClass: ['Economy', 'Business'],
  budgetInr: ['₹15,000', '₹30,000', '₹50,000'],
};

const PLACE_REPLIES = { destination: ['Puri', 'Konark', 'Bhubaneswar'], origin: ['Bhubaneswar', 'Kolkata', 'Delhi'] };

// "15 November" style, which parseBookingMessage reads back.
const dateWords = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${d.getUTCDate()} ${d.toLocaleString('en-IN', { month: 'long', timeZone: 'UTC' })}`;
};
const plusDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

function repliesFor(field, draft) {
  if (field === 'startDate') {
    const today = todayIstIso();
    return ['Tomorrow', dateWords(plusDays(today, 7)), dateWords(plusDays(today, 14))];
  }
  if (field === 'endDate') return draft.type === 'hotel' ? ['For 2 nights', 'For 3 nights', 'For 5 nights'] : ['For 2 days', 'For 3 days', 'For 5 days'];
  return PLACE_REPLIES[field] ?? QUICK_REPLIES[field] ?? [];
}

/**
 * Quick-reply chips while a request is open: answers to the question being asked, plus a way
 * out, so the chips never pull the visitor into an unrelated question.
 */
export function bookingQuickReplies(draft) {
  if (!draft) return [];
  const state = evaluateDraft(draft);
  if (state.ready) return ['Confirm', 'Change the dates', 'Discard this request'];
  const field = state.errors[0]?.field ?? state.missing[0];
  return [...repliesFor(field, draft).slice(0, 3), 'Discard this request'];
}

const TYPE_NAMES = { trip: 'trip', hotel: 'hotel stay', flight: 'flight', package: 'travel package' };

/**
 * One turn of booking collection. Returns null when the message is not about a booking
 * and no booking is in progress, so normal answering can continue.
 */
export function runBookingRules({ message, mentioned, ctx }) {
  const b = ctx.booking;
  if (!b.draft && !BOOKING_START.test(message)) return null;

  if (b.draft && DISCARD.test(message.trim())) {
    b.draft = null;
    b.asking = null;
    b.changed = true;
    return { text: 'No problem, I have discarded that request. What else can I help with?', blocks: [], toolCalls: [{ name: 'discard_booking_request', args: {}, ok: true }] };
  }

  let before = b.draft;
  const patch = parseBookingMessage(message, { mentioned, asking: b.asking, draft: before });
  // "Book a flight…" while a hotel request is open starts a new request instead.
  if (before?.type && patch.type && patch.type !== before.type && BOOKING_START.test(message)) {
    before = null;
    b.asking = null;
  }
  // Otherwise, once the type is set, a later mention of "trip" or "hotel" should not switch it.
  if (before?.type && patch.type && patch.type !== before.type && b.asking !== 'type') delete patch.type;
  const parsedNothing = Boolean(before) && !Object.values(patch).some((v) => v != null);
  // Whether the message answers the question we asked (dates count for either date field).
  const asked = b.asking === 'startDate' || b.asking === 'endDate' ? ['startDate', 'endDate'] : [b.asking];
  const answeredAsked = !before || !b.asking || asked.some((f) => patch[f] != null);
  if (parsedNothing) {
    return { text: `Sorry, I didn't catch that. ${evaluateDraft(before).nextQuestion}`, blocks: [], toolCalls: [], parsedNothing, answeredAsked: false };
  }
  // A different question ("Plan a 2-day trip…") that doesn't answer ours: let normal answering
  // handle it when it can (runRules decides), without changing the open request.
  if (!answeredAsked && !BOOKING_START.test(message)) {
    return { text: `Sorry, I didn't catch that. ${evaluateDraft(before).nextQuestion}`, blocks: [], toolCalls: [], parsedNothing: true, answeredAsked: false };
  }
  const draft = mergeDraft(before, patch);
  b.draft = draft;
  b.changed = true;

  const state = evaluateDraft(draft);
  const toolCalls = [{ name: 'update_booking_request', args: patch, ok: true }];
  if (state.ready) {
    b.asking = null;
    return {
      text: `Here is your ${TYPE_NAMES[draft.type]} request. Check the details below and press Submit request, or tell me what to change. Nothing is reserved until our team reviews it.`,
      blocks: [draftBlock(draft)],
      toolCalls,
    };
  }

  b.asking = state.errors[0]?.field ?? state.missing[0];
  const opener = before ? '' : draft.type ? `Sure, I can help you request a ${TYPE_NAMES[draft.type]}. ` : 'Sure, I can help with that. ';
  const progress = requiredFields(draft).length - state.missing.length;
  return {
    text: `${opener}${state.nextQuestion}`,
    blocks: progress >= 2 ? [draftBlock(draft)] : [],
    toolCalls,
  };
}
