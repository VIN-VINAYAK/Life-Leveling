import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fitnessAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { GlassCard } from '../components/ui/GlassCard';

const initialProfile = { weight: '', height: '', fitnessGoal: 'maintain', activityLevel: 'moderate' };
const initialWorkout = { exerciseName: '', sets: '', reps: '', durationMinutes: '', caloriesBurned: '' };

export const Fitness = () => {
  const { language, t } = useLanguage();
  const locale = language === 'hi' ? 'hi-IN' : 'en';
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile);
  const [workout, setWorkout] = useState(initialWorkout);
  const [todayLog, setTodayLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [plan, setPlan] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, todayRes, historyRes] = await Promise.all([fitnessAPI.getProfile(), fitnessAPI.getToday(), fitnessAPI.getHistory()]);
      setProfile({
        weight: profileRes.data.profile?.weight || '',
        height: profileRes.data.profile?.height || '',
        fitnessGoal: profileRes.data.profile?.fitnessGoal || 'maintain',
        activityLevel: profileRes.data.profile?.activityLevel || 'moderate'
      });
      setPlan(profileRes.data.profile?.cachedAiPlan?.plan || []);
      setTodayLog(todayRes.data.log);
      setHistory(historyRes.data.logs || []);
    } catch (error) {
      toast.error(t('Unable to load fitness data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const chartData = useMemo(() => history.slice(0, 7).reverse().map((entry) => ({
    day: new Date(entry.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
    minutes: entry.totalDuration || 0
  })), [history, locale]);
  const weeklyMinutes = useMemo(() => chartData.reduce((total, entry) => total + Number(entry.minutes || 0), 0), [chartData]);
  const activeDays = useMemo(() => chartData.filter((entry) => Number(entry.minutes) > 0).length, [chartData]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await fitnessAPI.saveProfile(profile);
      toast.success(t('Fitness profile updated'));
    } catch (error) {
      toast.error(t('Could not save profile'));
    }
  };

  const handleWorkoutLog = async (e) => {
    e.preventDefault();
    try {
      await fitnessAPI.logWorkout(workout);
      toast.success(t('Workout logged'));
      setWorkout(initialWorkout);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || t('Could not log workout'));
    }
  };

  const handlePlan = async () => {
    setPlanLoading(true);
    try {
      const response = await fitnessAPI.generatePlan();
      setPlan(response.data.plan || []);
      toast.success(response.data.cached ? t('Showing your saved AI workout plan') : t('A fresh AI workout plan is ready'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('Could not generate workout plan'));
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">{t('Fitness AI')}</p>
            <h1 className="text-3xl font-bold text-slate-900">{t('Workout logging and personalised plans')}</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">{t('Back to dashboard')}</button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{t('Fitness profile')}</h2>
            <form onSubmit={handleProfileSave} className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder={t('Weight (kg)')} value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder={t('Height (cm)')} value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} />
              <select className="rounded-xl border border-slate-200 px-3 py-2" value={profile.fitnessGoal} onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value })}>
                <option value="lose_weight">{t('Lose weight')}</option>
                <option value="build_muscle">{t('Build muscle')}</option>
                <option value="maintain">{t('Maintain')}</option>
                <option value="improve_endurance">{t('Improve endurance')}</option>
              </select>
              <select className="rounded-xl border border-slate-200 px-3 py-2" value={profile.activityLevel} onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}>
                <option value="sedentary">{t('Sedentary')}</option>
                <option value="light">{t('Light')}</option>
                <option value="moderate">{t('Moderate')}</option>
                <option value="very_active">{t('Very active')}</option>
              </select>
              <button type="submit" className="md:col-span-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">{t('Save profile')}</button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t('Today’s workout')}</h2>
                <p className="text-sm text-slate-500">{t('Track your session and earn XP.')}</p>
              </div>
              <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">{todayLog?.xpAwarded || 0} XP</div>
            </div>
            <form onSubmit={handleWorkoutLog} className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-3 py-2" placeholder={t('Exercise name')} value={workout.exerciseName} onChange={(e) => setWorkout({ ...workout, exerciseName: e.target.value })} required />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder={t('Sets')} value={workout.sets} onChange={(e) => setWorkout({ ...workout, sets: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder={t('Reps')} value={workout.reps} onChange={(e) => setWorkout({ ...workout, reps: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder={t('Duration (min)')} value={workout.durationMinutes} onChange={(e) => setWorkout({ ...workout, durationMinutes: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder={t('Calories burned')} value={workout.caloriesBurned} onChange={(e) => setWorkout({ ...workout, caloriesBurned: e.target.value })} />
              <button type="submit" className="md:col-span-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">{t('Log workout')}</button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">{t('Today’s workout summary')}</h2>
              <button
                onClick={handlePlan}
                disabled={planLoading}
                aria-busy={planLoading}
                className="rounded-xl bg-purple-600 px-4 py-2 font-semibold text-white disabled:cursor-wait disabled:opacity-70"
              >
                {planLoading ? t('Creating a fresh plan…') : plan.length ? t('Generate a different plan') : t('Generate AI Workout Plan')}
              </button>
            </div>
            {loading ? (
              <div className="mt-4 space-y-3">
                {[1, 2].map((idx) => <div key={idx} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
              </div>
            ) : todayLog?.workouts?.length ? (
              <div className="mt-4 space-y-3">
                {todayLog.workouts.map((item, index) => (
                  <div key={`${item.exerciseName}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{item.exerciseName}</p>
                      <p className="text-sm text-slate-500">{item.durationMinutes || 0} {t('Minutes')}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{t('Sets')} {item.sets || 0} • {t('Reps')} {item.reps || 0} • {t('Burned')} {item.caloriesBurned || 0} kcal</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{t('No workouts logged yet today.')}</p>
            )}
          </div>

          <div className="space-y-6">
            <GlassCard className="fitness-chart-card">
              <div className="fitness-chart-heading">
                <div>
                  <p className="fitness-chart-eyebrow">{t('YOUR MOVEMENT')}</p>
                  <h3>{t('Weekly activity')}</h3>
                  <p>{t('Workout duration by day')}</p>
                </div>
                <div className="fitness-chart-summary"><strong>{weeklyMinutes.toLocaleString(locale)}</strong><span>{t('minutes this week')}</span></div>
              </div>
              {chartData.length ? (
                <div className="fitness-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 8, left: -15, bottom: 0 }} barCategoryGap="34%">
                    <defs>
                      <linearGradient id="fitnessBarFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--success)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--accent-strong)" stopOpacity={0.76} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="4 6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} dy={9} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={38} />
                    <Tooltip
                      cursor={{ fill: 'var(--mist)', radius: 8 }}
                      formatter={(value) => [`${Number(value).toLocaleString(locale)} ${t('Minutes')}`, t('Duration')]}
                      contentStyle={{ background: 'var(--bg-panel-raised)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--elev-2)' }}
                      labelStyle={{ color: 'var(--muted)', marginBottom: 4 }}
                    />
                    <Bar dataKey="minutes" name={t('Minutes')} fill="url(#fitnessBarFill)" radius={[7, 7, 3, 3]} maxBarSize={38} background={{ fill: 'var(--bg-panel-soft)', radius: 7 }} animationDuration={650} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="fitness-chart-empty">{t('Your workout history will appear here when you log a session.')}</p>}
              <div className="fitness-chart-footer">
                <span><i /> {t('Workout minutes')}</span>
                <strong>{activeDays} / 7 {t('active days')}</strong>
              </div>
            </GlassCard>
            {plan.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 p-6 text-white shadow-sm">
                <h3 className="text-lg font-semibold">{t('7-day plan')}</h3>
                <div className="mt-3 space-y-3">
                  {plan.map((item, index) => (
                    <div key={index} className="rounded-2xl bg-white/15 p-3">
                      <p className="font-semibold">{item.day}</p>
                      <p className="text-sm text-blue-50">{item.focus}: {item.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
