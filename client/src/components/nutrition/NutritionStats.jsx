import React from 'react';

export const NutritionStats = ({ today }) => {
  return (
    <section className="bg-white rounded-3xl shadow p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Nutrition Summary</h2>
          <p className="text-sm text-gray-500">Daily energy and macronutrient totals.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Calories</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{today.calories || 0} kcal</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Protein</p>
          <p className="mt-3 text-3xl font-bold text-emerald-600">{today.protein || 0} g</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Carbs</p>
          <p className="mt-3 text-3xl font-bold text-sky-600">{today.carbs || 0} g</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Fat</p>
          <p className="mt-3 text-3xl font-bold text-rose-600">{today.fat || 0} g</p>
        </div>
      </div>
    </section>
  );
};
