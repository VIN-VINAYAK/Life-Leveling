import express from 'express';
import {
  setupExpenseMonth,
  getCurrentExpenseData,
  addExpense,
  deleteExpense,
  getExpenseHistory,
  addThingsListItem,
  getThingsList,
  markThingPurchased,
  getAiInsights,
  parseSmsExpenses
} from '../controllers/expenseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/setup', setupExpenseMonth);
router.get('/current', getCurrentExpenseData);
router.post('/add', addExpense);
router.delete('/:expenseId', deleteExpense);
router.get('/history', getExpenseHistory);
router.post('/things-list', addThingsListItem);
router.get('/things-list', getThingsList);
router.patch('/things-list/:itemId', markThingPurchased);
router.post('/ai-insights', getAiInsights);
router.post('/parse-sms', parseSmsExpenses);

export default router;
