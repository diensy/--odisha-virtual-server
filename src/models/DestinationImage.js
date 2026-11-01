import mongoose from 'mongoose';

const destinationImageSchema = new mongoose.Schema(
  {
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true, index: true },
    url: { type: String, required: true },
    thumbUrl: { type: String, required: true },
    width: Number,
    height: Number,
    alt: { type: String, required: true },
    caption: String,
    creator: { type: String, required: true },
    license: { type: String, required: true },
    licenseUrl: String,
    sourceUrl: { type: String, required: true },
    provider: { type: String, default: 'Wikimedia Commons' },
    order: { type: Number, default: 100 },
    // Points of interest on the photo (seed/imageNotes.js): { x, y } as fractions, label per language.
    notes: { type: [{ x: Number, y: Number, label: mongoose.Schema.Types.Mixed, _id: false }], default: [] },
  },
  { timestamps: true },
);

export const DestinationImage = mongoose.model('DestinationImage', destinationImageSchema);
