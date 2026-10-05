import { User } from '../models/User.js';

export const getUserResponseLanguage = async (userId) => {
  const user = await User.findById(userId).select('language').lean();
  return user?.language === 'hi' ? 'Hindi' : 'English';
};
