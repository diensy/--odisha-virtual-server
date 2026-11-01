import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { ChatMessage, ChatSession } from '../models/Chat.js';
import { buildInstructions } from '../ai/systemPrompt.js';
import { runGroq } from '../ai/groqEngine.js';
import { runRules } from '../ai/rulesEngine.js';
import { bookingQuickReplies } from '../ai/bookingRules.js';
import { listDestinations } from './destination.service.js';
import { createBooking, draftBlock, evaluateDraft } from './booking.service.js';
import { resolveIntent } from './intent.service.js';
import { todayIstIso } from '../utils/dates.js';
import { AppError } from '../utils/AppError.js';

const HISTORY_LIMIT = 10;
const AFFIRMATION = /^\s*(yes|yeah|yep|confirm(ed)?|submit( it| the request)?|go ahead|ok(ay)?|sure|looks good|correct|that'?s right|please submit|yes,? please|done)\s*[.!]*\s*$/i;

function suggestionsFor(blocks, bookingDraft) {
  const quick = bookingQuickReplies(bookingDraft);
  if (quick.length) return quick;
  const out = [];
  for (const b of blocks) {
    const name = b.item?.name ?? b.destination?.name ?? b.place?.name;
    if (b.type === 'destination') {
      out.push(`Show me photos of ${b.item.name}`, `What's the weather at ${b.item.name}?`, `Find food near ${b.item.name}`);
    } else if (b.type === 'route') {
      out.push(`What's the weather at ${b.destination.name}?`, `Find washrooms near ${b.destination.name}`);
    } else if (b.type === 'weather' && name !== 'Your location') {
      out.push(`How do I get to ${name} from Bhubaneswar?`);
    } else if (b.type === 'images') {
      out.push(`Tell me about ${name}`);
    } else if (b.type === 'itinerary') {
      out.push('Book this as a trip request', 'What should I know before visiting temples?');
    } else if (b.type === 'nearby' && b.place.slug) {
      out.push(`Tell me about ${name}`);
    } else if (b.type === 'booking_submitted' || b.type === 'bookings') {
      out.push('Show my booking requests', 'Plan a 2-day trip from Bhubaneswar');
    }
  }
  if (!out.length) out.push('Plan a 2-day trip from Bhubaneswar', 'Help me book a hotel in Puri', 'Tell me about Konark Sun Temple');
  return [...new Set(out)].slice(0, 3);
}

/** Only the latest booking summary in a reply is useful; earlier ones are superseded. */
function dedupeBlocks(blocks) {
  const lastSummary = blocks.findLastIndex((b) => b.type === 'booking_summary');
  return blocks.filter((b, i) => b.type !== 'booking_summary' || i === lastSummary);
}

const ownerMatches = (session, user) => !session.user || String(session.user) === user?.id;

async function getOrCreateSession(sessionId, firstMessage, user) {
  if (sessionId && mongoose.isValidObjectId(sessionId)) {
    const s = await ChatSession.findById(sessionId);
    // A conversation that belongs to another account is never resumed.
    if (s && ownerMatches(s, user)) {
      if (!s.user && user) s.user = user.id;
      return s;
    }
  }
  return ChatSession.create({ title: firstMessage.slice(0, 80), user: user?.id ?? null });
}

async function loadSession(sessionId, user) {
  if (!mongoose.isValidObjectId(sessionId)) throw AppError.notFound('Conversation not found');
  const session = await ChatSession.findById(sessionId);
  if (!session || !ownerMatches(session, user)) throw AppError.notFound('Conversation not found');
  return session;
}

const publicMessage = (m) => ({
  id: String(m._id),
  role: m.role,
  content: m.content,
  blocks: m.blocks,
  suggestions: m.suggestions,
  engine: m.engine,
  intent: m.intent,
  createdAt: m.createdAt,
});

/** Saves a booking request from the conversation's draft. Only called after explicit confirmation. */
async function submitDraft(session, user) {
  if (!user) {
    return {
      text: 'Your request is ready. Please sign in or create a free account to submit it; the details will stay here.',
      blocks: [{ type: 'sign_in', purpose: 'submit your booking request' }, draftBlock(session.bookingDraft)],
    };
  }
  const booking = await createBooking(user.id, session.bookingDraft, { source: 'chat', chatSession: session._id });
  session.bookingDraft = null;
  session.bookingAsking = null;
  return {
    text: `Your request ${booking.reference} has been submitted and is pending review. Nothing is reserved yet: our team will check availability and update its status in My Trips.`,
    blocks: [{ type: 'booking_submitted', booking }],
  };
}

export async function handleChat({ sessionId, message, userLocation, user, language = 'en' }) {
  const session = await getOrCreateSession(sessionId, message, user);
  const history = await ChatMessage.find({ session: session._id })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT)
    .select('role content')
    .lean();
  history.reverse();

  const ctx = {
    userLocation: userLocation ?? null,
    user: user ?? null,
    language,
    booking: { draft: session.bookingDraft ?? null, asking: session.bookingAsking ?? null, changed: false },
  };
  let result;
  let engine = 'rules';

  // Typing "yes" / "confirm" to a ready summary submits it without going through the model.
  if (ctx.booking.draft && evaluateDraft(ctx.booking.draft).ready && AFFIRMATION.test(message)) {
    result = { ...(await submitDraft(session, user)), toolCalls: [] };
    ctx.booking = { draft: session.bookingDraft, asking: session.bookingAsking, changed: true };
    engine = 'system';
  }

  if (!result && env.aiEnabled) {
    try {
      const destinations = await listDestinations();
      const instructions = buildInstructions({
        destinations,
        hasUserLocation: Boolean(userLocation),
        today: new Date().toLocaleDateString('en-IN', { dateStyle: 'full', timeZone: 'Asia/Kolkata' }),
        todayIso: todayIstIso(),
        user,
        bookingDraft: ctx.booking.draft,
        language,
      });
      result = await runGroq({ instructions, history, message, ctx });
      engine = 'groq';
    } catch (err) {
      console.error('[chat] Groq failed, falling back to rules engine:', err.status ?? '', err.message);
      ctx.booking = { draft: session.bookingDraft ?? null, asking: session.bookingAsking ?? null, changed: false };
    }
  }
  if (!result) result = await runRules({ message, ctx });

  if (ctx.booking.changed) {
    session.bookingDraft = ctx.booking.draft;
    session.bookingAsking = ctx.booking.asking ?? null;
    session.markModified('bookingDraft');
  }

  const blocks = dedupeBlocks(result.blocks);
  const text = result.text || (blocks.length ? 'Here is what I found.' : 'Sorry, I could not find an answer to that.');
  const suggestions = suggestionsFor(blocks, session.bookingDraft);
  const intent = resolveIntent({ text: message, toolCalls: result.toolCalls, bookingDraft: session.bookingDraft ?? ctx.booking.draft });

  await ChatMessage.insertMany([
    { session: session._id, role: 'user', content: message, intent },
    { session: session._id, role: 'assistant', content: text, blocks, suggestions, toolCalls: result.toolCalls, intent, engine },
  ]);
  session.lastMessageAt = new Date();
  await session.save();

  return { sessionId: String(session._id), message: text, blocks, suggestions, engine, intent };
}

