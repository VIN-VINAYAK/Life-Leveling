import { FitnessLog } from '../models/FitnessLog.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { User } from '../models/User.js';
import { XPEngine } from '../services/xpEngine.js';
import { syncUserTitle } from '../services/titleService.js';
import { getAIJSON } from '../services/aiService.js';

const startOfDay = (date = new Date()) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
};

const endOfDay = (date = new Date()) => {
  const day = new Date(date);
  day.setHours(23, 59, 59, 999);
  return day;
};

export const saveFitnessProfile = async (req, res) => {
  try {
    const { weight, height, fitnessGoal, activityLevel } = req.body;

    let profile = await FitnessProfile.findOne({ userId: req.userId });
    if (!profile) {
      profile = new FitnessProfile({ userId: req.userId });
    }

    if (weight !== undefined) profile.weight = Number(weight);
    if (height !== undefined) profile.height = Number(height);
    if (fitnessGoal) profile.fitnessGoal = fitnessGoal;
    if (activityLevel) profile.activityLevel = activityLevel;
    profile.updatedAt = new Date();

    await profile.save();
    return res.json({ profile });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save fitness profile', error: error.message });
  }
};

export const getFitnessProfile = async (req, res) => {
  try {
    const profile = await FitnessProfile.findOne({ userId: req.userId });
    return res.json({ profile });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch fitness profile', error: error.message });
  }
};

export const logWorkout = async (req, res) => {
  try {
    const { exerciseName, sets, reps, durationMinutes, caloriesBurned } = req.body;
    if (!exerciseName) return res.status(400).json({ message: 'Exercise name is required' });

    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    let log = await FitnessLog.findOne({ userId: req.userId, date: { $gte: start, $lte: end } });
    if (!log) {
      log = new FitnessLog({ userId: req.userId, date: today, workouts: [] });
    }

    const workout = {
      exerciseName,
      sets: Number(sets || 0),
      reps: Number(reps || 0),
      durationMinutes: Number(durationMinutes || 0),
      caloriesBurned: Number(caloriesBurned || 0)
    };

    log.workouts.push(workout);
    log.totalDuration += workout.durationMinutes;

    const baseXP = 20;
    const durationBonus = Math.min(80, Math.floor(workout.durationMinutes / 10) * 5);
    const xpAwarded = Math.min(100, baseXP + durationBonus);
    log.xpAwarded = (log.xpAwarded || 0) + xpAwarded;

    await log.save();

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newTotalXP = user.xp + xpAwarded;
    user.xp = newTotalXP;
    user.level = XPEngine.calculateLevel(newTotalXP);
    await syncUserTitle(user);
    await user.save();

    return res.status(201).json({ message: 'Workout logged', log, xpAwarded, userStats: { xp: user.xp, level: user.level, title: user.title } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to log workout', error: error.message });
  }
};

export const getTodayFitness = async (req, res) => {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);
    const log = await FitnessLog.findOne({ userId: req.userId, date: { $gte: start, $lte: end } });
    return res.json({ log });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch today workouts', error: error.message });
  }
};

export const getFitnessHistory = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const logs = await FitnessLog.find({ userId: req.userId, date: { $gte: since } }).sort({ date: -1 });
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch fitness history', error: error.message });
  }
};

export const generateAiWorkoutPlan = async (req, res) => {
  try {
    const profile = await FitnessProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Please save a fitness profile first' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (profile.cachedAiPlan?.generatedAt && new Date(profile.cachedAiPlan.generatedAt) > sevenDaysAgo) {
      return res.json({ plan: profile.cachedAiPlan.plan, cached: true });
    }

    const fallbackPlan = [
      { day: 'Day 1', focus: 'Mobility and light cardio', details: '20 minutes brisk walk + 10 minutes stretching' },
      { day: 'Day 2', focus: 'Upper body strength', details: '3 rounds of push-ups, rows, and shoulder presses' },
      { day: 'Day 3', focus: 'Recovery', details: 'Gentle mobility and a short walk' },
      { day: 'Day 4', focus: 'Lower body strength', details: 'Squats, lunges, and glute bridges' },
      { day: 'Day 5', focus: 'Core and conditioning', details: 'Planks, crunches, and light intervals' },
      { day: 'Day 6', focus: 'Active recovery', details: 'Stretch, walk, and balance work' },
      { day: 'Day 7', focus: 'Full body', details: 'A balanced session with posture and endurance focus' }
    ];

    let plan = fallbackPlan;
    try {
      const aiResponse = await getAIJSON({
        systemPrompt: 'You are a fitness coach. Respond with a JSON object containing a 7-item plan array. Each item has day, focus, and details. Keep it concise and realistic.',
        userPrompt: `Create a 7-day workout plan for a user with goal ${profile.fitnessGoal}, activity level ${profile.activityLevel}, weight ${profile.weight}kg, height ${profile.height}cm. Make each plan item actionable and specific.`,
        maxTokens: 700
      });

      const planItems = Array.isArray(aiResponse.plan) ? aiResponse.plan : [];
      if (planItems.length >= 7) {
        plan = planItems.slice(0, 7).map((item, index) => ({
          day: item.day || `Day ${index + 1}`,
          focus: item.focus || `Focus ${index + 1}`,
          details: item.details || 'Keep the session simple and consistent.'
        }));
      }
    } catch (error) {
      console.error('Fitness plan AI fallback used:', error.message);
      plan = fallbackPlan;
    }

    profile.cachedAiPlan = { plan, generatedAt: new Date() };
    await profile.save();

    return res.json({ plan, cached: false });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate workout plan', error: error.message });
  }
};
