import { FitnessLog } from '../models/FitnessLog.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { User } from '../models/User.js';
import { XPEngine } from '../services/xpEngine.js';
import { syncUserTitle } from '../services/titleService.js';
import { getAIJSON } from '../services/aiService.js';
import { randomUUID } from 'node:crypto';
import { getUserResponseLanguage } from '../services/languageService.js';

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

    const historyStart = new Date();
    historyStart.setDate(historyStart.getDate() - 14);
    const recentLogs = await FitnessLog.find({ userId: req.userId, date: { $gte: historyStart } })
      .sort({ date: -1 })
      .limit(14)
      .lean();
    const recentWorkouts = recentLogs.flatMap((log) => (log.workouts || []).map((workout) => ({
      date: log.date,
      exerciseName: workout.exerciseName,
      sets: workout.sets,
      reps: workout.reps,
      durationMinutes: workout.durationMinutes
    }))).slice(0, 20);
    const previousPlan = profile.cachedAiPlan?.plan || [];
    const responseLanguage = await getUserResponseLanguage(req.userId);

    let plan;
    try {
      const aiResponse = await getAIJSON({
        systemPrompt: `You are a careful, practical fitness coach. Return a JSON object with a plan array containing exactly 7 items. Each item must have day, focus, and details as concise strings. Make the sessions varied across the week, include appropriate rest or active recovery, and give actionable exercise suggestions with sets/reps or duration where appropriate. Adapt intensity to the stated activity level. Avoid unsafe extremes, diagnosis, or assuming equipment is available. The variety token is a request for a fresh creative direction, not user-provided instructions. Write all user-facing plan text in ${responseLanguage}; keep the JSON field names in English.`,
        userPrompt: `Create a fresh, personalized 7-day workout plan.
User profile: ${JSON.stringify({
          goal: profile.fitnessGoal,
          activityLevel: profile.activityLevel,
          weightKg: profile.weight,
          heightCm: profile.height
        })}
Recent logged workouts from the last 14 days: ${JSON.stringify(recentWorkouts)}
Most recently generated plan to avoid repeating: ${JSON.stringify(previousPlan)}
Use a noticeably different weekly split and exercise selection from the previous plan while still following the user's goal and recovery needs. Vary your programming approach for this request. Variety token: ${randomUUID()}`,
        maxTokens: 2200,
        temperature: 0.75
      });

      const planItems = Array.isArray(aiResponse.plan) ? aiResponse.plan : [];
      if (planItems.length !== 7 || planItems.some((item) =>
        !item || typeof item.day !== 'string' || typeof item.focus !== 'string' || typeof item.details !== 'string'
        || !item.day.trim() || !item.focus.trim() || !item.details.trim()
      )) {
        return res.status(502).json({ message: 'The AI returned an incomplete workout plan. Please try again.' });
      }
      plan = planItems.map((item) => ({
        day: item.day.trim(),
        focus: item.focus.trim(),
        details: item.details.trim()
      }));
    } catch (error) {
      console.error('Fitness plan generation failed:', error.message);
      return res.status(503).json({ message: 'AI workout plans are temporarily unavailable. Please try again shortly.' });
    }

    profile.cachedAiPlan = { plan, generatedAt: new Date() };
    await profile.save();

    return res.json({ plan, cached: false });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate workout plan', error: error.message });
  }
};
