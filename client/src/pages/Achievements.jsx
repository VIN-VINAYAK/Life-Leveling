import React, { useEffect, useState } from 'react';
import { achievementsAPI } from '../services/api';

export const Achievements = () => {
  const [achievements, setAchievements] = useState([]);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try {
      const res = await achievementsAPI.getAchievements();
      setAchievements(res.data.achievements);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Achievements</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.length === 0 ? (
            <div className="bg-white p-6 rounded shadow">No achievements yet.</div>
          ) : achievements.map(a => (
            <div key={a._id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">{a.name}</h3>
              <p className="text-sm text-gray-600">{a.description}</p>
              <p className="text-xs text-gray-400 mt-2">Unlocked {new Date(a.unlockedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
