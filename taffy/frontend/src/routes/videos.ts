import express from 'express';
import { getVideos, getVideoById, toggleLikeVideo, getPopularVideos } from '../controllers/videoController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', getVideos);
router.get('/popular', getPopularVideos);
router.get('/:id', getVideoById);
router.post('/:id/like', authenticateToken, toggleLikeVideo);

export default router;