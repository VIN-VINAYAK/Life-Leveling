import express from 'express';
import { getAchievements } from '../controllers/achievementController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAchievements);

export default router;
