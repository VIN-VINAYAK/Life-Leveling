import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: ''
    },
    xpReward: {
      type: Number,
      default: 10,
      min: 1
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    category: {
      type: String,
      default: 'general'
    },
    dueDate: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
