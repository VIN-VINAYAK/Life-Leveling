import { Task } from '../models/Task.js';
import { Habit } from '../models/Habit.js';
import { User } from '../models/User.js';
import { XPEngine } from '../services/xpEngine.js';

const startOfDay = (d) => { const t = new Date(d); t.setHours(0,0,0,0); return t; };

export const getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    const now = new Date();
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 6); sevenDaysAgo.setHours(0,0,0,0);
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 29); thirtyDaysAgo.setHours(0,0,0,0);

    // Tasks XP in last 7 and 30 days
    const tasks7 = await Task.find({ userId, status: 'completed', completedAt: { $gte: sevenDaysAgo } });
    const tasks30 = await Task.find({ userId, status: 'completed', completedAt: { $gte: thirtyDaysAgo } });

    const sumXP = (tasks) => tasks.reduce((s, t) => s + XPEngine.calculateXPReward(t.xpReward, t.difficulty), 0);

    const weeklyXP = sumXP(tasks7);
    const monthlyXP = sumXP(tasks30);

    // Habits completions in range using history
    const habits = await Habit.find({ userId });

    const habitCompletionsInRange = (from) => {
      let count = 0;
      for (const h of habits) {
        if (!h.history || h.history.length === 0) continue;
        for (const d of h.history) {
          if (new Date(d) >= from) count += 1;
        }
      }
      return count;
    };

    const weeklyHabitCompletions = habitCompletionsInRange(sevenDaysAgo);
    const monthlyHabitCompletions = habitCompletionsInRange(thirtyDaysAgo);

    // Task completion rate
    const totalTasks = user.totalTasks || 0;
    const completedTasks = user.completedTasks || 0;
    const taskCompletionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Habit completion rate (approx): completed today vs total active habits
    const activeHabitsCount = habits.filter(h => h.active).length;
    const today = startOfDay(new Date());
    const completedToday = habits.filter(h => h.history && h.history.some(d => startOfDay(d).getTime() === today.getTime())).length;
    const habitCompletionRate = activeHabitsCount === 0 ? 0 : Math.round((completedToday / activeHabitsCount) * 100);

    // Streak history (last 14 days) - check if all active habits completed each day
    const streakDays = 14;
    const streakHistory = [];
    for (let i = streakDays - 1; i >= 0; i--) {
      const day = new Date(now); day.setDate(now.getDate() - i); day.setHours(0,0,0,0);
      const allCompleted = habits.every(h => (h.history || []).some(d => startOfDay(d).getTime() === day.getTime()));
      streakHistory.push({ date: day, allCompleted });
    }

    // Level progress
    const currentLevelXP = XPEngine.getCurrentLevelXP(user.xp);
    const xpToNext = XPEngine.getXPToNextLevel(user.xp);

    return res.json({
      weeklyXP,
      monthlyXP,
      weeklyHabitCompletions,
      monthlyHabitCompletions,
      taskCompletionRate,
      habitCompletionRate,
      streakHistory,
      levelProgress: { currentLevelXP, xpToNext }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
