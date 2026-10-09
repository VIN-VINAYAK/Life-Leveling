import { Achievement } from '../models/Achievement.js';
import { Notification } from '../models/Notification.js';
import { XPEngine } from './xpEngine.js';

const coreAchievements = [
  { key: 'first_task', name: 'First Task Completed', description: 'Complete your first task', unlocked: (user) => user.completedTasks >= 1 },
  { key: 'first_habit', name: 'Habit Builder', description: 'Complete your first habit', unlocked: (user) => user.completedHabits >= 1 },
  { key: 'tasks_10', name: 'Task Momentum', description: 'Complete 10 tasks', unlocked: (user) => user.completedTasks >= 10 },
  { key: 'tasks_25', name: 'Quarter Century', description: 'Complete 25 tasks', unlocked: (user) => user.completedTasks >= 25 },
  { key: 'level_5', name: 'Level 5', description: 'Reach level 5', unlocked: (user) => user.level >= 5 },
  { key: 'level_10', name: 'Double Digits', description: 'Reach level 10', unlocked: (user) => user.level >= 10 },
  { key: 'xp_500', name: '500 XP Earned', description: 'Earn 500 XP', unlocked: (user) => user.xp >= 500 },
  { key: 'xp_1000', name: 'XP Vanguard', description: 'Earn 1,000 XP', unlocked: (user) => user.xp >= 1000 },
  { key: 'streak_7', name: '7-Day Streak', description: 'Maintain a 7-day streak', unlocked: (user) => user.streak >= 7 },
  { key: 'streak_30', name: '30-Day Streak', description: 'Maintain a 30-day streak', unlocked: (user) => user.streak >= 30 }
];

const makeMilestones = (category, noun, milestones, getValue) => milestones.map(([threshold, name]) => ({
  key: `${category}_${threshold}`,
  name,
  description: `Reach ${threshold} ${noun}`,
  unlocked: (user) => getValue(user) >= threshold
}));

const milestoneAchievements = [
  ...makeMilestones('tasks', 'completed tasks', [
    [2, 'Task Pair'], [5, 'Task Starter'], [15, 'Task Adventurer'], [20, 'Task Regular'],
    [35, 'Task Pathfinder'], [50, 'Task Champion'], [75, 'Task Expert'], [100, 'Century of Tasks'],
    [150, 'Task Legend'], [200, 'Task Master'], [250, 'Task Mythic']
  ], (user) => user.completedTasks || 0),
  ...makeMilestones('habits', 'habit completions', [
    [2, 'Habit Pair'], [5, 'Habit Starter'], [10, 'Habit Builder Plus'], [20, 'Habit Keeper'],
    [30, 'Habit Pathfinder'], [50, 'Habit Champion'], [75, 'Habit Expert'], [100, 'Century of Habits'],
    [150, 'Habit Legend'], [200, 'Habit Master'], [250, 'Habit Mythic']
  ], (user) => user.completedHabits || 0),
  ...makeMilestones('streak', 'streak days', [
    [3, 'Three-Day Spark'], [14, 'Two-Week Rhythm'], [21, 'Three-Week Rhythm'], [45, 'Momentum Maker'],
    [60, 'Two-Month Momentum'], [90, 'Quarter-Year Quest'], [100, 'Century Streak'], [180, 'Half-Year Hero'],
    [365, 'Year of Growth'], [500, 'Unstoppable Year'], [730, 'Two-Year Legend']
  ], (user) => user.streak || 0),
  ...makeMilestones('xp', 'XP earned', [
    [100, 'First Hundred'], [250, 'XP Collector'], [750, 'XP Seeker'], [1500, 'XP Adventurer'],
    [2500, 'XP Champion'], [5000, 'XP Powerhouse'], [7500, 'XP Veteran'], [10000, 'Ten Thousand Strong'],
    [25000, 'XP Legend'], [50000, 'XP Titan'], [100000, 'XP Mythic']
  ], (user) => user.xp || 0),
  ...makeMilestones('level', 'levels reached', [
    [2, 'Level Two'], [3, 'Level Three'], [4, 'Level Four'], [6, 'Level Six'],
    [7, 'Level Seven'], [8, 'Level Eight'], [12, 'Level Twelve'], [15, 'Level Fifteen'],
    [20, 'Level Twenty'], [25, 'Level Twenty-Five'], [30, 'Level Thirty']
  ], (user) => user.level || 1)
];

export const ACHIEVEMENT_CATALOG = [...coreAchievements, ...milestoneAchievements];

/**
 * Check and unlock achievements for a user based on current stats.
 * This function is idempotent and will not create duplicates.
 */
export const checkAndUnlockAchievements = async (user) => {
  const results = [];
  const existingAchievements = await Achievement.find({ userId: user._id }).select('key').lean();
  const existingKeys = new Set(existingAchievements.map(({ key }) => key));

  const unlock = async ({ key, name, description }) => {
    if (existingKeys.has(key)) return;

    const achievement = new Achievement({ userId: user._id, key, name, description });
    try {
      await achievement.save();
    } catch (error) {
      if (error.code === 11000) return;
      throw error;
    }
    existingKeys.add(key);
    results.push(achievement);
    await XPEngine.applyXP(user, 50);

    try {
      const notification = new Notification({
        userId: user._id,
        type: 'achievement',
        message: `Achievement unlocked: ${name}`,
        meta: { key }
      });
      await notification.save();
    } catch (error) {
      console.error('Failed to create achievement notification:', error);
    }
  };

  for (const achievement of ACHIEVEMENT_CATALOG) {
    if (achievement.unlocked(user)) await unlock(achievement);
  }

  if (results.length) await user.save();

  return results;
};
