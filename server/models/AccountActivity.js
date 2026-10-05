import mongoose from 'mongoose';

const accountActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['sign_in', 'account_created', 'account_updated', 'password_changed'],
    required: true
  },
  summary: { type: String, required: true, trim: true, maxlength: 160 }
}, { timestamps: true });

accountActivitySchema.index({ userId: 1, createdAt: -1 });

export const AccountActivity = mongoose.model('AccountActivity', accountActivitySchema);
