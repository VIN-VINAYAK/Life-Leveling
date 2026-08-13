import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { leaderboardAPI } from '../services/api';

export const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [globalRes, rankRes] = await Promise.all([leaderboardAPI.getGlobal(), leaderboardAPI.getRank()]);
        setLeaderboard(globalRes.data.leaderboard || []);
        setRankData(rankRes.data);
      } catch (error) {
        toast.error('Unable to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">Leaderboard</p>
            <h1 className="text-3xl font-bold text-slate-900">Climb the ranks and unlock titles</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Back to dashboard</button>
        </div>

        {rankData && (
          <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em]">Your position</p>
            <h2 className="mt-2 text-2xl font-semibold">You’re ranked #{rankData.currentUser?.rank} — {rankData.currentUser?.title}</h2>
            <p className="mt-2 text-sm">Level {rankData.currentUser?.level} • {rankData.currentUser?.xp} XP • Streak {rankData.currentUser?.streak}</p>
          </div>
        )}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Top 10</h2>
          {loading ? <div className="mt-4 space-y-3">{[1,2,3].map((idx)=><div key={idx} className="h-14 animate-pulse rounded-2xl bg-slate-100" />)}</div> : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">XP</th>
                    <th className="px-4 py-3">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 10).map((entry) => (
                    <tr key={entry.username} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-semibold">#{entry.rank}</td>
                      <td className="px-4 py-3">{entry.username}</td>
                      <td className="px-4 py-3">{entry.title}</td>
                      <td className="px-4 py-3">{entry.level}</td>
                      <td className="px-4 py-3">{entry.xp}</td>
                      <td className="px-4 py-3">{entry.streak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {rankData?.nearbyUsers?.length > 0 && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Nearby users</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {rankData.nearbyUsers.map((user) => <div key={user.username} className="rounded-2xl border border-slate-200 p-4">#{user.rank} • {user.username} • {user.title}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
