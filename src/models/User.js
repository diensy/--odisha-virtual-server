import mongoose from 'mongoose';

export const ROLES = ['user', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'user' },
    preferences: {
      homeCity: { type: String, default: null },
      travelStyle: { type: String, default: null },
      interests: { type: [String], default: [] },
    },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
