import express from 'express';
import {
  createMeal,
  getMeals,
  getMeal,
  updateMeal,
  deleteMeal,
  generateInsights
} from '../controllers/mealController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/ai', generateInsights);
router.post('/', createMeal);
router.get('/', getMeals);
router.get('/:mealId', getMeal);
router.patch('/:mealId', updateMeal);
router.delete('/:mealId', deleteMeal);

export default router;
