import express from 'express';
import { getNotifications, getUnreadCount, markAsRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getNotifications);
router.get('/unread-count', authenticateToken, getUnreadCount);
router.put('/read', authenticateToken, markAsRead);

export default router;