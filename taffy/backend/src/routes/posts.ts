import express from 'express';
import {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    pinPost,
    approvePost,
    getPendingPosts
} from '../controllers/postController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', getPosts);
router.get('/pending', authenticateToken, requireAdmin, getPendingPosts);
router.get('/:id', getPostById);
router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.patch('/:id/approve', authenticateToken, requireAdmin, approvePost);
router.delete('/:id', authenticateToken, deletePost);
router.patch('/:id/pin', authenticateToken, requireAdmin, pinPost);

export default router;
import { toggleLikePost } from '../controllers/postController';

router.post('/:id/like', authenticateToken, toggleLikePost);
