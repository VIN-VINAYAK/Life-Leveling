import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useXP } from '../context/XPContext';
import { nutritionAPI } from '../services/nutritionApi';
import { NutritionDashboard } from '../components/nutrition/NutritionDashboard';
import { MealCard } from '../components/nutrition/MealCard';
import { MealForm } from '../components/nutrition/MealForm';
import { AIInsightCard } from '../components/nutrition/AIInsightCard';
import { NutritionStats } from '../components/nutrition/NutritionStats';

export const NutritionPage = () => {
  const { user, fetchCurrentUser } = useAuth();
  const { updateStats, userStats } = useXP();
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [today, setToday] = useState({ meals: [], calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0, nutritionScore: 0 });
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [monthlyCalories, setMonthlyCalories] = useState(0);
  const [recentMeals, setRecentMeals] = useState([]);
  const [insights, setInsights] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMeals();
  }, []);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadMeals = async () => {
    try {
      setLoading(true);
      const response = await nutritionAPI.getMeals();
      const data = response.data;
      setMeals(data.meals);
      setTotals(data.totals);
      setToday(data.today);
      setWeeklyCalories(data.weeklyCalories);
      setMonthlyCalories(data.monthlyCalories);
      setRecentMeals(data.recentMeals);
      setInsights(null);
      if (user) {
        updateStats({
          ...userStats,
          xp: user.xp || userStats.xp,
          level: user.level || userStats.level
        });
      }
    } catch (err) {
      console.error('Failed to load meals', err);
      setError('Unable to load nutrition data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeal = async (mealData) => {
    try {
      const response = await nutritionAPI.createMeal(mealData);
      showToast(`Meal saved +${response.data.xpAwarded} XP`, 'success');
      const updatedMeal = response.data.meal;
      setMeals((current) => [updatedMeal, ...current]);
      setToday((current) => ({
        meals: [updatedMeal, ...current.meals],
        calories: current.calories + updatedMeal.calories,
        protein: current.protein + updatedMeal.protein,
        carbs: current.carbs + updatedMeal.carbs,
        fat: current.fat + updatedMeal.fat,
        mealCount: current.mealCount + 1,
        nutritionScore: response.data.userStats.xp ? current.nutritionScore : current.nutritionScore
      }));
      setRecentMeals((current) => [updatedMeal, ...current].slice(0, 5));
      setTotals((current) => ({
        calories: current.calories + updatedMeal.calories,
        protein: current.protein + updatedMeal.protein,
        carbs: current.carbs + updatedMeal.carbs,
        fat: current.fat + updatedMeal.fat
      }));
      const refreshUser = async () => {
        try {
          await fetchCurrentUser();
        } catch (e) {
          // ignore refresh error
        }
      };
      refreshUser();
      setShowForm(false);
    } catch (err) {
      console.error('Create meal failed', err);
      const message = err.response?.data?.message || 'Unable to save meal';
      showToast(message, 'error');
    }
  };

  const handleGenerateInsights = async () => {
    try {
      const response = await nutritionAPI.generateInsights({
        calories: today.calories,
        protein: today.protein,
        carbs: today.carbs,
        fat: today.fat,
        mealCount: today.mealCount
      });
      setInsights(response.data.insights);
      showToast('AI nutrition insights generated', 'success');
    } catch (err) {
      console.error('AI insights failed', err);
      showToast('Could not generate insights. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">NutryAI</h1>
            <p className="text-blue-100 mt-1">Track meals, calories and get smart nutrition feedback.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2 rounded-lg font-semibold transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              Add Meal
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {notification && (
          <div className={`mb-4 rounded-xl px-4 py-3 ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
            {notification.message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-rose-100 text-rose-800 px-4 py-3">{error}</div>
        )}

        <NutritionDashboard
          today={today}
          weeklyCalories={weeklyCalories}
          monthlyCalories={monthlyCalories}
          totalMeals={meals.length}
          topTotals={totals}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <NutritionStats today={today} />

            <section className="bg-white rounded-3xl shadow p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Today's Meals</h2>
                  <p className="text-sm text-gray-500">Meal log for your current day.</p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition"
                >
                  Add New Meal
                </button>
              </div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="h-28 rounded-3xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : today.mealCount === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  <p className="text-lg font-semibold mb-2">No meals logged yet today.</p>
                  <p className="text-sm">Add your first meal to start tracking nutrition and earn XP.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {today.meals.map((meal) => (
                    <MealCard key={meal._id} meal={meal} />
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-3xl shadow p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Meals</h2>
                  <p className="text-sm text-gray-500">Latest additions across all tracked meals.</p>
                </div>
              </div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="h-20 rounded-3xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : recentMeals.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  <p className="text-lg font-semibold mb-2">No meals yet.</p>
                  <p className="text-sm">Start logging to see recent meals and nutrition details.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {recentMeals.map((meal) => (
                    <MealCard key={meal._id} meal={meal} compact />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <AIInsightCard
              insights={insights}
              loading={loading}
              onGenerate={handleGenerateInsights}
              calories={today.calories}
            />

            <section className="bg-white rounded-3xl shadow p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Nutrition Summary</h2>
                  <p className="text-sm text-gray-500">Weekly and monthly calorie trends.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Weekly Calories</p>
                  <p className="mt-2 text-3xl font-bold text-blue-600">{weeklyCalories.toLocaleString()} kcal</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Monthly Calories</p>
                  <p className="mt-2 text-3xl font-bold text-purple-600">{monthlyCalories.toLocaleString()} kcal</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showForm && (
        <MealForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateMeal}
        />
      )}
    </div>
  );
};
