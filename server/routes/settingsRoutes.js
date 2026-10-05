import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { changePassword, getAccountActivity, getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getSettings);
router.patch('/', updateSettings);
router.post('/password', changePassword);
router.get('/activity', getAccountActivity);

export default router;
