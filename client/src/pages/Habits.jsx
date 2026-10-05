import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { habitsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HabitCard } from '../components/HabitCard';
import { PageSkeleton } from '../components/ui/Skeleton';
import { useLanguage } from '../context/LanguageContext';

export const Habits = () => {
  const { t } = useLanguage();
  const { fetchCurrentUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', difficulty: 'medium' });
  const [editForm, setEditForm] = useState({ title: '', category: '', difficulty: 'medium' });

  const getDifficultyReward = (difficulty) => {
    const rewards = {
      easy: 10,
      medium: 20,
      hard: 30
    };
    return rewards[difficulty] || 20;
  };

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
    if (!form.title.trim()) return alert(t('Title required'));
    try {
      await habitsAPI.createHabit(form);
      setForm({ title: '', category: '', difficulty: 'medium' });
      setShowCreate(false);
      await fetchCurrentUser();
      await loadHabits();
    } catch (err) { console.error(err); alert(t('Failed to create habit')); }
  };

  const handleComplete = async (id) => {
    try {
      const res = await habitsAPI.completeHabit(id);
      alert(`+${res.data.xpAwarded} XP`);
      await fetchCurrentUser();
      await loadHabits();
    } catch (err) { console.error(err);     alert(t('Failed to complete')); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('Delete habit?'))) return;
    try { await habitsAPI.deleteHabit(id); await loadHabits(); } catch (err) { console.error(err); }
  };

  const handleEditStart = (habit) => {
    setEditingHabitId(habit._id);
    setEditForm({
      title: habit.title,
      category: habit.category || '',
      difficulty: habit.difficulty || 'medium'
    });
  };

  const handleEditSave = async (id) => {
    try {
      await habitsAPI.updateHabit(id, editForm);
      setEditingHabitId(null);
      setEditForm({ title: '', category: '', difficulty: 'medium' });
      await fetchCurrentUser();
      await loadHabits();
    } catch (err) {
      console.error(err);
      alert(t('Failed to update habit'));
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('Habits')}</h1>
          <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">{showCreate ? t('Cancel') : t('+ New Habit')}</button>
        </div>

        {showCreate && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder={t('Title')} className="p-2 border rounded" />
                <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder={t('Category')} className="p-2 border rounded" />
                <select value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})} className="p-2 border rounded">
                  <option value="easy">{t('Easy')}</option>
                  <option value="medium">{t('Medium')}</option>
                  <option value="hard">{t('Hard')}</option>
                </select>
              </div>
              <div className="mt-4 rounded border border-slate-700 p-2 text-slate-400">{t('Reward:')} <strong className="text-emerald-300">{getDifficultyReward(form.difficulty)} XP</strong></div>
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">{t('Create')}</button>
            </form>
          </div>
        )}

        {habits.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">{t('No habits yet. Create one to get started.')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
            {habits.map(h => (
              <motion.div key={h._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }} className="space-y-3">
                <HabitCard
                  habit={h}
                  onComplete={() => handleComplete(h._id)}
                  onDelete={() => handleDelete(h._id)}
                  onEdit={() => handleEditStart(h)}
                />

                {editingHabitId === h._id && (
                  <div className="rounded-lg border border-slate-600 bg-slate-900 p-3">
                    <div className="grid gap-3">
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder={t('Habit title')}
                        className="rounded border border-slate-700 bg-slate-800 p-2 text-white"
                      />
                      <input
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        placeholder={t('Category')}
                        className="rounded border border-slate-700 bg-slate-800 p-2 text-white"
                      />
                      <select
                        value={editForm.difficulty}
                        onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                        className="rounded border border-slate-700 bg-slate-800 p-2 text-white"
                      >
                        <option value="easy">{t('Easy')}</option>
                        <option value="medium">{t('Medium')}</option>
                        <option value="hard">{t('Hard')}</option>
                      </select>
                      <div className="text-sm text-emerald-300">{t('Reward:')} {getDifficultyReward(editForm.difficulty)} XP</div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditSave(h._id)} className="flex-1 rounded bg-emerald-600 px-3 py-2 font-semibold text-white">{t('Save')}</button>
                        <button onClick={() => setEditingHabitId(null)} className="flex-1 rounded bg-slate-600 px-3 py-2 font-semibold text-white">{t('Cancel')}</button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
