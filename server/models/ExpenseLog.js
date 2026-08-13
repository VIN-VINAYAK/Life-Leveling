import mongoose from 'mongoose';

const expenseLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  month: {
    type: String,
    required: true,
    index: true
  },
  monthlyIncome: { type: Number, default: 0 },
  savingsGoal: { type: Number, default: 0 },
  expenses: [
    {
      category: { type: String, required: true },
      description: { type: String, required: true, trim: true },
      amount: { type: Number, required: true, min: 0 },
      date: { type: Date, required: true },
      source: { type: String, enum: ['manual', 'sms_parsed'], default: 'manual' }
    }
  ],
  totalExpenses: { type: Number, default: 0 },
  totalSaved: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

expenseLogSchema.index({ userId: 1, month: -1 });

export const ExpenseLog = mongoose.model('ExpenseLog', expenseLogSchema);
