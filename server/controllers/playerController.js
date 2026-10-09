import mongoose from 'mongoose';
import { Achievement } from '../models/Achievement.js';
import { User } from '../models/User.js';

export const getPlayerCard = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid player link' });
    }

    const user = await User.findById(req.params.id)
      .select('username level xp streak title completedTasks')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const achievements = await Achievement.find({ userId: user._id })
      .select('key name unlockedAt')
      .sort({ unlockedAt: -1 })
      .limit(3)
      .lean();

    return res.json({
      player: {
        username: user.username,
        level: user.level || 1,
        xp: user.xp || 0,
        streak: user.streak || 0,
        title: user.title || 'Novice',
        completedTasks: user.completedTasks || 0,
        medal: getMedalForLevel(user.level || 1),
        achievements
      }
    });
  } catch (error) {
    console.error('Get player card error:', error);
    return res.status(500).json({ message: 'Unable to load player card' });
  }
};

const getMedalForLevel = (level) => {
  if (level >= 50) return 'Conqueror';
  if (level >= 40) return 'Ace';
  if (level >= 30) return 'Crown';
  if (level >= 20) return 'Diamond';
  if (level >= 15) return 'Platinum';
  if (level >= 10) return 'Gold';
  if (level >= 5) return 'Silver';
  return 'Bronze';
};
