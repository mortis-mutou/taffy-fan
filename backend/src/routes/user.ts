import express from 'express';
import { updateProfile, changePassword, dailySignIn, getUserPoints, getLeaderboard, getDailyQuote } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);
router.post('/signin', authenticateToken, dailySignIn);
router.get('/points/:id', getUserPoints);
router.get('/points', authenticateToken, getUserPoints);
router.get('/leaderboard', getLeaderboard);
router.get('/daily-quote', getDailyQuote);

export default router;