import api from './api';

export const nutritionAPI = {
  getMeals: () => api.get('/meals'),
  getMeal: (mealId) => api.get(`/meals/${mealId}`),
  createMeal: (mealData) => api.post('/meals', mealData),
  updateMeal: (mealId, updates) => api.patch(`/meals/${mealId}`, updates),
  deleteMeal: (mealId) => api.delete(`/meals/${mealId}`),
  generateInsights: (payload) => api.post('/meals/ai', payload)
};

export default nutritionAPI;
