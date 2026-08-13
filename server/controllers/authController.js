import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data without password
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        title: user.title || 'Novice'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        title: user.title || 'Novice'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        title: user.title || 'Novice',
        totalTasks: user.totalTasks,
        completedTasks: user.completedTasks
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
