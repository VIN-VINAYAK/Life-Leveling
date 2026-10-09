import express from 'express';
import { getPlayerCard } from '../controllers/playerController.js';

const router = express.Router();

router.get('/:id/card', getPlayerCard);

export default router;
