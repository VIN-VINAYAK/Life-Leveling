import express from 'express';
import {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
  completeHabit
} from '../controllers/habitController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createHabit);
router.get('/', getHabits);
router.get('/:habitId', getHabit);
router.patch('/:habitId', updateHabit);
router.post('/:habitId/complete', completeHabit);
router.delete('/:habitId', deleteHabit);

export default router;