/** Submit or discard the conversation's booking draft from the summary card's buttons. */
export async function bookingAction(sessionId, action, user) {
  const session = await loadSession(sessionId, user);
  if (!session.bookingDraft) throw AppError.conflict('There is no booking request in progress in this conversation.');

  let result;
  if (action === 'discard') {
    session.bookingDraft = null;
    session.bookingAsking = null;
    result = { text: 'I have discarded that request. What else can I help with?', blocks: [] };
  } else {
    if (!evaluateDraft(session.bookingDraft).ready) throw AppError.badRequest('Some details are still missing from this request.');
    result = await submitDraft(session, user);
    if (user && !session.user) session.user = user.id;
  }
  session.markModified('bookingDraft');

  const intent = action === 'discard' ? 'cancellation' : 'booking';
  const [, reply] = await ChatMessage.insertMany([
    { session: session._id, role: 'user', content: action === 'discard' ? 'Discard this request' : 'Submit request', intent },
    {
      session: session._id,
      role: 'assistant',
      content: result.text,
      blocks: result.blocks,
      suggestions: suggestionsFor(result.blocks, session.bookingDraft),
      intent,
      engine: 'system',
    },
  ]);
  session.lastMessageAt = new Date();
  await session.save();
  return { sessionId: String(session._id), ...publicMessage(reply.toObject()), message: result.text };
}

export async function getSessionMessages(sessionId, user) {
  const session = await loadSession(sessionId, user);
  const messages = await ChatMessage.find({ session: sessionId }).sort({ createdAt: 1 }).select('role content blocks suggestions engine intent createdAt').lean();
  return { sessionId, title: session.title, messages: messages.map(publicMessage) };
}
