import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fitnessAPI } from '../services/api';

const initialProfile = { weight: '', height: '', fitnessGoal: 'maintain', activityLevel: 'moderate' };
const initialWorkout = { exerciseName: '', sets: '', reps: '', durationMinutes: '', caloriesBurned: '' };

export const Fitness = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile);
  const [workout, setWorkout] = useState(initialWorkout);
  const [todayLog, setTodayLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [plan, setPlan] = useState([]);
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
      setTodayLog(todayRes.data.log);
      setHistory(historyRes.data.logs || []);
    } catch (error) {
      toast.error('Unable to load fitness data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const chartData = useMemo(() => history.slice(0, 7).reverse().map((entry) => ({
    day: new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    minutes: entry.totalDuration || 0
  })), [history]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await fitnessAPI.saveProfile(profile);
      toast.success('Fitness profile updated');
    } catch (error) {
      toast.error('Could not save profile');
    }
  };

  const handleWorkoutLog = async (e) => {
    e.preventDefault();
    try {
      await fitnessAPI.logWorkout(workout);
      toast.success('Workout logged');
      setWorkout(initialWorkout);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not log workout');
    }
  };

  const handlePlan = async () => {
    try {
      const response = await fitnessAPI.generatePlan();
      setPlan(response.data.plan || []);
      toast.success('AI workout plan ready');
    } catch (error) {
      toast.error('Could not generate workout plan');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Fitness AI</p>
            <h1 className="text-3xl font-bold text-slate-900">Workout logging and personalised plans</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Back to dashboard</button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Fitness profile</h2>
            <form onSubmit={handleProfileSave} className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder="Weight (kg)" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder="Height (cm)" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} />
              <select className="rounded-xl border border-slate-200 px-3 py-2" value={profile.fitnessGoal} onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value })}>
                <option value="lose_weight">Lose weight</option>
                <option value="build_muscle">Build muscle</option>
                <option value="maintain">Maintain</option>
                <option value="improve_endurance">Improve endurance</option>
              </select>
              <select className="rounded-xl border border-slate-200 px-3 py-2" value={profile.activityLevel} onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="very_active">Very active</option>
              </select>
              <button type="submit" className="md:col-span-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Save profile</button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Today’s workout</h2>
                <p className="text-sm text-slate-500">Track your session and earn XP.</p>
              </div>
              <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">{todayLog?.xpAwarded || 0} XP</div>
            </div>
            <form onSubmit={handleWorkoutLog} className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-3 py-2" placeholder="Exercise name" value={workout.exerciseName} onChange={(e) => setWorkout({ ...workout, exerciseName: e.target.value })} required />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder="Sets" value={workout.sets} onChange={(e) => setWorkout({ ...workout, sets: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder="Reps" value={workout.reps} onChange={(e) => setWorkout({ ...workout, reps: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder="Duration (min)" value={workout.durationMinutes} onChange={(e) => setWorkout({ ...workout, durationMinutes: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" min="0" placeholder="Calories burned" value={workout.caloriesBurned} onChange={(e) => setWorkout({ ...workout, caloriesBurned: e.target.value })} />
              <button type="submit" className="md:col-span-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">Log workout</button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Today’s workout summary</h2>
              <button onClick={handlePlan} className="rounded-xl bg-purple-600 px-4 py-2 font-semibold text-white">Generate AI Workout Plan</button>
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
                      <p className="text-sm text-slate-500">{item.durationMinutes || 0} min</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Sets {item.sets || 0} • Reps {item.reps || 0} • Burned {item.caloriesBurned || 0} kcal</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No workouts logged yet today.</p>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Weekly activity</h3>
                  <p className="mt-1 text-xs text-slate-500">Workout duration by day</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Minutes</span>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="#27304e" strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fill: '#8f98bb', fontSize: 11 }} axisLine={{ stroke: '#384263' }} tickLine={false} />
                    <YAxis unit="m" tick={{ fill: '#8f98bb', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value} min`, 'Duration']} contentStyle={{ background: '#151b32', border: '1px solid #384263', borderRadius: 10 }} />
                    <Bar dataKey="minutes" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {plan.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 p-6 text-white shadow-sm">
                <h3 className="text-lg font-semibold">7-day plan</h3>
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
