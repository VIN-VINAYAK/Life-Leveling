import React, { useEffect, useState } from 'react';
import { statsAPI } from '../services/api';

export const Stats = () => {
  const [stats, setStats] = useState(null);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try { const res = await statsAPI.getStats(); setStats(res.data); } catch (err) { console.error(err); }
  };

  if (!stats) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">Weekly XP</h3>
            <p className="text-2xl">{stats.weeklyXP}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">Monthly XP</h3>
            <p className="text-2xl">{stats.monthlyXP}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">Task Completion Rate</h3>
            <p className="text-2xl">{stats.taskCompletionRate}%</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">Habit Completion Rate (today)</h3>
            <p className="text-2xl">{stats.habitCompletionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
