import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'general'
    },
    xpReward: {
      type: Number,
      default: 5,
      min: 1
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    lastCompletedDate: {
      type: Date,
      default: null
    },
    history: {
      type: [Date],
      default: []
    },
    completedCount: {
      type: Number,
      default: 0
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Habit = mongoose.model('Habit', habitSchema);
