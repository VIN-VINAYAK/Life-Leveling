import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { XPEngine } from '../services/xpEngine.js';
import { checkAndUnlockAchievements } from '../services/achievementService.js';

/**
 * Create a new task
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, difficulty, category, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = new Task({
      userId: req.userId,
      title,
      description,
      xpReward: 10,
      difficulty: difficulty || 'medium',
      category: category || 'general',
      dueDate: dueDate || null
    });

    await task.save();

    // Update user's total tasks
    await User.findByIdAndUpdate(req.userId, { $inc: { totalTasks: 1 } });

    return res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all tasks for a user
 */
export const getTasks = async (req, res) => {
  try {
    const { status, category, difficulty, q } = req.query;

    const filter = { userId: req.userId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (q) filter.title = { $regex: q, $options: 'i' };

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    return res.json({
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Complete a task and award XP
 */
export const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership
    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if already completed
    if (task.status === 'completed') {
      return res.status(400).json({ message: 'Task already completed' });
    }

    // Get user
    const user = await User.findById(req.userId);

    // Calculate XP reward
    const xpReward = 10;

    // Update streak
    XPEngine.updateStreak(user);

    // Add XP to user
    await XPEngine.applyXP(user, xpReward);
    user.completedTasks += 1;
    await user.save();

    // Check achievements
    const unlocked = await checkAndUnlockAchievements(user);

    // Mark task as completed
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    return res.json({
      message: 'Task completed successfully',
      xpAwarded: xpReward,
      userStats: {
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        completedTasks: user.completedTasks
      },
      task,
      unlockedAchievements: unlocked
    });
  } catch (error) {
    console.error('Complete task error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get a single task
 */
export const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    return res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a task
 */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, difficulty, category, dueDate } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ message: 'Cannot update completed tasks' });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (difficulty) task.difficulty = difficulty;
    if (category) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    return res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Task.findByIdAndDelete(taskId);

    // Decrement total tasks count
    await User.findByIdAndUpdate(req.userId, { $inc: { totalTasks: -1 } });

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
