import { NutritionLog } from '../models/NutritionLog.js';
import { FitnessLog } from '../models/FitnessLog.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { User } from '../models/User.js';
import { XPEngine } from '../services/xpEngine.js';
import { syncUserTitle } from '../services/titleService.js';
import { getAIJSON, getAIVisionJSON } from '../services/aiService.js';

const getStartOfDay = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date = new Date()) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

const buildSummary = (meals) => {
  return meals.reduce(
    (acc, meal) => {
      acc.totalCalories += Number(meal.calories || 0);
      acc.totalProtein += Number(meal.protein || 0);
      acc.totalCarbs += Number(meal.carbs || 0);
      return acc;
    },
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0 }
  );
};

export const logNutrition = async (req, res) => {
  try {
    const { foodName, calories, carbs, protein, fat, quantity } = req.body;

    if (!foodName || Number(calories) < 0 || Number(carbs) < 0 || Number(protein) < 0 || Number(fat) < 0 || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Please provide valid nutrition entry details' });
    }

    const today = new Date();
    const start = getStartOfDay(today);
    const end = getEndOfDay(today);

    let log = await NutritionLog.findOne({ userId: req.userId, date: { $gte: start, $lte: end } });

    if (!log) {
      log = new NutritionLog({ userId: req.userId, date: today, meals: [] });
    }

    log.meals.push({ foodName, calories: Number(calories), carbs: Number(carbs), protein: Number(protein), fat: Number(fat), quantity: Number(quantity) });
    const totals = buildSummary(log.meals);
    log.totalCalories = totals.totalCalories;
    log.totalProtein = totals.totalProtein;
    log.totalCarbs = totals.totalCarbs;

    await log.save();

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const xpAward = 8;
    const newTotalXP = user.xp + xpAward;
    user.xp = newTotalXP;
    user.level = XPEngine.calculateLevel(newTotalXP);
    await syncUserTitle(user);
    await user.save();

    return res.status(201).json({ message: 'Nutrition log saved', log, xpAwarded: xpAward, userStats: { xp: user.xp, level: user.level, title: user.title } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save nutrition log', error: error.message });
  }
};

export const getTodayNutrition = async (req, res) => {
  try {
    const today = new Date();
    const start = getStartOfDay(today);
    const end = getEndOfDay(today);

    const log = await NutritionLog.findOne({ userId: req.userId, date: { $gte: start, $lte: end } });
    if (!log) {
      return res.json({ log: null, meals: [], totals: { totalCalories: 0, totalProtein: 0, totalCarbs: 0 } });
    }

    return res.json({ log, meals: log.meals, totals: { totalCalories: log.totalCalories, totalProtein: log.totalProtein, totalCarbs: log.totalCarbs } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch today nutrition', error: error.message });
  }
};

export const getNutritionHistory = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const logs = await NutritionLog.find({ userId: req.userId, date: { $gte: since } }).sort({ date: -1 });
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch nutrition history', error: error.message });
  }
};

export const getAiInsights = async (req, res) => {
  try {
    const { nutritionData } = req.body;
    if (!nutritionData) {
      return res.status(400).json({ message: 'Nutrition data is required' });
    }

    const today = new Date();
    const start = getStartOfDay(today);
    const end = getEndOfDay(today);
    const log = await NutritionLog.findOne({ userId: req.userId, date: { $gte: start, $lte: end } });

    const fallback = {
      calorieAssessment: 'Your intake looks balanced for today. Keep hydrating and focus on a protein forward meal tomorrow.',
      proteinCarbFeedback: 'Protein and carbs are in a reasonable range; a small increase in vegetables would make the day even stronger.',
      suggestions: ['Greek yogurt with berries', 'Grilled chicken salad', 'Oatmeal with banana'],
      motivationalTip: 'You are building strong habits one meal at a time. Keep it up.'
    };

    let insights = fallback;
    try {
      const aiResponse = await getAIJSON({
        systemPrompt: 'You are a nutrition coach. Return a JSON object with these fields: calorieAssessment, proteinCarbFeedback, suggestions (array of 3 strings), motivationalTip. Use the user data to provide a friendly, specific assessment.',
        userPrompt: `User's nutrition today: ${JSON.stringify(nutritionData || log?.meals || [])}. Keep the output focused on the user's actual intake and provide realistic guidance.`,
        maxTokens: 600
      });

      insights = {
        calorieAssessment: aiResponse.calorieAssessment || fallback.calorieAssessment,
        proteinCarbFeedback: aiResponse.proteinCarbFeedback || fallback.proteinCarbFeedback,
        suggestions: Array.isArray(aiResponse.suggestions) && aiResponse.suggestions.length ? aiResponse.suggestions.slice(0, 3) : fallback.suggestions,
        motivationalTip: aiResponse.motivationalTip || fallback.motivationalTip
      };
    } catch (error) {
      console.error('Nutrition AI fallback used:', error.message);
      insights = fallback;
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const todayLog = await NutritionLog.findOne({ userId: req.userId, date: { $gte: start, $lte: end } });
    if (!todayLog) {
      return res.json({ insights, xpAwarded: 0, message: 'No nutrition log found for today yet' });
    }

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const lastInsightTime = user.lastInsightDate || null;
    if (!lastInsightTime || new Date(lastInsightTime) < oneDayAgo) {
      const newTotalXP = user.xp + 15;
      user.xp = newTotalXP;
      user.level = XPEngine.calculateLevel(newTotalXP);
      user.lastInsightDate = new Date();
      await syncUserTitle(user);
      await user.save();
      return res.json({ insights, xpAwarded: 15, userStats: { xp: user.xp, level: user.level, title: user.title } });
    }

    return res.json({ insights, xpAwarded: 0, userStats: { xp: user.xp, level: user.level, title: user.title } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate AI insights', error: error.message });
  }
};

export const analyzeFoodImage = async (req, res) => {
  try {
    const { imageDataUrl } = req.body;
    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      return res.status(400).json({ message: 'A food image is required' });
    }

    const imageMatch = imageDataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!imageMatch) {
      return res.status(400).json({ message: 'Use a JPG, PNG, or WebP image' });
    }
    if (imageDataUrl.length > 11_000_000) {
      return res.status(413).json({ message: 'Image is too large. Please use an image under 8 MB.' });
    }

    const [profile, recentWorkouts] = await Promise.all([
      FitnessProfile.findOne({ userId: req.userId }).lean(),
      FitnessLog.find({ userId: req.userId }).sort({ date: -1 }).limit(5).lean()
    ]);

    const workoutSummary = recentWorkouts.flatMap((log) => log.workouts || []).slice(0, 8).map((workout) => ({
      exercise: workout.exerciseName,
      durationMinutes: workout.durationMinutes,
      caloriesBurned: workout.caloriesBurned
    }));

    const fallback = {
      foodName: 'Food in uploaded image',
      confidence: 'Low',
      servingSize: 'Unable to estimate reliably',
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
      vitaminsAndMinerals: [],
      ingredients: [],
      allergens: [],
      healthAssessment: 'The image could not be analyzed. Use a well-lit photo with the whole meal visible.',
      fitnessFit: 'Please try another image for a fitness-specific assessment.',
      recommendations: ['Use a clear, well-lit photo', 'Include the full plate and portion', 'Confirm estimates before tracking'],
      portionAdvice: 'Visual estimates can be inaccurate; verify portions when possible.'
    };

    let analysis = fallback;
    try {
      const aiResponse = await getAIVisionJSON({
        systemPrompt: 'You are a careful nutrition and fitness coach analyzing one food photo. Identify every visible food, estimate the total portion and nutrition for the entire visible serving, and never invent precision. If the portion or food is unclear, lower confidence and state the assumption. Return JSON with foodName, confidence (High, Medium, or Low), servingSize, nutrition (calories, protein, carbs, fat, fiber, sugar, sodium as numeric values), vitaminsAndMinerals (array of strings), ingredients (array of strings), allergens (array of strings), healthAssessment, fitnessFit, recommendations (array of 3 strings), and portionAdvice. Nutrition numbers must be numbers, not ranges or units.',
        userPrompt: `First identify the visible dish and its likely ingredients, then estimate nutrition for the full visible portion. Compare it with this user's fitness context: ${JSON.stringify(profile || { fitnessGoal: 'unknown', activityLevel: 'unknown', weight: null, height: null })}. Recent workouts: ${JSON.stringify(workoutSummary)}. Explain whether this food supports the user's goal, whether it is more suitable before or after training, and what to adjust. Do not claim medical certainty.`,
        imageDataUrl,
        maxTokens: 1200
      });

      analysis = {
        ...fallback,
        ...aiResponse,
        nutrition: { ...fallback.nutrition, ...(aiResponse.nutrition || {}) },
        vitaminsAndMinerals: Array.isArray(aiResponse.vitaminsAndMinerals) ? aiResponse.vitaminsAndMinerals : fallback.vitaminsAndMinerals,
        ingredients: Array.isArray(aiResponse.ingredients) ? aiResponse.ingredients : fallback.ingredients,
        allergens: Array.isArray(aiResponse.allergens) ? aiResponse.allergens : fallback.allergens,
        recommendations: Array.isArray(aiResponse.recommendations) ? aiResponse.recommendations.slice(0, 3) : fallback.recommendations
      };
      for (const key of Object.keys(fallback.nutrition)) {
        const numericValue = Number(analysis.nutrition[key]);
        analysis.nutrition[key] = Number.isFinite(numericValue) && numericValue >= 0 ? Math.round(numericValue * 10) / 10 : fallback.nutrition[key];
      }
    } catch (error) {
      console.error('Food image AI fallback used:', error.message);
    }

    return res.json({ analysis, fitnessContext: { profile, recentWorkouts: workoutSummary }, aiAvailable: analysis !== fallback });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to analyze food image', error: error.message });
  }
};
