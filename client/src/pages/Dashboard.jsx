import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useXP } from '../context/XPContext';
import { tasksAPI } from '../services/api';
import { XPBar } from '../components/XPBar';
import { TaskCard } from '../components/TaskCard';

const QuickModuleCard = memo(({ title, description, stat, to, accent, onClick }) => (
  <button onClick={onClick} className={`rounded-3xl p-5 text-left shadow-sm transition hover:-translate-y-1 ${accent}`}>
    <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-80">{title}</p>
    <h3 className="mt-2 text-xl font-bold">{description}</h3>
    <p className="mt-3 text-sm font-medium">{stat}</p>
  </button>
));

export const Dashboard = () => {
  const { user, logout, fetchCurrentUser } = useAuth();
  const { userStats, updateStats, getXPToNextLevel, getProgressPercentage } = useXP();
  const [tasks, setTasks] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    category: 'general',
    xpReward: 10
  });
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
      await loadTasks();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      alert('Task title is required');
      return;
    }

    try {
      await tasksAPI.createTask(newTask);
      setNewTask({
        title: '',
        description: '',
        difficulty: 'medium',
        category: 'general',
        xpReward: 10
      });
      setShowCreateTask(false);
      await loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await tasksAPI.completeTask(taskId);
      const { xpAwarded, userStats: newStats } = response.data;

      // Update local state
      updateStats(newStats);
      
      // Refresh user data from server
      await fetchCurrentUser();
      await loadTasks();

      alert(`✅ Task completed! +${xpAwarded} XP`);
    } catch (error) {
      console.error('Failed to complete task:', error);
      alert('Failed to complete task');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const moduleCards = [
    { title: 'Nutrition', description: 'Track meals & macros', stat: 'Today: log your first meal', to: '/nutrition', accent: 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white' },
    { title: 'Fitness', description: 'Log workouts & plans', stat: 'Today: stay active', to: '/fitness', accent: 'bg-gradient-to-br from-emerald-600 to-lime-500 text-white' },
    { title: 'Expense', description: 'Manage budget', stat: 'Track spending in real time', to: '/expense', accent: 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white' },
    { title: 'Leaderboard', description: 'Rise through the ranks', stat: `Title: ${user?.title || 'Novice'}`, to: '/leaderboard', accent: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' },
    { title: 'Summary', description: 'See your momentum', stat: 'Daily + monthly overview', to: '/summary', accent: 'bg-gradient-to-br from-cyan-600 to-sky-500 text-white' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Life Leveling</h1>
            <p className="text-blue-100">Welcome, {user?.username}</p>
            <p className="text-sm text-blue-50">{user?.title || 'Novice'} • Level {userStats.level}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/habits" className="text-white hover:underline">Habits</a>
            <a href="/achievements" className="text-white hover:underline">Achievements</a>
            <a href="/nutrition" className="text-white hover:underline">Nutrition</a>
            <a href="/fitness" className="text-white hover:underline">Fitness</a>
            <a href="/expense" className="text-white hover:underline">Expense</a>
            <a href="/leaderboard" className="text-white hover:underline">Leaderboard</a>
            <a href="/summary" className="text-white hover:underline">Summary</a>
            <a href="/notifications" className="text-white hover:underline">Notifications</a>
            <a href="/calendar" className="text-white hover:underline">Calendar</a>
            <a href="/stats" className="text-white hover:underline">Stats</a>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
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
        <XPBar
          currentXP={userStats.xp}
          xpToNextLevel={getXPToNextLevel(userStats.xp)}
          progress={getProgressPercentage(userStats.xp)}
        />

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

        {/* Tasks Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
            <button
              onClick={() => setShowCreateTask(!showCreateTask)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold"
            >
              {showCreateTask ? 'Cancel' : '+ New Task'}
            </button>
          </div>

          {/* Create Task Form */}
          {showCreateTask && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <form onSubmit={handleCreateTask}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Title</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Task title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Category</label>
                    <input
                      type="text"
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g., Work, Exercise"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-bold mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Task description (optional)"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Difficulty</label>
                    <select
                      value={newTask.difficulty}
                      onChange={(e) => setNewTask({...newTask, difficulty: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="easy">Easy (1x XP)</option>
                      <option value="medium">Medium (1.5x XP)</option>
                      <option value="hard">Hard (2x XP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Base XP</label>
                    <input
                      type="number"
                      value={newTask.xpReward}
                      onChange={(e) => setNewTask({...newTask, xpReward: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      min="1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition mt-4"
                >
                  Create Task
                </button>
              </form>
            </div>
          )}

          {/* Pending Tasks */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Pending Tasks ({pendingTasks.length})</h3>
            {pendingTasks.length === 0 ? (
              <p className="text-gray-600">No pending tasks. Create one to get started!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onComplete={() => handleCompleteTask(task._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Completed Tasks ({completedTasks.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    completed
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
