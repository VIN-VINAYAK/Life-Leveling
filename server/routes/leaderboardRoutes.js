import express from 'express';
import { getGlobalLeaderboard, getUserRank } from '../controllers/leaderboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/global', getGlobalLeaderboard);
router.get('/rank', getUserRank);

export default router;
