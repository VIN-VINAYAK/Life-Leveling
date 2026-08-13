import React, { useEffect, useState } from 'react';
import { statsAPI } from '../services/api';

export const Calendar = () => {
  const [stats, setStats] = useState(null);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try { const res = await statsAPI.getStats(); setStats(res.data); } catch (err) { console.error(err); }
  };

  if (!stats) return <div className="p-6">Loading...</div>;

  // Render a simple 14-day grid from streakHistory
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Calendar</h1>
        <div className="grid grid-cols-7 gap-2">
          {stats.streakHistory.map((d, idx) => (
            <div key={idx} className={`p-3 rounded text-center ${d.allCompleted ? 'bg-green-500 text-white' : 'bg-white text-gray-700 shadow'}`}>
              <div className="text-xs">{new Date(d.date).toLocaleDateString()}</div>
              <div className="font-bold">{d.allCompleted ? '✓' : '-'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
