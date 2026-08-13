import { Habit } from '../models/Habit.js';
import { User } from '../models/User.js';
import { XPEngine } from '../services/xpEngine.js';
import { checkAndUnlockAchievements } from '../services/achievementService.js';

// Helper to check if a date is today
const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const a = new Date(d1);
  const b = new Date(d2);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return a.getTime() === b.getTime();
};

export const createHabit = async (req, res) => {
  try {
    const { title, category, xpReward } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    const habit = new Habit({
      userId: req.userId,
      title,
      category: category || 'general',
      xpReward: xpReward || 5
    });

    await habit.save();

    return res.status(201).json({ message: 'Habit created', habit });
  } catch (error) {
    console.error('Create habit error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json({ habits, count: habits.length });
  } catch (error) {
    console.error('Get habits error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const habit = await Habit.findById(habitId);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    if (habit.userId.toString() !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    return res.json({ habit });
  } catch (error) {
    console.error('Get habit error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { title, category, xpReward, active } = req.body;

    const habit = await Habit.findById(habitId);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    if (habit.userId.toString() !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    if (title) habit.title = title;
    if (category) habit.category = category;
    if (xpReward !== undefined) habit.xpReward = xpReward;
    if (active !== undefined) habit.active = active;

    await habit.save();

    return res.json({ message: 'Habit updated', habit });
  } catch (error) {
    console.error('Update habit error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const habit = await Habit.findById(habitId);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    if (habit.userId.toString() !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    await Habit.findByIdAndDelete(habitId);

    return res.json({ message: 'Habit deleted' });
  } catch (error) {
    console.error('Delete habit error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Complete a habit for today
 * - mark lastCompletedDate
 * - increment completedCount
 * - update habit streak
 * - award XP
 * - if all daily habits completed, update user's overall streak
 */
export const completeHabit = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findById(habitId);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    if (habit.userId.toString() !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If already completed today, return
    if (isSameDay(habit.lastCompletedDate, today)) {
      return res.status(400).json({ message: 'Habit already completed today' });
    }

    // Update habit streak
    if (!habit.lastCompletedDate) {
      habit.currentStreak = 1;
    } else {
      const last = new Date(habit.lastCompletedDate);
      last.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        habit.currentStreak += 1;
      } else if (daysDiff > 1) {
        habit.currentStreak = 1;
      }
    }

    habit.lastCompletedDate = new Date();
    habit.completedCount += 1;
    // append to history for calendar/stats
    try {
      habit.history = habit.history || [];
      habit.history.push(new Date());
    } catch (err) {
      // ignore
    }
    await habit.save();

    // Award XP to user
    const user = await User.findById(req.userId);
    const xpReward = XPEngine.calculateXPReward(habit.xpReward, 'easy');
    await XPEngine.applyXP(user, xpReward);
    await user.save();

    // Check if ALL active habits are completed today; if so, update overall streak
    const activeHabits = await Habit.find({ userId: req.userId, active: true });
    const incomplete = activeHabits.some(h => !isSameDay(h.lastCompletedDate, today));
    let streakUpdated = false;
    if (!incomplete) {
      XPEngine.updateStreak(user);
      await user.save();
      streakUpdated = true;
    }

    // Check achievements
    const unlocked = await checkAndUnlockAchievements(user);

    return res.json({
      message: 'Habit completed',
      habit,
      xpAwarded: xpReward,
      userStats: {
        xp: user.xp,
        level: user.level,
        streak: user.streak
      },
      streakUpdated,
      unlockedAchievements: unlocked
    });
  } catch (error) {
    console.error('Complete habit error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
