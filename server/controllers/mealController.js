import { Meal } from '../models/Meal.js';
import { User } from '../models/User.js';
import { XPEngine } from '../services/xpEngine.js';

const DAY_MS = 1000 * 60 * 60 * 24;

const getStartOfDay = (date = new Date()) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  day.setMinutes(0, 0, 0, 0);
  day.setSeconds(0, 0, 0);
  day.setMilliseconds(0);
  return day;
};

const safeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isHealthyMeal = ({ calories, protein, carbs, fat }) => {
  if (calories <= 0) return false;
  const proteinRatio = protein / Math.max(calories, 1);
  const fatRatio = fat / Math.max(calories, 1);
  const carbsRatio = carbs / Math.max(calories, 1);

  return (
    protein >= 15 &&
    calories <= 700 &&
    fatRatio <= 0.35 &&
    proteinRatio >= 0.15 &&
    carbsRatio <= 0.7
  );
};

const sumTotals = (meals) =>
  meals.reduce(
    (totals, meal) => {
      totals.calories += meal.calories;
      totals.protein += meal.protein;
      totals.carbs += meal.carbs;
      totals.fat += meal.fat;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

const generateNutritionInsights = (totals, mealCount) => {
  const scoreBase = 60;
  const calorieGoal = 2200;
  const calorieScore = Math.max(0, 20 - Math.abs(calorieGoal - totals.calories) / 50);
  const proteinScore = Math.min(15, (totals.protein / 100) * 15);
  const fatScore = totals.fat <= 80 ? 10 : Math.max(0, 10 - (totals.fat - 80) / 8);
  const carbsScore = totals.carbs <= 300 ? 10 : Math.max(0, 10 - (totals.carbs - 300) / 15);
  const overallScore = Math.min(100, Math.round(scoreBase + calorieScore + proteinScore + fatScore + carbsScore));

  const positiveFeedback = [];
  const thingsToImprove = [];
  const foodsToEatTomorrow = [];

  if (totals.calories >= 1800 && totals.calories <= 2400) {
    positiveFeedback.push('Your calorie intake is well balanced for an active day.');
  } else if (totals.calories < 1800) {
    thingsToImprove.push('Consider a nutrient-dense snack to support sustained energy.');
  } else {
    thingsToImprove.push('Try to reduce higher calorie portions slightly for better balance.');
  }

  if (totals.protein >= 80) {
    positiveFeedback.push('You hit a strong protein target to support muscle and recovery.');
  } else {
    thingsToImprove.push('Add more lean protein to strengthen muscle and keep you full.');
  }

  if (totals.fat <= 80) {
    positiveFeedback.push('Your fat intake looks well controlled for the day.');
  } else {
    thingsToImprove.push('Watch higher fat ingredients and replace them with vegetables or lean protein.');
  }

  if (totals.carbs <= 300) {
    positiveFeedback.push('Your carbohydrate intake is within a sustainable range.');
  } else {
    thingsToImprove.push('Balance starchy carbs with vegetables or more protein next time.');
  }

  if (mealCount >= 3) {
    positiveFeedback.push('Nice job spacing meals through the day.');
  } else {
    thingsToImprove.push('Aim for at least three balanced meals to keep energy steady.');
  }

  if (totals.protein < 80) {
    foodsToEatTomorrow.push('lean chicken breast', 'plain Greek yogurt', 'tofu');
  } else {
    foodsToEatTomorrow.push('a colorful salad', 'mixed vegetables', 'whole grains');
  }

  if (totals.fat > 80) {
    foodsToEatTomorrow.push('avocado in moderation', 'steamed fish', 'grilled vegetables');
  }

  return {
    overallScore,
    positiveFeedback,
    thingsToImprove,
    foodsToEatTomorrow: foodsToEatTomorrow.slice(0, 3),
    hydrationReminder: 'Drink at least 8 glasses of water and keep hydration steady throughout the day.',
    motivationalMessage: 'Keep moving forward with mindful meals — your nutrition is one step closer to your goals.'
  };
};

export const createMeal = async (req, res) => {
  try {
    const {
      mealType,
      foodName,
      quantity,
      unit,
      calories,
      protein,
      carbs,
      fat,
      notes,
      date
    } = req.body;

    if (!mealType || !foodName || !quantity || !unit || !date) {
      return res.status(400).json({ message: 'Meal type, food name, quantity, unit and date are required' });
    }

    const parsedQuantity = Number(quantity);
    const parsedCalories = Number(calories);
    const parsedProtein = Number(protein);
    const parsedCarbs = Number(carbs);
    const parsedFat = Number(fat);

    if (
      parsedQuantity <= 0 ||
      parsedCalories < 0 ||
      parsedProtein < 0 ||
      parsedCarbs < 0 ||
      parsedFat < 0
    ) {
      return res.status(400).json({ message: 'Quantity and nutrition values must be positive' });
    }

    const mealDate = new Date(date);
    if (Number.isNaN(mealDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const meal = new Meal({
      userId: req.userId,
      mealType,
      foodName,
      quantity: parsedQuantity,
      unit,
      calories: parsedCalories,
      protein: parsedProtein,
      carbs: parsedCarbs,
      fat: parsedFat,
      notes: notes || '',
      date: mealDate
    });

    const todayStart = getStartOfDay();
    const todayEnd = new Date(todayStart.getTime() + DAY_MS);
    const existingMealTypesToday = await Meal.distinct('mealType', {
      userId: req.userId,
      date: { $gte: todayStart, $lt: todayEnd }
    });

    await meal.save();

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const baseXP = 5;
    const healthyBonus = isHealthyMeal({ calories: parsedCalories, protein: parsedProtein, carbs: parsedCarbs, fat: parsedFat }) ? 10 : 0;
    let xpAwarded = baseXP + healthyBonus;
    let mealCompleteBonus = 0;

    if (
      mealDate >= todayStart &&
      mealDate < todayEnd &&
      !existingMealTypesToday.includes(mealType)
    ) {
      const updatedMealTypes = [...existingMealTypesToday, mealType];
      if (['Breakfast', 'Lunch', 'Dinner', 'Snacks'].every((type) => updatedMealTypes.includes(type))) {
        mealCompleteBonus = 25;
        xpAwarded += mealCompleteBonus;
      }
    }

    user.xp += xpAwarded;
    user.level = XPEngine.calculateLevel(user.xp);
    await user.save();

    return res.status(201).json({
      message: 'Meal added successfully',
      meal,
      xpAwarded,
      userStats: {
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('Create meal error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 });

    const todayStart = getStartOfDay();
    const todayEnd = new Date(todayStart.getTime() + DAY_MS);
    const weekStart = new Date(todayStart.getTime() - 6 * DAY_MS);
    const monthStart = new Date(todayStart.getTime() - 29 * DAY_MS);

    const todayMeals = meals.filter((meal) => meal.date >= todayStart && meal.date < todayEnd);
    const weeklyMeals = meals.filter((meal) => meal.date >= weekStart && meal.date <= todayEnd);
    const monthlyMeals = meals.filter((meal) => meal.date >= monthStart && meal.date <= todayEnd);

    const totalNutrition = sumTotals(meals);
    const todayNutrition = sumTotals(todayMeals);

    const nutritionScore = generateNutritionInsights(todayNutrition, todayMeals.length).overallScore;

    return res.json({
      meals,
      totals: {
        calories: totalNutrition.calories,
        protein: totalNutrition.protein,
        carbs: totalNutrition.carbs,
        fat: totalNutrition.fat
      },
      today: {
        meals: todayMeals,
        calories: todayNutrition.calories,
        protein: todayNutrition.protein,
        carbs: todayNutrition.carbs,
        fat: todayNutrition.fat,
        mealCount: todayMeals.length,
        nutritionScore
      },
      weeklyCalories: weeklyMeals.reduce((sum, meal) => sum + meal.calories, 0),
      monthlyCalories: monthlyMeals.reduce((sum, meal) => sum + meal.calories, 0),
      recentMeals: meals.slice(0, 5)
    });
  } catch (error) {
    console.error('Get meals error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    if (meal.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    return res.json({ meal });
  } catch (error) {
    console.error('Get meal error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const updates = req.body;

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    if (meal.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const allowedFields = ['mealType', 'foodName', 'quantity', 'unit', 'calories', 'protein', 'carbs', 'fat', 'notes', 'date'];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        meal[field] = updates[field];
      }
    });

    if (meal.quantity <= 0 || meal.calories < 0 || meal.protein < 0 || meal.carbs < 0 || meal.fat < 0) {
      return res.status(400).json({ message: 'Nutrition values must be valid and non-negative' });
    }

    await meal.save();

    return res.json({ message: 'Meal updated successfully', meal });
  } catch (error) {
    console.error('Update meal error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    if (meal.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Meal.findByIdAndDelete(mealId);
    return res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const generateInsights = async (req, res) => {
  try {
    const payload = req.body || {};

    let totals = {
      calories: safeNumber(payload.calories),
      protein: safeNumber(payload.protein),
      carbs: safeNumber(payload.carbs),
      fat: safeNumber(payload.fat)
    };

    let mealCount = payload.mealCount || 0;

    if (!totals.calories && !totals.protein && !totals.carbs && !totals.fat) {
      const todayStart = getStartOfDay();
      const todayEnd = new Date(todayStart.getTime() + DAY_MS);
      const todayMeals = await Meal.find({
        userId: req.userId,
        date: { $gte: todayStart, $lt: todayEnd }
      });
      totals = sumTotals(todayMeals);
      mealCount = todayMeals.length;
    }

    const insights = generateNutritionInsights(totals, mealCount);

    return res.json({ insights });
  } catch (error) {
    console.error('AI insights error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
