import { Achievement } from '../models/Achievement.js';
import { Notification } from '../models/Notification.js';

/**
 * Check and unlock achievements for a user based on current stats.
 * This function is idempotent and will not create duplicates.
 */
export const checkAndUnlockAchievements = async (user) => {
  const results = [];

  const attempts = [];

  const unlock = async (key, name, description) => {
    try {
      const exists = await Achievement.findOne({ userId: user._id, key });
      if (!exists) {
        const a = new Achievement({ userId: user._id, key, name, description });
        await a.save();
        results.push(a);
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

  // First task completed
  if (user.completedTasks >= 1) {
    attempts.push(unlock('first_task', 'First Task Completed', 'Completed your first task'));
  }

  // First habit completed
  // We don't have a global completedHabits counter on user, but habits may update achievements elsewhere.
  // Level milestones
  if (user.level >= 5) {
    attempts.push(unlock('level_5', 'Reached Level 5', 'Reached level 5 milestone'));
  }

  // XP milestone
  if (user.xp >= 500) {
    attempts.push(unlock('xp_500', '500 XP Earned', 'Earned 500 XP'));
  }

  // 7-day streak
  if (user.streak >= 7) {
    attempts.push(unlock('streak_7', '7-Day Streak', 'Maintained a 7-day streak'));
  }

  await Promise.all(attempts);

  return results;
};
