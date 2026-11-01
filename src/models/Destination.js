import mongoose from 'mongoose';

export const CATEGORIES = ['temple', 'heritage', 'beach', 'nature', 'culture'];

const sourceSchema = new mongoose.Schema({ label: String, url: String }, { _id: false });

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    tagline: { type: String, required: true },
    summary: { type: String, required: true },
    description: { en: { type: [String], default: [] } },
    highlights: { type: [String], default: [] },
    location: {
      address: { type: String, required: true },
      district: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      // Where routing and nearby searches should anchor if it differs from the landmark itself.
      visitorPointNote: String,
    },
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    visitorInfo: {
      openingHours: { type: String, default: null },
      entryFee: { type: String, default: null },
      bestTimeToVisit: { type: String, default: null },
      suggestedDuration: { type: String, default: null },
      visitMinutes: { type: Number, default: 90 },
      accessibility: { type: [String], default: [] },
      guidelines: { type: [String], default: [] },
    },
    keywords: { type: [String], default: [] },
    sources: { type: [sourceSchema], default: [] },
    heroImage: { type: mongoose.Schema.Types.ObjectId, ref: 'DestinationImage', default: null },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 100 },
    lastVerifiedAt: { type: Date, default: null },
    published: { type: Boolean, default: true },
    // History told in chapters, per language: { en: [{ era, title, text: [] }], hi: [...], or: [...] }.
    story: { type: mongoose.Schema.Types.Mixed, default: null },
    // Hindi and Odia versions of the text fields above, keyed by language. English stays in the main fields.
    translations: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

destinationSchema.index({ geo: '2dsphere' });
destinationSchema.index({ name: 'text', summary: 'text', keywords: 'text', tagline: 'text' });

destinationSchema.pre('validate', function syncGeo() {
  if (this.location?.latitude != null && this.location?.longitude != null) {
    this.geo = { type: 'Point', coordinates: [this.location.longitude, this.location.latitude] };
  }
});

export const Destination = mongoose.model('Destination', destinationSchema);
