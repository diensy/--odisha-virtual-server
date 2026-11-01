import mongoose from 'mongoose';

const apiCacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  provider: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  fetchedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

apiCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ApiCache = mongoose.model('ApiCache', apiCacheSchema);
