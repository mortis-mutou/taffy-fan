import express from 'express';
import { getRepliesByPost, createReply, deleteReply } from '../controllers/replyController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/post/:postId', getRepliesByPost);
router.post('/', authenticateToken, createReply);
router.delete('/:id', authenticateToken, deleteReply);

export default router;