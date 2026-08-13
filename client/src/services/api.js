import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () =>
    api.get('/auth/me')
};

// Tasks API
export const tasksAPI = {
  createTask: (taskData) =>
    api.post('/tasks', taskData),
  getTasks: (status) =>
    api.get('/tasks', { params: { status } }),
  getTask: (taskId) =>
    api.get(`/tasks/${taskId}`),
  updateTask: (taskId, updates) =>
    api.patch(`/tasks/${taskId}`, updates),
  completeTask: (taskId) =>
    api.post(`/tasks/${taskId}/complete`),
  deleteTask: (taskId) =>
    api.delete(`/tasks/${taskId}`)
};

// Habits API
export const habitsAPI = {
  createHabit: (data) => api.post('/habits', data),
  getHabits: () => api.get('/habits'),
  getHabit: (id) => api.get(`/habits/${id}`),
  updateHabit: (id, updates) => api.patch(`/habits/${id}`, updates),
  completeHabit: (id) => api.post(`/habits/${id}/complete`),
  deleteHabit: (id) => api.delete(`/habits/${id}`)
};

// Achievements API
export const achievementsAPI = {
  getAchievements: () => api.get('/achievements')
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`)
};

// Stats API
export const statsAPI = {
  getStats: () => api.get('/stats')
};

// Nutrition API
export const nutritionAPI = {
  getToday: () => api.get('/nutrition/today'),
  getHistory: () => api.get('/nutrition/history'),
  logMeal: (data) => api.post('/nutrition/log', data),
  getAiInsights: (data) => api.post('/nutrition/ai-insights', data)
};

// Fitness API
export const fitnessAPI = {
  saveProfile: (data) => api.post('/fitness/profile', data),
  getProfile: () => api.get('/fitness/profile'),
  logWorkout: (data) => api.post('/fitness/log', data),
  getToday: () => api.get('/fitness/today'),
  getHistory: () => api.get('/fitness/history'),
  generatePlan: () => api.post('/fitness/ai-plan')
};

// Expense API
export const expenseAPI = {
  setupMonth: (data) => api.post('/expense/setup', data),
  getCurrent: () => api.get('/expense/current'),
  addExpense: (data) => api.post('/expense/add', data),
  deleteExpense: (id) => api.delete(`/expense/${id}`),
  parseSms: (data) => api.post('/expense/parse-sms', data),
  getThingsList: () => api.get('/expense/things-list'),
  addThing: (data) => api.post('/expense/things-list', data),
  markPurchased: (id) => api.patch(`/expense/things-list/${id}`),
  getAiInsights: () => api.post('/expense/ai-insights')
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: () => api.get('/leaderboard/global'),
  getRank: () => api.get('/leaderboard/rank')
};

// Summary API
export const summaryAPI = {
  getDaily: () => api.get('/summary/daily'),
  getMonthly: () => api.get('/summary/monthly'),
  getMotivation: () => api.post('/summary/ai-motivation')
};

export default api;
