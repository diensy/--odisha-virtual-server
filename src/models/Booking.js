import mongoose from 'mongoose';

export const BOOKING_TYPES = ['trip', 'hotel', 'flight', 'package'];
export const BOOKING_STATUSES = ['pending', 'reviewing', 'accepted', 'rejected', 'cancelled'];
export const TRAVEL_STYLES = ['budget', 'standard', 'luxury', 'adventure', 'family', 'couple'];

const historySchema = new mongoose.Schema(
  { status: { type: String, enum: BOOKING_STATUSES }, note: String, at: { type: Date, default: Date.now } },
  { _id: false },
);

/**
 * A booking *request*: the details a traveller wants arranged. Nothing is reserved with a
 * hotel, airline or operator; staff review the request and update its status.
 */
const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: BOOKING_TYPES, required: true },
    destination: { type: String, required: true },
    origin: { type: String, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    travelers: { type: Number, required: true, min: 1, max: 20 },
    budgetInr: { type: Number, default: null },
    travelStyle: { type: String, enum: [...TRAVEL_STYLES, null], default: null },
    preferences: {
      hotelType: { type: String, default: null },
      breakfast: { type: Boolean, default: null },
      accessibility: { type: String, default: null },
      tripType: { type: String, enum: ['one_way', 'round_trip', null], default: null },
      cabinClass: { type: String, enum: ['economy', 'premium_economy', 'business', 'first', null], default: null },
      interests: { type: [String], default: [] },
      notes: { type: String, default: null },
    },
    status: { type: String, enum: BOOKING_STATUSES, default: 'pending', index: true },
    statusHistory: { type: [historySchema], default: [] },
    adminNote: { type: String, default: null },
    source: { type: String, enum: ['chat', 'form'], default: 'form' },
    chatSession: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', default: null },
  },
  { timestamps: true },
);

export const Booking = mongoose.model('Booking', bookingSchema);
