import mongoose from 'mongoose';

/** A user's saved copy of an itinerary, with their own dates and notes. */
const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itinerary: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    startDate: { type: Date, default: null },
    travelers: { type: Number, default: null, min: 1, max: 20 },
    notes: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true },
);

export const Trip = mongoose.model('Trip', tripSchema);
