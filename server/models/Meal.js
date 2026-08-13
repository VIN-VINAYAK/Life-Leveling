import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      required: true
    },
    foodName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['grams', 'pieces', 'cups', 'ml'],
      required: true
    },
    calories: {
      type: Number,
      required: true,
      min: 0
    },
    protein: {
      type: Number,
      required: true,
      min: 0
    },
    carbs: {
      type: Number,
      required: true,
      min: 0
    },
    fat: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

export const Meal = mongoose.model('Meal', mealSchema);
