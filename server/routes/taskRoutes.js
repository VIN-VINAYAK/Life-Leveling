import express from 'express';
import { 
  createTask, 
  getTasks, 
  getTask, 
  completeTask, 
  updateTask, 
  deleteTask 
} from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:taskId', getTask);
router.patch('/:taskId', updateTask);
router.post('/:taskId/complete', completeTask);
router.delete('/:taskId', deleteTask);

export default router;
