import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import { nutritionAPI } from '../services/api';

const initialForm = { foodName: '', calories: '', carbs: '', protein: '', fat: '', quantity: '1' };

export const Nutrition = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [todayLog, setTodayLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [todayRes, historyRes] = await Promise.all([nutritionAPI.getToday(), nutritionAPI.getHistory()]);
      setTodayLog(todayRes.data);
      setHistory(historyRes.data.logs || []);
    } catch (error) {
      toast.error('Unable to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totals = useMemo(() => {
    const meals = todayLog?.meals || [];
    return meals.reduce((acc, item) => {
      acc.calories += Number(item.calories || 0);
      acc.protein += Number(item.protein || 0);
      acc.carbs += Number(item.carbs || 0);
      acc.fat += Number(item.fat || 0);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todayLog]);

  const chartData = useMemo(() => history.slice(0, 7).reverse().map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    calories: entry.totalCalories || 0
  })), [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await nutritionAPI.logMeal(form);
      toast.success('Meal logged successfully');
      setForm(initialForm);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save meal');
    }
  };

  const handleInsights = async () => {
    try {
      const payload = {
        nutritionData: {
          calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat
        }
      };
      const response = await nutritionAPI.getAiInsights(payload);
      setInsights(response.data.insights);
      toast.success('AI insights loaded');
    } catch (error) {
      toast.error('AI insights unavailable right now');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Nutry AI</p>
            <h1 className="text-3xl font-bold text-slate-900">Nutrition tracking and smart guidance</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Back to dashboard</button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Log a meal</h2>
            <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-3 py-2" placeholder="Food name" value={form.foodName} onChange={(e) => setForm({ ...form, foodName: e.target.value })} required />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder="Calories" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} required />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder="Carbs (g)" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} required />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder="Protein (g)" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} required />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder="Fat (g)" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} required />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              <button type="submit" className="md:col-span-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">Save meal</button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Today’s totals</h2>
                <p className="text-sm text-slate-500">A quick snapshot of your macros.</p>
              </div>
              <button onClick={handleInsights} className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">Get AI Insights</button>
            </div>
            {loading ? (
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((idx) => <div key={idx} className="h-14 animate-pulse rounded-2xl bg-slate-100" />)}
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                {['calories', 'protein', 'carbs'].map((key) => {
                  const max = key === 'calories' ? 2400 : 180;
                  const value = totals[key] || 0;
                  const percentage = Math.min(100, Math.round((value / max) * 100));
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                        <span className="capitalize">{key}</span>
                        <span>{Math.round(value)} / {max}</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Today’s meals</h2>
            <div className="mt-4 space-y-3">
              {loading ? (
                [1, 2].map((idx) => <div key={idx} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)
              ) : (todayLog?.meals || []).length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No meals logged yet today.</p>
              ) : (
                (todayLog?.meals || []).map((item, index) => (
                  <div key={`${item.foodName}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.foodName}</p>
                        <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-blue-600">{item.calories} kcal</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">Protein {item.protein}g</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">Carbs {item.carbs}g</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">Fat {item.fat}g</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            {insights && (
              <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-blue-600 p-6 text-white shadow-sm">
                <h3 className="text-lg font-semibold">AI insight</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <p><span className="font-semibold">Calorie assessment:</span> {insights.calorieAssessment}</p>
                  <p><span className="font-semibold">Balance:</span> {insights.proteinCarbFeedback}</p>
                  <p><span className="font-semibold">Tomorrow:</span> {insights.suggestions?.join(', ')}</p>
                  <p><span className="font-semibold">Tip:</span> {insights.motivationalTip}</p>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Last 7 days</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calories" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
