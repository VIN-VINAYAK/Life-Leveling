import React, { useState } from 'react';
import { FoodSearch } from './FoodSearch';

const defaultForm = {
  mealType: 'Breakfast',
  foodName: '',
  quantity: 1,
  unit: 'grams',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  notes: '',
  date: new Date().toISOString().slice(0, 10)
};

export const MealForm = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiAvailable, setApiAvailable] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.mealType || !form.foodName || !form.quantity || !form.unit || !form.date) {
      setError('Please fill all required fields.');
      return;
    }
    if (form.quantity <= 0 || form.calories < 0 || form.protein < 0 || form.carbs < 0 || form.fat < 0) {
      setError('Quantity and nutrition values must be positive.');
      return;
    }

    await onSubmit(form);
    setForm(defaultForm);
  };

  const handleFoodSelect = (food) => {
    setForm((prev) => ({
      ...prev,
      foodName: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 p-4">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl md:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Meal</h2>
            <p className="text-sm text-gray-500 mt-1">Log your meal and nutrition values to earn XP.</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
            ✕
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Meal Type</span>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.mealType}
                onChange={(e) => setForm({ ...form, mealType: e.target.value })}
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snacks</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Food Name</span>
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.foodName}
                onChange={(e) => setForm({ ...form, foodName: e.target.value })}
                placeholder="Chicken Breast"
              />
            </label>
          </div>

          <FoodSearch
            query={searchTerm}
            onQueryChange={setSearchTerm}
            onFoodSelect={handleFoodSelect}
            onApiStatus={(available) => setApiAvailable(available)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Quantity</span>
              <input
                type="number"
                min="1"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Unit</span>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option>grams</option>
                <option>pieces</option>
                <option>cups</option>
                <option>ml</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Date</span>
              <input
                type="date"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Calories</span>
              <input
                type="number"
                min="0"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Protein (g)</span>
              <input
                type="number"
                min="0"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.protein}
                onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Carbs (g)</span>
              <input
                type="number"
                min="0"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.carbs}
                onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Fat (g)</span>
              <input
                type="number"
                min="0"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.fat}
                onChange={(e) => setForm({ ...form, fat: Number(e.target.value) })}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Notes</span>
            <textarea
              rows="3"
              className="mt-2 w-full rounded-3xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional details about your meal"
            />
          </label>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={onClose} className="rounded-3xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50 transition">
              Cancel
            </button>
            <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
              <button
                type="submit"
                className="rounded-3xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition"
              >
                Save Meal
              </button>
              <span className="text-sm text-slate-500">{apiAvailable ? 'Food search enabled.' : 'Manual nutrition entry only.'}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
