import mongoose from 'mongoose';

const fitnessLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  workouts: [
    {
      exerciseName: { type: String, required: true, trim: true },
      sets: { type: Number, default: 0, min: 0 },
      reps: { type: Number, default: 0, min: 0 },
      durationMinutes: { type: Number, default: 0, min: 0 },
      caloriesBurned: { type: Number, default: 0, min: 0 }
    }
  ],
  totalDuration: { type: Number, default: 0 },
  xpAwarded: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

fitnessLogSchema.index({ userId: 1, date: -1 });

export const FitnessLog = mongoose.model('FitnessLog', fitnessLogSchema);
