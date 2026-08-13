import mongoose from 'mongoose';

const nutritionLogSchema = new mongoose.Schema({
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
  meals: [
    {
      foodName: { type: String, required: true, trim: true },
      calories: { type: Number, required: true, min: 0 },
      carbs: { type: Number, required: true, min: 0 },
      protein: { type: Number, required: true, min: 0 },
      fat: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

nutritionLogSchema.index({ userId: 1, date: -1 });

export const NutritionLog = mongoose.model('NutritionLog', nutritionLogSchema);
