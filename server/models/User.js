import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    xp: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    streak: {
      type: Number,
      default: 0
    },
    lastTaskDate: {
      type: Date,
      default: null
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: 'Novice'
    },
    rank: {
      type: Number,
      default: 0
    },
    badges: {
      type: [String],
      default: []
    },
    lastInsightDate: {
      type: Date,
      default: null
    },
    lastExpenseInsightMonth: {
      type: String,
      default: null
    },
    lastSummaryInsightMonth: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

userSchema.index({ xp: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);
