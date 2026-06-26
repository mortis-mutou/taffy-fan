import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/conversations', authenticateToken, getConversations);
router.get('/:userId', authenticateToken, getMessages);
router.post('/', authenticateToken, sendMessage);

export default router;