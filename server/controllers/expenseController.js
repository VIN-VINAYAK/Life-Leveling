import { ExpenseLog } from '../models/ExpenseLog.js';
import { ThingsList } from '../models/ThingsList.js';
import { User } from '../models/User.js';
import { XPEngine } from '../services/xpEngine.js';
import { syncUserTitle } from '../services/titleService.js';
import { getAIJSON } from '../services/aiService.js';

const getCurrentMonthKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getCurrentMonthLog = async (userId) => {
  const month = getCurrentMonthKey();
  let log = await ExpenseLog.findOne({ userId, month });
  if (!log) {
    log = new ExpenseLog({ userId, month, expenses: [] });
    await log.save();
  }
  return log;
};

export const setupExpenseMonth = async (req, res) => {
  try {
    const { monthlyIncome, savingsGoal } = req.body;
    const log = await getCurrentMonthLog(req.userId);
    log.monthlyIncome = Number(monthlyIncome || 0);
    log.savingsGoal = Number(savingsGoal || 0);
    log.totalSaved = Math.max(0, log.monthlyIncome - log.totalExpenses);
    await log.save();
    return res.json({ log });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to set up expense month', error: error.message });
  }
};

export const getCurrentExpenseData = async (req, res) => {
  try {
    const log = await getCurrentMonthLog(req.userId);
    return res.json({ log });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch current expense data', error: error.message });
  }
};

export const addExpense = async (req, res) => {
  try {
    const { category, description, amount, date, source } = req.body;
    if (!category || !description || !amount) {
      return res.status(400).json({ message: 'Category, description, and amount are required' });
    }

    const log = await getCurrentMonthLog(req.userId);
    const entry = { category, description, amount: Number(amount), date: date ? new Date(date) : new Date(), source: source || 'manual' };
    log.expenses.push(entry);
    log.totalExpenses = log.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    log.totalSaved = Math.max(0, log.monthlyIncome - log.totalExpenses);
    await log.save();

    return res.status(201).json({ log, entry });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add expense', error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const log = await getCurrentMonthLog(req.userId);
    log.expenses = log.expenses.filter((item) => item._id.toString() !== expenseId);
    log.totalExpenses = log.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    log.totalSaved = Math.max(0, log.monthlyIncome - log.totalExpenses);
    await log.save();
    return res.json({ message: 'Expense deleted', log });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
};

export const getExpenseHistory = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const logs = await ExpenseLog.find({ userId: req.userId, createdAt: { $gte: sixMonthsAgo } }).sort({ month: -1 });
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch expense history', error: error.message });
  }
};

export const addThingsListItem = async (req, res) => {
  try {
    const { name, estimatedCost, priority } = req.body;
    let list = await ThingsList.findOne({ userId: req.userId });
    if (!list) {
      list = new ThingsList({ userId: req.userId, items: [] });
    }
    list.items.push({ name, estimatedCost: Number(estimatedCost || 0), priority: priority || 'want' });
    await list.save();
    return res.status(201).json({ list });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add things list item', error: error.message });
  }
};

export const getThingsList = async (req, res) => {
  try {
    const list = await ThingsList.findOne({ userId: req.userId });
    return res.json({ list: list || { items: [] } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch things list', error: error.message });
  }
};

export const markThingPurchased = async (req, res) => {
  try {
    const { itemId } = req.params;
    const list = await ThingsList.findOne({ userId: req.userId });
    if (!list) return res.status(404).json({ message: 'Things list not found' });
    const item = list.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.purchased = true;
    item.purchasedDate = new Date();
    await list.save();
    return res.json({ list });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark item purchased', error: error.message });
  }
};

export const getAiInsights = async (req, res) => {
  try {
    const log = await getCurrentMonthLog(req.userId);
    const fallback = {
      spendingAnalysis: 'Your spending is under control this month. Keep an eye on discretionary categories to preserve savings.',
      topAreasToCut: ['Dining out', 'Impulse shopping', 'Unnecessary subscriptions'],
      savingsTip: 'Transfer a small amount to savings each payday to keep momentum going.',
      controlledPlan: 'Set a weekly cap and avoid nonessential purchases until the end of the month.',
      motivationalMessage: 'You are making steady progress with your finances. Keep building smart habits.'
    };

    let insights = fallback;
    try {
      const aiResponse = await getAIJSON({
        systemPrompt: 'You are a budgeting coach. Return a JSON object with spendingAnalysis, topAreasToCut (array of 3 strings), savingsTip, controlledPlan, motivationalMessage.',
        userPrompt: `Review this monthly expense data: income ${log.monthlyIncome}, expenses ${log.totalExpenses}, savings goal ${log.savingsGoal}. Provide actionable and encouraging guidance.`,
        maxTokens: 700
      });

      insights = {
        spendingAnalysis: aiResponse.spendingAnalysis || fallback.spendingAnalysis,
        topAreasToCut: Array.isArray(aiResponse.topAreasToCut) && aiResponse.topAreasToCut.length ? aiResponse.topAreasToCut.slice(0, 3) : fallback.topAreasToCut,
        savingsTip: aiResponse.savingsTip || fallback.savingsTip,
        controlledPlan: aiResponse.controlledPlan || fallback.controlledPlan,
        motivationalMessage: aiResponse.motivationalMessage || fallback.motivationalMessage
      };
    } catch (error) {
      console.error('Expense AI fallback used:', error.message);
      insights = fallback;
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentMonth = getCurrentMonthKey();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastInsightMonth = user.lastExpenseInsightMonth || null;
    if (!lastInsightMonth || lastInsightMonth !== currentMonth) {
      const newTotalXP = user.xp + 20;
      user.xp = newTotalXP;
      user.level = XPEngine.calculateLevel(newTotalXP);
      user.lastExpenseInsightMonth = currentMonth;
      await syncUserTitle(user);
      await user.save();
      return res.json({ insights, xpAwarded: 20, userStats: { xp: user.xp, level: user.level, title: user.title } });
    }

    return res.json({ insights, xpAwarded: 0, userStats: { xp: user.xp, level: user.level, title: user.title } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate AI insights', error: error.message });
  }
};

export const parseSmsExpenses = async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const parsed = messages.flatMap((message) => {
      const text = String(message || '');
      const amountMatch = text.match(/(?:₹|Rs|INR)\s*([0-9,]+(?:\.\d{1,2})?)/i);
      const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : null;
      const merchantMatch = text.match(/(?:at|from|to|merchant|shop|store|restaurant|fuel|payment)\s+([A-Za-z0-9 .,&-]+)/i);
      const merchant = merchantMatch ? merchantMatch[1].trim() : 'Parsed expense';
      const isDebit = /debit|spent|charged|payment|purchase/i.test(text);
      const isCredit = /credited|refund|cashback/i.test(text);
      if (!amount || isCredit || !isDebit) return [];
      return [{ category: 'Other', description: merchant, amount, date: new Date(), source: 'sms_parsed' }];
    });
    return res.json({ expenses: parsed });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to parse SMS expenses', error: error.message });
  }
};
