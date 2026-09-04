import React, { useEffect, useState } from 'react';
import { habitsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HabitCard } from '../components/HabitCard';

export const Habits = () => {
  const { fetchCurrentUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', xpReward: 10 });

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    try {
      const res = await habitsAPI.getHabits();
      setHabits(res.data.habits);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert('Title required');
    try {
      await habitsAPI.createHabit(form);
      setForm({ title: '', category: '', xpReward: 10 });
      setShowCreate(false);
      await fetchCurrentUser();
      await loadHabits();
    } catch (err) { console.error(err); alert('Failed to create habit'); }
  };

  const handleComplete = async (id) => {
    try {
      const res = await habitsAPI.completeHabit(id);
      alert(`+${res.data.xpAwarded} XP`);
      await fetchCurrentUser();
      await loadHabits();
    } catch (err) { console.error(err); alert('Failed to complete'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete habit?')) return;
    try { await habitsAPI.deleteHabit(id); await loadHabits(); } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Habits</h1>
          <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">{showCreate ? 'Cancel' : '+ New Habit'}</button>
        </div>

        {showCreate && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className="p-2 border rounded" />
                <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category" className="p-2 border rounded" />
                <div className="rounded border border-slate-700 p-2 text-slate-400">Reward: <strong className="text-emerald-300">10 XP</strong></div>
              </div>
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Create</button>
            </form>
          </div>
        )}

        {habits.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">No habits yet. Create one to get started.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {habits.map(h => (
              <HabitCard key={h._id} habit={h} onComplete={()=>handleComplete(h._id)} onDelete={()=>handleDelete(h._id)} onEdit={()=>{}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
