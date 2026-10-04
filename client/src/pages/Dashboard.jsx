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

  const getBadgeInfo = (level, title) => {
    const resolvedTitle = title || 'Novice';

    const badgeStyles = {
      Conqueror: {
        label: 'Conqueror',
        accent: 'from-violet-700 via-purple-600 to-fuchsia-600',
        ring: 'border-violet-200/80',
        medal: 'from-violet-100 via-violet-200 to-violet-500',
        text: 'text-white',
        levelText: 'text-violet-100'
      },
      Ace: {
        label: 'Ace',
        accent: 'from-sky-500 via-blue-500 to-indigo-700',
        ring: 'border-cyan-200/80',
        medal: 'from-cyan-100 via-cyan-200 to-sky-500',
        text: 'text-white',
        levelText: 'text-sky-100'
      },
      Crown: {
        label: 'Crown',
        accent: 'from-indigo-500 via-blue-500 to-cyan-400',
        ring: 'border-blue-200/80',
        medal: 'from-sky-100 via-indigo-200 to-blue-500',
        text: 'text-white',
        levelText: 'text-blue-100'
      },
      Diamond: {
        label: 'Diamond',
        accent: 'from-cyan-500 via-teal-500 to-emerald-500',
        ring: 'border-emerald-200/80',
        medal: 'from-emerald-100 via-teal-200 to-cyan-500',
        text: 'text-white',
        levelText: 'text-emerald-100'
      },
      Platinum: {
        label: 'Platinum',
        accent: 'from-amber-300 via-yellow-400 to-orange-500',
        ring: 'border-orange-200/80',
        medal: 'from-yellow-100 via-amber-200 to-orange-500',
        text: 'text-amber-950',
        levelText: 'text-amber-100'
      },
      Gold: {
        label: 'Gold',
        accent: 'from-slate-300 via-slate-400 to-slate-600',
        ring: 'border-slate-200/80',
        medal: 'from-slate-100 via-slate-200 to-slate-500',
        text: 'text-slate-900',
        levelText: 'text-slate-100'
      },
      Silver: {
        label: 'Silver',
        accent: 'from-orange-400 via-amber-500 to-orange-600',
        ring: 'border-orange-200/80',
        medal: 'from-orange-100 via-amber-200 to-orange-500',
        text: 'text-amber-950',
        levelText: 'text-amber-100'
      },
      Bronze: {
        label: 'Bronze',
        accent: 'from-amber-700 via-orange-700 to-yellow-800',
        ring: 'border-orange-100/80',
        medal: 'from-orange-100 via-yellow-200 to-orange-600',
        text: 'text-amber-50',
        levelText: 'text-orange-100'
      }
    };

    if (level >= 50) return { ...badgeStyles.Conqueror, rank: 'Conqueror', badgeText: 'Conqueror' };
    if (level >= 40) return { ...badgeStyles.Ace, rank: 'Ace', badgeText: 'Ace' };
    if (level >= 30) return { ...badgeStyles.Crown, rank: 'Crown', badgeText: 'Crown' };
    if (level >= 20) return { ...badgeStyles.Diamond, rank: 'Diamond', badgeText: 'Diamond' };
    if (level >= 15) return { ...badgeStyles.Platinum, rank: 'Platinum', badgeText: 'Platinum' };
    if (level >= 10) return { ...badgeStyles.Gold, rank: 'Gold', badgeText: 'Gold' };
    if (level >= 5) return { ...badgeStyles.Silver, rank: 'Silver', badgeText: 'Silver' };

    return { ...badgeStyles.Bronze, rank: 'Bronze', badgeText: 'Bronze' };
  };

  const currentLevelBadge = getBadgeInfo(userStats.level, user?.title || userStats.title);

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
          <div className={`relative overflow-hidden rounded-[30px] border-2 ${currentLevelBadge.ring} bg-[#070b14] px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.3)]`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${currentLevelBadge.accent} opacity-95`} />
            <div className="absolute inset-x-3 top-2 h-7 rounded-full border border-white/20 bg-white/10" />
            <div className="absolute left-1/2 top-2 h-14 w-[72%] -translate-x-1/2 rounded-full border border-white/15 bg-black/10" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-2 flex h-[110px] w-[110px] items-center justify-center rounded-full border-[6px] border-[#d4d7dd] bg-gradient-to-b from-[#f4f7ff] via-[#c8ced8] to-[#8d98a4] shadow-[inset_0_6px_12px_rgba(255,255,255,0.8),0_0_18px_rgba(255,255,255,0.45)]">
                <div className="relative flex h-[82px] w-[82px] items-center justify-center rounded-full border-[4px] border-[#606a78] bg-gradient-to-b from-[#0d1117] via-[#1a1f2a] to-[#070b14]">
                  <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${currentLevelBadge.accent}`} style={{ clipPath: 'polygon(50% 0%, 86% 18%, 100% 50%, 82% 84%, 50% 100%, 18% 84%, 0% 50%, 16% 18%)' }} />
                  <div className="absolute inset-[10px] rounded-full border border-white/30 bg-black/20" />
                  <div className="absolute inset-x-4 top-3 h-5 rounded-full border border-white/20 bg-white/15" />
                  <div className="absolute h-10 w-10 rounded-full border-2 border-white/40 bg-black/25" />
                  <div className="relative text-[28px] font-black tracking-[-0.08em] text-white">{userStats.level}</div>
                </div>
              </div>

              <div className={`inline-flex items-center rounded-full border border-white/30 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.26em] ${currentLevelBadge.text}`}>
                {currentLevelBadge.badgeText}
              </div>
              <p className={`mt-2 text-[9px] font-bold uppercase tracking-[0.24em] ${currentLevelBadge.levelText}`}>
                Current Level
              </p>
            </div>
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
