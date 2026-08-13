import { Achievement } from '../models/Achievement.js';

export const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.userId }).sort({ unlockedAt: -1 });
    return res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
