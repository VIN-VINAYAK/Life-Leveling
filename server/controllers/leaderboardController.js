import { User } from '../models/User.js';

const rankFields = 'username level xp title streak';

const getRankedUsers = () => User.find({}, rankFields)
  .sort({ xp: -1, level: -1, _id: 1 })
  .lean();

const publicRank = (user, rank, currentUserId) => ({
  isCurrentUser: currentUserId ? user._id.toString() === currentUserId : false,
  rank,
  username: user.username,
  level: user.level,
  xp: user.xp,
  title: user.title || 'Novice',
  streak: user.streak || 0
});

export const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await getRankedUsers();
    const leaderboard = users.map((user, index) => publicRank(user, index + 1, req.userId));
    return res.json({ leaderboard, totalUsers: leaderboard.length });
  } catch (error) {
    console.error('Fetch global leaderboard failed:', error);
    return res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

export const getUserRank = async (req, res) => {
  try {
    const users = await getRankedUsers();
    const currentIndex = users.findIndex((user) => user._id.toString() === req.userId);
    if (currentIndex < 0) return res.status(404).json({ message: 'User not found' });

    const currentUser = publicRank(users[currentIndex], currentIndex + 1, req.userId);
    const nearbyStart = Math.max(0, currentIndex - 5);
    const nearbyUsers = users
      .slice(nearbyStart, Math.min(users.length, currentIndex + 6))
      .map((user, index) => publicRank(user, nearbyStart + index + 1, req.userId));
    return res.json({ currentUser, nearbyUsers, totalUsers: users.length });
  } catch (error) {
    console.error('Fetch user rank failed:', error);
    return res.status(500).json({ message: 'Failed to fetch your rank' });
  }
};
