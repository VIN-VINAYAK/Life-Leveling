import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { summaryAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const Summary = () => {
  const { language, t } = useLanguage();
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
        toast.error(t('Unable to load summary'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const shareSummary = async () => {
    try {
      const level = monthly?.totalXP ? Math.floor(monthly.totalXP / 100) + 1 : 1;
      const xp = monthly?.totalXP || 0;
      const text = language === 'hi'
        ? `${t('This month on Life Levelling, I earned ')}${xp} XP${t(' and reached Level ')}${level}!`
        : `I reached Level ${level} with ${xp} XP this month on Life Levelling!`;
      await navigator.clipboard.writeText(text);
      toast.success(t('Summary copied to clipboard'));
    } catch (error) {
      toast.error(t('Unable to copy summary'));
    }
  };

  const handleMotivation = async () => {
    try {
      const response = await summaryAPI.getMotivation();
      setMotivation(response.data.insights || {
        message: response.data.message || t('You are building meaningful momentum. Keep going and the results will compound.'),
        tips: ['Focus on one habit at a time', 'Protect your weekly rest', 'Celebrate the small wins'].map(t),
        focusArea: t('Consistency over intensity')
      });
      toast.success(t('Motivation generated'));
    } catch (error) {
      toast.error(t('Could not generate motivation'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600">{t('Summary')}</p>
            <h1 className="text-3xl font-bold text-slate-900">{t('Your monthly and daily progress snapshot')}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={shareSummary} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">{t('Share')}</button>
            <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">{t('Back to dashboard')}</button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{t('Today')}</h2>
            {loading ? <div className="mt-4 space-y-3">{[1,2,3].map((idx)=><div key={idx} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}</div> : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{t('Tasks completed')}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{daily?.tasksCompleted || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{t('XP earned')}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{daily?.xpEarnedToday || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{t('Workouts done')}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{daily?.workoutsDone || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{t('Calories logged')}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{daily?.caloriesLogged || 0}</p></div>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">{t('This month')}</h2>
              <button onClick={handleMotivation} className="rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white">{t('Generate AI Motivation')}</button>
            </div>
            {loading ? <div className="mt-4 space-y-3">{[1,2,3].map((idx)=><div key={idx} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}</div> : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{t('Total XP')}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{monthly?.totalXP || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{t('Tasks completed')}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{monthly?.tasksCompleted || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{t('Workouts')}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{monthly?.workoutSessions || 0}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{t('Savings')}</p><p className="mt-2 text-2xl font-semibold text-slate-900">₹{monthly?.savingsAchieved || 0}</p></div>
              </div>
            )}
          </div>
        </div>

        {motivation && (
          <div className="rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-600 p-6 text-white shadow-sm">
            <h3 className="text-lg font-semibold">{t('AI motivation')}</h3>
            <p className="mt-3 text-lg">{motivation.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {motivation.tips?.map((tip, index) => <span key={index} className="rounded-full bg-white/20 px-3 py-1 text-sm">{tip}</span>)}
            </div>
            <p className="mt-4 text-sm text-blue-50">{t('Focus area:')} {motivation.focusArea}</p>
          </div>
        )}
      </div>
    </div>
  );
};
