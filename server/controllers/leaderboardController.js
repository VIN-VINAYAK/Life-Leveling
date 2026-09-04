import { User } from '../models/User.js';

const CACHE_TTL_MS = 60_000;
const leaderboardCache = new Map();

const getCached = (key) => {
  const cached = leaderboardCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    leaderboardCache.delete(key);
    return null;
  }
  return cached.value;
};

const setCached = (key, value) => {
  leaderboardCache.set(key, { value, timestamp: Date.now() });
};

export const getGlobalLeaderboard = async (req, res) => {
  try {
    const cacheKey = 'global-leaderboard';
    const cached = getCached(cacheKey);
    if (cached) return res.json({ leaderboard: cached });

    const leaderboard = await User.find({}, { password: 0, email: 0 })
      .sort({ xp: -1, level: -1 })
      .limit(50)
      .lean();

    const sanitized = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      level: user.level,
      xp: user.xp,
      title: user.title || 'Novice',
      streak: user.streak || 0
    }));

    setCached(cacheKey, sanitized);
    return res.json({ leaderboard: sanitized });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
};

export const getUserRank = async (req, res) => {
  try {
    const cacheKey = `rank-${req.userId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const users = await User.find({}, { password: 0, email: 0 }).sort({ xp: -1, level: -1 }).lean();
    const rankedUsers = users.map((user, index) => ({ ...user, rank: index + 1 }));
    const current = rankedUsers.find((user) => user._id.toString() === req.userId);
    if (!current) return res.status(404).json({ message: 'User not found' });

    const nearby = rankedUsers.filter((user) => user.rank >= current.rank - 5 && user.rank <= current.rank + 5);
    const payload = { currentUser: { username: current.username, rank: current.rank, title: current.title || 'Novice', level: current.level, xp: current.xp, streak: current.streak || 0 }, nearbyUsers: nearby.map((user) => ({ rank: user.rank, username: user.username, title: user.title || 'Novice', level: user.level, xp: user.xp, streak: user.streak || 0 })) };
    setCached(cacheKey, payload);
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch your rank', error: error.message });
  }
};
