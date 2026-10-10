import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  let decoded;
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    if (!(await User.exists({ _id: decoded.userId }))) {
      return res.status(401).json({ message: 'Account no longer exists' });
    }
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    console.error('Authentication account lookup failed:', error);
    return res.status(503).json({ message: 'Could not verify the account. Please try again.' });
  }
};
