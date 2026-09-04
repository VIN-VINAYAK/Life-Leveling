import { Achievement } from '../models/Achievement.js';
import { ACHIEVEMENT_CATALOG } from '../services/achievementService.js';

export const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.userId }).sort({ unlockedAt: -1 }).lean();
    const completedKeys = new Set(achievements.map((achievement) => achievement.key));
    const pending = ACHIEVEMENT_CATALOG
      .filter((achievement) => !completedKeys.has(achievement.key))
      .map(({ key, name, description }) => ({ key, name, description }));
    return res.json({ achievements, completed: achievements, pending, rewardXP: 50 });
  } catch (error) {
    console.error('Get achievements error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
