import express from 'express';
import { toggleFollow, checkFollow, getFollowing, getFollowers } from '../controllers/followController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.post('/:id/follow', authenticateToken, toggleFollow);
router.get('/:id/check', authenticateToken, checkFollow);

export default router;