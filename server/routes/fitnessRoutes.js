import express from 'express';
import { saveFitnessProfile, getFitnessProfile, logWorkout, getTodayFitness, getFitnessHistory, generateAiWorkoutPlan } from '../controllers/fitnessController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/profile', saveFitnessProfile);
router.get('/profile', getFitnessProfile);
router.post('/log', logWorkout);
router.get('/today', getTodayFitness);
router.get('/history', getFitnessHistory);
router.post('/ai-plan', generateAiWorkoutPlan);

export default router;
