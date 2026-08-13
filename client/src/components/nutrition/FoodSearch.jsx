import React, { useEffect, useState } from 'react';

const FOOD_DATABASE = [
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100 g' },
  { name: 'Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: '100 g' },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, serving: '1 medium' },
  { name: 'Milk', calories: 60, protein: 3.2, carbs: 5, fat: 3.3, serving: '100 ml' },
  { name: 'Egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, serving: '1 large' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving: '1 medium' },
  { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, serving: '100 g' }
];

export const FoodSearch = ({ query, onQueryChange, onFoodSelect, onApiStatus }) => {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setSearching(true);
      const matches = FOOD_DATABASE.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
      setResults(matches);
      setSearching(false);
      onApiStatus(true);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, onApiStatus]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">Food Search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search Chicken Breast, Rice, Apple..."
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </label>

        <div className="space-y-3">
          {searching ? (
            <div className="rounded-3xl bg-white p-4 text-sm text-slate-500">Searching food items...</div>
          ) : query.trim() && results.length > 0 ? (
            <div className="grid gap-3">
              {results.map((food) => (
                <button
                  key={food.name}
                  type="button"
                  onClick={() => onFoodSelect(food)}
                  className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-400 transition"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{food.name}</h3>
                    <span className="text-xs uppercase text-slate-500">{food.serving}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Calories: {food.calories} kcal • Protein: {food.protein} g • Carbs: {food.carbs} g • Fat: {food.fat} g</p>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="rounded-3xl bg-white p-4 text-sm text-slate-500">No match found. You can enter nutrition values manually above.</div>
          ) : (
            <div className="rounded-3xl bg-white p-4 text-sm text-slate-500">Type a food name to see instant nutrition suggestions.</div>
          )}
        </div>
      </div>
    </div>
  );
};
