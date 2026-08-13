import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { summaryAPI } from '../services/api';

export const Summary = () => {
  const navigate = useNavigate();
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [motivation, setMotivation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dailyRes, monthlyRes] = await Promise.all([summaryAPI.getDaily(), summaryAPI.getMonthly()]);
        setDaily(dailyRes.data.summary);
        setMonthly(monthlyRes.data.summary);
      } catch (error) {
        toast.error('Unable to load summary');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const shareSummary = async () => {
    try {
      const text = `I reached Level ${monthly?.totalXP ? Math.floor(monthly.totalXP / 100) + 1 : 1} with ${monthly?.totalXP || 0} XP this month on Life Levelling!`;
      await navigator.clipboard.writeText(text);
      toast.success('Summary copied to clipboard');
    } catch (error) {
      toast.error('Unable to copy summary');
    }
  };

  const handleMotivation = async () => {
    try {
      const response = await summaryAPI.getMotivation();
      setMotivation(response.data.insights);
      toast.success('Motivation generated');
    } catch (error) {
      toast.error('Could not generate motivation');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600">Summary</p>
            <h1 className="text-3xl font-bold text-slate-900">Your monthly and daily progress snapshot</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={shareSummary} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Share</button>
            <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Back to dashboard</button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Today</h2>
            {loading ? <div className="mt-4 space-y-3">{[1,2,3].map((idx)=><div key={idx} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}</div> : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Tasks completed</p><p className="mt-2 text-2xl font-semibold text-slate-900">{daily?.tasksCompleted || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">XP earned</p><p className="mt-2 text-2xl font-semibold text-slate-900">{daily?.xpEarnedToday || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Workouts done</p><p className="mt-2 text-2xl font-semibold text-slate-900">{daily?.workoutsDone || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Calories logged</p><p className="mt-2 text-2xl font-semibold text-slate-900">{daily?.caloriesLogged || 0}</p></div>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">This month</h2>
              <button onClick={handleMotivation} className="rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white">Generate AI Motivation</button>
            </div>
            {loading ? <div className="mt-4 space-y-3">{[1,2,3].map((idx)=><div key={idx} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}</div> : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Total XP</p><p className="mt-2 text-2xl font-semibold text-slate-900">{monthly?.totalXP || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Tasks completed</p><p className="mt-2 text-2xl font-semibold text-slate-900">{monthly?.tasksCompleted || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Workouts</p><p className="mt-2 text-2xl font-semibold text-slate-900">{monthly?.workoutSessions || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Savings</p><p className="mt-2 text-2xl font-semibold text-slate-900">₹{monthly?.savingsAchieved || 0}</p></div>
              </div>
            )}
          </div>
        </div>

        {motivation && (
          <div className="rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-600 p-6 text-white shadow-sm">
            <h3 className="text-lg font-semibold">AI motivation</h3>
            <p className="mt-3 text-lg">{motivation.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {motivation.tips?.map((tip, index) => <span key={index} className="rounded-full bg-white/20 px-3 py-1 text-sm">{tip}</span>)}
            </div>
            <p className="mt-4 text-sm text-blue-50">Focus area: {motivation.focusArea}</p>
          </div>
        )}
      </div>
    </div>
  );
};
