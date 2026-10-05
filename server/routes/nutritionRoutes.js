import express from 'express';
import rateLimit from 'express-rate-limit';
import { logNutrition, logNutritionBatch, getTodayNutrition, getNutritionHistory, getAiInsights, analyzeFoodText } from '../controllers/nutritionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const foodAnalysisLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false });
router.use(authMiddleware);

router.post('/log', logNutrition);
router.post('/log-batch', logNutritionBatch);
router.get('/today', getTodayNutrition);
router.get('/history', getNutritionHistory);
router.post('/ai-insights', getAiInsights);
router.post('/analyze-text', foodAnalysisLimiter, analyzeFoodText);

export default router;
