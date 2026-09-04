import { Achievement } from '../models/Achievement.js';
import { Notification } from '../models/Notification.js';
import { XPEngine } from './xpEngine.js';

export const ACHIEVEMENT_CATALOG = [
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

/**
 * Check and unlock achievements for a user based on current stats.
 * This function is idempotent and will not create duplicates.
 */
export const checkAndUnlockAchievements = async (user) => {
  const results = [];

  const unlock = async ({ key, name, description }) => {
    try {
      const exists = await Achievement.findOne({ userId: user._id, key });
      if (!exists) {
        const a = new Achievement({ userId: user._id, key, name, description });
        await a.save();
        results.push(a);
        await XPEngine.applyXP(user, 50);
        // create a notification for the unlocked achievement
        try {
          const n = new Notification({
            userId: user._id,
            type: 'achievement',
            message: `Achievement unlocked: ${name}`,
            meta: { key }
          });
          await n.save();
        } catch (err) {
          // ignore notification errors
        }
      }
    } catch (err) {
      // ignore duplicate errors or others
    }
  };

  for (const achievement of ACHIEVEMENT_CATALOG) {
    if (achievement.unlocked(user)) await unlock(achievement);
  }

  if (results.length) await user.save();

  return results;
};
