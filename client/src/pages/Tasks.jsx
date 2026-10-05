import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { tasksAPI } from '../services/api';
import { TaskCard } from '../components/TaskCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useLanguage } from '../context/LanguageContext';

export const Tasks = () => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'medium', category: 'general' });

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      setTasks(response.data.tasks || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const getDifficultyReward = (difficulty) => {
    const rewards = {
      easy: 10,
      medium: 20,
      hard: 30
    };
    return rewards[difficulty] || 20;
  };

  const createTask = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    await tasksAPI.createTask(form);
    setForm({ title: '', description: '', difficulty: 'medium', category: 'general' });
    setShowCreate(false);
    await loadTasks();
  };

  const completeTask = async (taskId) => {
    await tasksAPI.completeTask(taskId);
    await loadTasks();
  };

  const pendingTasks = tasks.filter((task) => task.status !== 'completed');
  const completedTasks = tasks.filter((task) => task.status === 'completed');

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">{t('Daily actions')}</p><h1 className="mt-2 text-3xl font-bold text-white">{t('Tasks')}</h1><p className="mt-1 text-sm text-slate-400">{t('Complete a task to earn XP based on its difficulty.')}</p></div>
          <button onClick={() => setShowCreate(!showCreate)} className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-500">{showCreate ? t('Cancel') : t('+ New task')}</button>
        </div>

        {showCreate && <form onSubmit={createTask} className="card-surface grid gap-4 p-6 md:grid-cols-2">
          <input required placeholder={t('Task title')} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="rounded-xl border px-3 py-2" />
          <input placeholder={t('Category')} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="rounded-xl border px-3 py-2" />
          <textarea placeholder={t('Description (optional)')} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="rounded-xl border px-3 py-2 md:col-span-2" rows="3" />
          <select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} className="rounded-xl border px-3 py-2"><option value="easy">{t('Easy')}</option><option value="medium">{t('Medium')}</option><option value="hard">{t('Hard')}</option></select>
          <div className="rounded-xl border px-3 py-2 text-emerald-300">{t('Completion reward:')} {getDifficultyReward(form.difficulty)} XP</div>
          <button className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white md:col-span-2">{t('Create task')}</button>
        </form>}

        {loading ? <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-36 rounded-2xl" /><Skeleton className="h-36 rounded-2xl" /></div> : <>
          <section><h2 className="mb-3 text-xl font-semibold text-white">{t('Pending')} ({pendingTasks.length})</h2><div className="grid gap-4 md:grid-cols-2"><AnimatePresence mode="popLayout">{pendingTasks.map((task) => <motion.div key={task._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}><TaskCard task={task} onComplete={() => completeTask(task._id)} /></motion.div>)}</AnimatePresence>{pendingTasks.length === 0 && <div className="card-surface p-6 text-slate-400">{t('No pending tasks. Add one to get started.')}</div>}</div></section>
          {completedTasks.length > 0 && <section><h2 className="mb-3 text-xl font-semibold text-white">{t('Completed')} ({completedTasks.length})</h2><div className="grid gap-4 md:grid-cols-2"><AnimatePresence mode="popLayout">{completedTasks.map((task) => <motion.div key={task._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><TaskCard task={task} completed /></motion.div>)}</AnimatePresence></div></section>}
        </>}
      </div>
    </div>
  );
};
