import express from 'express';
import { toggleFavoritePost, getMyFavorites, reportPost } from '../controllers/favoriteController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getMyFavorites);
router.post('/:id/favorite', authenticateToken, toggleFavoritePost);
router.post('/:id/report', authenticateToken, reportPost);

export default router;