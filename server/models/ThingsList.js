import mongoose from 'mongoose';

const thingsListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [
    {
      name: { type: String, required: true, trim: true },
      estimatedCost: { type: Number, required: true, min: 0 },
      priority: { type: String, enum: ['want', 'need'], default: 'want' },
      purchased: { type: Boolean, default: false },
      purchasedDate: { type: Date, default: null }
    }
  ]
}, { timestamps: true });

export const ThingsList = mongoose.model('ThingsList', thingsListSchema);
