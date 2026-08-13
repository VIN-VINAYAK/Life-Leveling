import mongoose from 'mongoose';

const fitnessProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  weight: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  fitnessGoal: {
    type: String,
    enum: ['lose_weight', 'build_muscle', 'maintain', 'improve_endurance'],
    default: 'maintain'
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'very_active'],
    default: 'moderate'
  },
  cachedAiPlan: {
    plan: [{ day: String, focus: String, details: String }],
    generatedAt: { type: Date, default: null }
  },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const FitnessProfile = mongoose.model('FitnessProfile', fitnessProfileSchema);
