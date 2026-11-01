import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema(
  { slug: String, name: String, category: String, lat: Number, lng: Number, suggestedDuration: String },
  { _id: false },
);

const legSchema = new mongoose.Schema(
  { from: String, to: String, distanceKm: Number, durationMinutes: Number },
  { _id: false },
);

const daySchema = new mongoose.Schema(
  { day: Number, theme: String, stops: [stopSchema], legs: [legSchema], geometry: { type: [[Number]], default: [] }, totalDistanceKm: Number, totalDriveMinutes: Number },
  { _id: false },
);

const itinerarySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    base: { type: String, required: true },
    days: { type: [daySchema], required: true },
    notes: { type: [String], default: [] },
    routingAvailable: { type: Boolean, default: true },
    travelers: { type: Number, default: 2 },
    travelStyle: { type: String, default: 'standard' },
    estimate: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

export const Itinerary = mongoose.model('Itinerary', itinerarySchema);
