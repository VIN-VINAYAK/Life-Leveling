import React from 'react';
import { NutritionProgress } from './NutritionProgress';

export const NutritionDashboard = ({ today, weeklyCalories, monthlyCalories, totalMeals, topTotals }) => {
  const dailyGoal = 2200;
  const dayProgress = Math.min(100, Math.round((today.calories / dailyGoal) * 100));

  return (
    <section className="bg-white rounded-3xl shadow p-6 mt-6">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl bg-slate-50 p-6 text-center shadow-inner">
          <h3 className="text-sm uppercase tracking-[0.35em] text-slate-500">Today's Calories</h3>
          <div className="mt-6 flex items-center justify-center">
            <NutritionProgress value={dayProgress} label={`${today.calories} / ${dailyGoal} kcal`} />
          </div>
          <p className="mt-6 text-sm text-slate-500">Daily goal is a general target. Adjust based on your personal plan.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-6">
            <h4 className="text-sm uppercase tracking-[0.25em] text-slate-500">Protein</h4>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{today.protein} g</p>
            <div className="mt-4 h-3 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (today.protein / 120) * 100)}%` }} />
            </div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6">
            <h4 className="text-sm uppercase tracking-[0.25em] text-slate-500">Carbohydrates</h4>
            <p className="mt-3 text-3xl font-bold text-sky-600">{today.carbs} g</p>
            <div className="mt-4 h-3 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(100, (today.carbs / 300) * 100)}%` }} />
            </div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6">
            <h4 className="text-sm uppercase tracking-[0.25em] text-slate-500">Fat</h4>
            <p className="mt-3 text-3xl font-bold text-rose-600">{today.fat} g</p>
            <div className="mt-4 h-3 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.min(100, (today.fat / 100) * 100)}%` }} />
            </div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6">
            <h4 className="text-sm uppercase tracking-[0.25em] text-slate-500">Today's Meals</h4>
            <p className="mt-3 text-3xl font-bold text-violet-600">{today.mealCount}</p>
            <p className="mt-2 text-sm text-slate-500">Logged across Breakfast, Lunch, Dinner and Snacks.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl bg-blue-600/5 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-700">Total Calories</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{topTotals.calories.toLocaleString()} kcal</p>
        </div>
        <div className="rounded-3xl bg-emerald-600/5 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">Weekly Calories</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{weeklyCalories.toLocaleString()} kcal</p>
        </div>
        <div className="rounded-3xl bg-purple-600/5 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-purple-700">Monthly Calories</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{monthlyCalories.toLocaleString()} kcal</p>
        </div>
      </div>
    </section>
  );
};
