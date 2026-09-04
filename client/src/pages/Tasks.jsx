import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { TaskCard } from '../components/TaskCard';

export const Tasks = () => {
  const navigate = useNavigate();
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
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Daily actions</p><h1 className="mt-2 text-3xl font-bold text-white">Tasks</h1><p className="mt-1 text-sm text-slate-400">Complete a task to earn 10 XP.</p></div>
          <button onClick={() => setShowCreate(!showCreate)} className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-500">{showCreate ? 'Cancel' : '+ New task'}</button>
        </div>

        {showCreate && <form onSubmit={createTask} className="card-surface grid gap-4 p-6 md:grid-cols-2">
          <input required placeholder="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="rounded-xl border px-3 py-2" />
          <input placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="rounded-xl border px-3 py-2" />
          <textarea placeholder="Description (optional)" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="rounded-xl border px-3 py-2 md:col-span-2" rows="3" />
          <select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} className="rounded-xl border px-3 py-2"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
          <div className="rounded-xl border px-3 py-2 text-emerald-300">Completion reward: 10 XP</div>
          <button className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white md:col-span-2">Create task</button>
        </form>}

        {loading ? <div className="card-surface p-8 text-slate-400">Loading tasks...</div> : <>
          <section><h2 className="mb-3 text-xl font-semibold text-white">Pending ({pendingTasks.length})</h2><div className="grid gap-4 md:grid-cols-2">{pendingTasks.length ? pendingTasks.map((task) => <TaskCard key={task._id} task={task} onComplete={() => completeTask(task._id)} />) : <div className="card-surface p-6 text-slate-400">No pending tasks. Add one to get started.</div>}</div></section>
          {completedTasks.length > 0 && <section><h2 className="mb-3 text-xl font-semibold text-white">Completed ({completedTasks.length})</h2><div className="grid gap-4 md:grid-cols-2">{completedTasks.map((task) => <TaskCard key={task._id} task={task} completed />)}</div></section>}
        </>}
      </div>
    </div>
  );
};
