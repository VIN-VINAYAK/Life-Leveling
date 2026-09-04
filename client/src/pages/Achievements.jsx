import React, { useEffect, useState } from 'react';
import { achievementsAPI } from '../services/api';

export const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [pending, setPending] = useState([]);
  const [rewardXP, setRewardXP] = useState(50);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try {
      const res = await achievementsAPI.getAchievements();
      setAchievements(res.data.completed || res.data.achievements || []);
      setPending(res.data.pending || []);
      setRewardXP(res.data.rewardXP || 50);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">Milestones</p><h1 className="text-3xl font-bold">Achievements</h1><p className="mt-1 text-sm text-slate-400">Complete a milestone to earn <strong className="text-emerald-300">+{rewardXP} XP</strong>.</p></div>
          <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm"><span className="text-slate-400">Progress</span><strong className="ml-2 text-white">{achievements.length}/{achievements.length + pending.length}</strong></div>
        </div>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Completed achievements</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {achievements.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-slate-400">No achievements completed yet. Your first milestone is waiting.</div> : achievements.map(a => (
              <div key={a._id || a.key} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 shadow">
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-white">{a.name}</h3><p className="mt-1 text-sm text-slate-400">{a.description}</p></div><span className="rounded-full bg-emerald-400/15 px-2 py-1 text-xs font-semibold text-emerald-300">+{rewardXP} XP</span></div>
                <p className="mt-3 text-xs text-slate-500">Completed {a.unlockedAt ? new Date(a.unlockedAt).toLocaleString() : 'recently'}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Pending achievements</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pending.length === 0 ? <div className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-6 text-violet-200">Every available achievement is complete.</div> : pending.map(a => (
              <div key={a.key} className="rounded-2xl border border-slate-700 bg-slate-950/30 p-4 opacity-80"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-white">{a.name}</h3><p className="mt-1 text-sm text-slate-400">{a.description}</p></div><span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">Locked</span></div><p className="mt-3 text-xs font-semibold text-violet-300">Reward: +{rewardXP} XP</p></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
