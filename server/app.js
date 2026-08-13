import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import fitnessRoutes from './routes/fitnessRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';

dotenv.config();

const app = express();

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(generalLimiter);

// Connect to database
connectDB();

// Routes
app.get('/health', (req, res) => {
  res.json({ message: '✅ Server is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/summary', summaryRoutes);

export default app;
