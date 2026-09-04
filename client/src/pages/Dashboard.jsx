import React, { useEffect, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useXP } from '../context/XPContext';
import { XPBar } from '../components/XPBar';

const QuickModuleCard = memo(({ title, description, stat, to, accent, onClick }) => (
  <button onClick={onClick} className={`rounded-3xl p-5 text-left shadow-sm transition hover:-translate-y-1 ${accent}`}>
    <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-80">{title}</p>
    <h3 className="mt-2 text-xl font-bold">{description}</h3>
    <p className="mt-3 text-sm font-medium">{stat}</p>
  </button>
));

export const Dashboard = () => {
  const { user, fetchCurrentUser } = useAuth();
  const { userStats, updateStats, getXPToNextLevel, getProgressPercentage } = useXP();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  // Update stats whenever user data changes
  useEffect(() => {
    if (user) {
      const nextStats = {
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
        totalTasks: user.totalTasks || 0,
        completedTasks: user.completedTasks || 0
      };

      if (JSON.stringify(userStats) !== JSON.stringify(nextStats)) {
        updateStats(nextStats);
      }
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      await fetchCurrentUser();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const moduleCards = [
    { title: 'Nutrition', description: 'Track meals & macros', stat: 'Today: log your first meal', to: '/nutrition', accent: 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white' },
    { title: 'Fitness', description: 'Log workouts & plans', stat: 'Today: stay active', to: '/fitness', accent: 'bg-gradient-to-br from-emerald-600 to-lime-500 text-white' },
    { title: 'Expense', description: 'Manage budget', stat: 'Track spending in real time', to: '/expense', accent: 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white' },
    { title: 'Leaderboard', description: 'Rise through the ranks', stat: `Title: ${user?.title || 'Novice'}`, to: '/leaderboard', accent: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' },
    { title: 'Summary', description: 'See your momentum', stat: 'Daily + monthly overview', to: '/summary', accent: 'bg-gradient-to-br from-cyan-600 to-sky-500 text-white' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Your life dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Good evening, {user?.username || 'Player'} <span aria-hidden="true">👋</span></h1>
            <p className="mt-1 text-sm text-slate-400">{user?.title || 'Novice'} · Keep building your momentum.</p>
          </div>
          <div className="rounded-2xl border border-violet-400/25 bg-violet-400/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wider text-violet-200">Current level</p>
            <p className="mt-1 text-2xl font-bold text-white">{userStats.level}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-bold mb-2">LEVEL</h3>
            <p className="text-4xl font-bold text-blue-600">{userStats.level}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-bold mb-2">XP</h3>
            <p className="text-4xl font-bold text-green-600">{userStats.xp}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-bold mb-2">STREAK 🔥</h3>
            <p className="text-4xl font-bold text-orange-600">{userStats.streak}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-bold mb-2">COMPLETED</h3>
            <p className="text-4xl font-bold text-purple-600">{userStats.completedTasks}/{userStats.totalTasks}</p>
          </div>
        </div>

        {/* XP Progress */}
        <div id="xp">
          <XPBar
            currentXP={userStats.xp}
            xpToNextLevel={getXPToNextLevel(userStats.xp)}
            progress={getProgressPercentage(userStats.xp)}
          />
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Daily progress</h2>
              <p className="text-sm text-gray-500">A quick snapshot of your most important habits.</p>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">{userStats.streak >= 7 ? '🔥 +10% XP bonus active' : 'Streak building'}</div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Tasks</p><p className="mt-2 text-xl font-semibold">{userStats.completedTasks}/{userStats.totalTasks}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Nutrition</p><p className="mt-2 text-xl font-semibold">Logged today</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Fitness</p><p className="mt-2 text-xl font-semibold">{userStats.streak >= 1 ? 'Active' : 'Start today'}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Expense</p><p className="mt-2 text-xl font-semibold">Within budget</p></div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {moduleCards.map((card) => (
            <QuickModuleCard
              key={card.title}
              title={card.title}
              description={card.description}
              stat={card.stat}
              accent={card.accent}
              onClick={() => navigate(card.to)}
            />
          ))}
        </div>

      </main>
    </div>
  );
};
