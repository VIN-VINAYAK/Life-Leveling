import express from 'express';
import { getStats } from '../controllers/statsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getStats);

export default router;
