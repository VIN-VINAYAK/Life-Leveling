import { AccountActivity } from '../models/AccountActivity.js';
import { Achievement } from '../models/Achievement.js';
import { ExpenseLog } from '../models/ExpenseLog.js';
import { FitnessLog } from '../models/FitnessLog.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { Habit } from '../models/Habit.js';
import { Meal } from '../models/Meal.js';
import { Notification } from '../models/Notification.js';
import { NutritionLog } from '../models/NutritionLog.js';
import { Task } from '../models/Task.js';
import { ThingsList } from '../models/ThingsList.js';
import { User } from '../models/User.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const supportedLanguages = new Set(['en', 'hi']);

export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username email language createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      settings: {
        username: user.username,
        email: user.email,
        language: user.language || 'en',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get account settings failed:', error);
    return res.status(500).json({ message: 'Could not load account settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const language = req.body.language;

    if (username.length < 3 || username.length > 24) {
      return res.status(400).json({ message: 'Username must be between 3 and 24 characters' });
    }
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    if (!supportedLanguages.has(language)) {
      return res.status(400).json({ message: 'Choose a supported language' });
    }

    const duplicate = await User.findOne({
      _id: { $ne: req.userId },
      $or: [{ username }, { email }]
    }).select('_id');
    if (duplicate) return res.status(409).json({ message: 'That username or email is already in use' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const changedFields = [];
    if (user.username !== username) changedFields.push('username');
    if (user.email !== email) changedFields.push('email');
    if ((user.language || 'en') !== language) changedFields.push('language');

    user.username = username;
    user.email = email;
    user.language = language;
    await user.save();

    if (changedFields.length) {
      await AccountActivity.create({
        userId: user._id,
        type: 'account_updated',
        summary: `Updated ${changedFields.join(', ')}`
      });
    }

    return res.json({
      settings: { username: user.username, email: user.email, language: user.language, createdAt: user.createdAt },
      changedFields
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That username or email is already in use' });
    console.error('Update account settings failed:', error);
    return res.status(500).json({ message: 'Could not save account settings' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ message: 'Enter your current and new password' });
    }
    if (newPassword.length < 6 || newPassword.length > 128) {
      return res.status(400).json({ message: 'New password must be between 6 and 128 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    await AccountActivity.create({
      userId: user._id,
      type: 'password_changed',
      summary: 'Password changed'
    });
    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password failed:', error);
    return res.status(500).json({ message: 'Could not change password' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Enter your password to delete your account' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    const userId = user._id;
    await Promise.all([
      AccountActivity.deleteMany({ userId }),
      Achievement.deleteMany({ userId }),
      ExpenseLog.deleteMany({ userId }),
      FitnessLog.deleteMany({ userId }),
      FitnessProfile.deleteMany({ userId }),
      Habit.deleteMany({ userId }),
      Meal.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      NutritionLog.deleteMany({ userId }),
      Task.deleteMany({ userId }),
      ThingsList.deleteMany({ userId })
    ]);
    await User.deleteOne({ _id: userId });

    return res.json({ message: 'Your account and associated data have been deleted' });
  } catch (error) {
    console.error('Delete account failed:', error);
    return res.status(500).json({ message: 'Could not delete your account. Please try again.' });
  }
};

export const getAccountActivity = async (req, res) => {
  try {
    const events = await AccountActivity.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('type summary createdAt')
      .lean();
    return res.json({ events });
  } catch (error) {
    console.error('Get account activity failed:', error);
    return res.status(500).json({ message: 'Could not load account activity' });
  }
};
