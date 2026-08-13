import { NutritionLog } from '../models/NutritionLog.js';
import { User } from '../models/User.js';
import { XPEngine } from '../services/xpEngine.js';
import { syncUserTitle } from '../services/titleService.js';

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

    let responseText = '';
    try {
      const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-20240307',
          max_tokens: 600,
          messages: [{ role: 'user', content: `User's nutrition today: ${JSON.stringify(nutritionData || log?.meals || [])}. Give: 1) Calorie assessment 2) Protein/carb balance feedback 3) 3 food suggestions for tomorrow 4) Motivational message. Be specific and friendly. Keep it under 200 words.` }]
        })
      });

      const data = await aiResponse.json();
      responseText = data?.content?.[0]?.text || '';
    } catch (error) {
      responseText = '';
    }

    const insights = responseText
      ? {
          calorieAssessment: responseText.split('1)')[1]?.split('2)')[0]?.trim() || fallback.calorieAssessment,
          proteinCarbFeedback: responseText.split('2)')[1]?.split('3)')[0]?.trim() || fallback.proteinCarbFeedback,
          suggestions: responseText.split('3)')[1]?.split('4)')[0]?.split(/\n|,|\./).filter(Boolean).slice(0, 3) || fallback.suggestions,
          motivationalTip: responseText.split('4)')[1]?.trim() || fallback.motivationalTip
        }
      : fallback;

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
