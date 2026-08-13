import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    key: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

achievementSchema.index({ userId: 1, key: 1 }, { unique: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);
