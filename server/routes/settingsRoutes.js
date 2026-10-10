import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { changePassword, deleteAccount, getAccountActivity, getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getSettings);
router.patch('/', updateSettings);
router.post('/password', changePassword);
router.delete('/account', deleteAccount);
router.get('/activity', getAccountActivity);

export default router;
