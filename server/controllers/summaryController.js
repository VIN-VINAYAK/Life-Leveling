import { Task } from '../models/Task.js';
import { FitnessLog } from '../models/FitnessLog.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { ExpenseLog } from '../models/ExpenseLog.js';
import { User } from '../models/User.js';
import { XPEngine } from '../services/xpEngine.js';
import { syncUserTitle } from '../services/titleService.js';
import { getAIJSON } from '../services/aiService.js';

const startOfDay = (date = new Date()) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
};

const endOfDay = (date = new Date()) => {
  const day = new Date(date);
  day.setHours(23, 59, 59, 999);
  return day;
};

export const getDailySummary = async (req, res) => {
  try {
    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const [tasks, workouts, nutrition, expenseLog, user] = await Promise.all([
      Task.find({ userId: req.userId, createdAt: { $gte: todayStart } }),
      FitnessLog.find({ userId: req.userId, date: { $gte: todayStart, $lte: todayEnd } }),
      NutritionLog.findOne({ userId: req.userId, date: { $gte: todayStart, $lte: todayEnd } }),
      ExpenseLog.findOne({ userId: req.userId, month: new Date().toISOString().slice(0, 7) }),
      User.findById(req.userId)
    ]);

    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    const summary = {
      tasksCompleted: completedTasks,
      xpEarnedToday: workouts.reduce((sum, item) => sum + (item.xpAwarded || 0), 0),
      workoutsDone: workouts.length,
      caloriesLogged: nutrition?.totalCalories || 0,
      expensesAdded: expenseLog?.expenses?.length || 0,
      streakStatus: user?.streak || 0
    };
    return res.json({ summary });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch daily summary', error: error.message });
  }
};

export const buildMonthlySummaryData = async (userId) => {
  const monthKey = new Date().toISOString().slice(0, 7);
  const [user, expenseLog, workouts, nutritionLogs, tasks] = await Promise.all([
    User.findById(userId),
    ExpenseLog.findOne({ userId: userId, month: monthKey }),
    FitnessLog.find({ userId: userId, createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
    NutritionLog.find({ userId: userId, createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
    Task.find({ userId: userId, createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } })
  ]);

  const totalCalories = nutritionLogs.reduce((sum, item) => sum + (item.totalCalories || 0), 0);
  const averageDailyCalories = nutritionLogs.length ? Math.round(totalCalories / Math.max(1, nutritionLogs.length)) : 0;
  const totalExpenses = expenseLog?.totalExpenses || 0;
  const monthlyIncome = expenseLog?.monthlyIncome || 0;
  const savingsAchieved = Math.max(0, monthlyIncome - totalExpenses);
  const summary = {
    totalXP: user?.xp || 0,
    tasksCompleted: tasks.filter((task) => task.status === 'completed').length,
    workoutSessions: workouts.length,
    averageDailyCalories,
    totalExpenses,
    monthlyIncome,
    savingsAchieved
  };

  return { summary };
};

export const getMonthlySummary = async (req, res) => {
  try {
    const payload = await buildMonthlySummaryData(req.userId);
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch monthly summary', error: error.message });
  }
};

export const getAiMotivation = async (req, res) => {
  try {
    const monthKey = new Date().toISOString().slice(0, 7);
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastInsightMonth = user.lastSummaryInsightMonth || null;
    if (lastInsightMonth === monthKey) {
      return res.json({ message: 'You already generated a monthly motivation message this month.' });
    }

    const summaryPayload = await buildMonthlySummaryData(req.userId);
    const summary = summaryPayload.summary;
    const fallback = {
      message: 'You are building meaningful momentum. Keep going and the results will compound.',
      tips: ['Focus on one habit at a time', 'Protect your weekly rest', 'Celebrate the small wins'],
      focusArea: 'Consistency over intensity'
    };

    let insights = fallback;
    try {
      const aiResponse = await getAIJSON({
        systemPrompt: 'You are a supportive life coach. Return a JSON object with message, tips (array of 3 strings), and focusArea.',
        userPrompt: `Create a concise monthly motivation message based on this summary: ${JSON.stringify(summary.summary)}. Keep it motivating and grounded in the user’s actual progress.`,
        maxTokens: 700
      });

      insights = {
        message: aiResponse.message || fallback.message,
        tips: Array.isArray(aiResponse.tips) && aiResponse.tips.length ? aiResponse.tips.slice(0, 3) : fallback.tips,
        focusArea: aiResponse.focusArea || fallback.focusArea
      };
    } catch (error) {
      console.error('Summary AI fallback used:', error.message);
      insights = fallback;
    }

    const newTotalXP = user.xp + 10;
    user.xp = newTotalXP;
    user.level = XPEngine.calculateLevel(newTotalXP);
    user.lastSummaryInsightMonth = monthKey;
    await syncUserTitle(user);
    await user.save();

    return res.json({ insights, xpAwarded: 10, userStats: { xp: user.xp, level: user.level, title: user.title } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate motivation', error: error.message });
  }
};
