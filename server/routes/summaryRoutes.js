import express from 'express';
import { getDailySummary, getMonthlySummary, getAiMotivation } from '../controllers/summaryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/daily', getDailySummary);
router.get('/monthly', getMonthlySummary);
router.post('/ai-motivation', getAiMotivation);

export default router;
