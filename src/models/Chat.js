import mongoose from 'mongoose';

export const INTENTS = [
  'destination_search',
  'trip_planning',
  'hotel_search',
  'flight_search',
  'package_search',
  'booking',
  'booking_status',
  'cancellation',
  'travel_information',
  'route_distance',
  'weather',
  'nearby_places',
  'general_chat',
];

const chatSessionSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'New conversation' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    lastMessageAt: { type: Date, default: Date.now },
    // Booking details collected so far in this conversation; validated by booking.service.
    bookingDraft: { type: mongoose.Schema.Types.Mixed, default: null },
    // The draft field the rule-based engine last asked about, so short answers land in it.
    bookingAsking: { type: String, default: null },
  },
  { timestamps: true },
);

const chatMessageSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    blocks: { type: [mongoose.Schema.Types.Mixed], default: [] },
    suggestions: { type: [String], default: [] },
    toolCalls: {
      type: [{ name: String, args: mongoose.Schema.Types.Mixed, ok: Boolean, _id: false }],
      default: [],
    },
    intent: { type: String, enum: [...INTENTS, null], default: null },
    engine: { type: String, enum: ['groq', 'openai', 'rules', 'system', null], default: null },
  },
  { timestamps: true },
);

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
