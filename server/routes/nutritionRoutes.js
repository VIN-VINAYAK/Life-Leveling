import express from 'express';
import { logNutrition, getTodayNutrition, getNutritionHistory, getAiInsights, analyzeFoodImage } from '../controllers/nutritionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/log', logNutrition);
router.get('/today', getTodayNutrition);
router.get('/history', getNutritionHistory);
router.post('/ai-insights', getAiInsights);
router.post('/analyze-image', analyzeFoodImage);

export default router;
