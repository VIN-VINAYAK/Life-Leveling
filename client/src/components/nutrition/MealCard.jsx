import React from 'react';

export const MealCard = ({ meal, compact = false }) => {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg ${compact ? 'flex items-center justify-between gap-4' : ''}`}>
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-2xl bg-blue-600/10 text-blue-600 px-3 py-1 font-semibold text-sm">{meal.mealType}</div>
          <span className="text-sm text-gray-500">{new Date(meal.date).toLocaleDateString()}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">{meal.foodName}</h3>
        <p className="mt-1 text-sm text-gray-500">{meal.quantity} {meal.unit}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
        <div className="rounded-3xl bg-slate-50 p-3">
          <p className="font-semibold">Calories</p>
          <p className="mt-1 text-lg text-slate-900">{meal.calories} kcal</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-3">
          <p className="font-semibold">Protein</p>
          <p className="mt-1 text-lg text-slate-900">{meal.protein} g</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-3">
          <p className="font-semibold">Carbs</p>
          <p className="mt-1 text-lg text-slate-900">{meal.carbs} g</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-3">
          <p className="font-semibold">Fat</p>
          <p className="mt-1 text-lg text-slate-900">{meal.fat} g</p>
        </div>
      </div>
    </div>
  );
};
