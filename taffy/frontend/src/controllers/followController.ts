import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { executeQuery } from '../config/database';

// 关注/取消关注
export async function toggleFollow(req: AuthRequest, res: Response) {
    try {
        const followingId = parseInt(req.params.id);
        const followerId = req.userId!;

        if (followerId === followingId) {
            return res.status(400).json({ error: '不能关注自己' });
        }

        const existing = await executeQuery(
            'SELECT 1 FROM follows WHERE follower_id = @followerId AND following_id = @followingId',
            { followerId, followingId }
        );

        if (existing.recordset.length > 0) {
            await executeQuery(
                'DELETE FROM follows WHERE follower_id = @followerId AND following_id = @followingId',
                { followerId, followingId }
            );
            res.json({ message: '取消关注', is_following: false });
        } else {
            await executeQuery(
                'INSERT INTO follows (follower_id, following_id) VALUES (@followerId, @followingId)',
                { followerId, followingId }
            );
            
            // 发送通知
            await executeQuery(
                `INSERT INTO notifications (user_id, type, content) VALUES (@followingId, 'follow', @content)`,
                { followingId, content: '有人关注了你~' }
            );
            
            res.json({ message: '关注成功', is_following: true });
        }
    } catch (error) {
        console.error('关注操作错误:', error);
        res.status(500).json({ error: '操作失败' });
    }
}

// 检查是否关注
export async function checkFollow(req: AuthRequest, res: Response) {
    try {
        const followingId = parseInt(req.params.id);
        const followerId = req.userId!;

        const existing = await executeQuery(
            'SELECT 1 FROM follows WHERE follower_id = @followerId AND following_id = @followingId',
            { followerId, followingId }
        );

        res.json({ is_following: existing.recordset.length > 0 });
    } catch (error) {
        console.error('检查关注错误:', error);
        res.status(500).json({ error: '检查失败' });
    }
}

// 获取用户的关注列表
export async function getFollowing(req: AuthRequest, res: Response) {
    try {
        const userId = parseInt(req.params.id) || req.userId!;

        const result = await executeQuery(
            `SELECT u.id, u.username, u.avatar_url, u.signature, f.created_at as followed_at
             FROM follows f
             INNER JOIN users u ON f.following_id = u.id
             WHERE f.follower_id = @userId
             ORDER BY f.created_at DESC`,
            { userId }
        );

        res.json(result.recordset);
    } catch (error) {
        console.error('获取关注列表错误:', error);
        res.status(500).json({ error: '获取失败' });
    }
}

// 获取用户的粉丝列表
export async function getFollowers(req: AuthRequest, res: Response) {
    try {
        const userId = parseInt(req.params.id) || req.userId!;

        const result = await executeQuery(
            `SELECT u.id, u.username, u.avatar_url, u.signature, f.created_at as followed_at
             FROM follows f
             INNER JOIN users u ON f.follower_id = u.id
             WHERE f.following_id = @userId
             ORDER BY f.created_at DESC`,
            { userId }
        );

        res.json(result.recordset);
    } catch (error) {
        console.error('获取粉丝列表错误:', error);
        res.status(500).json({ error: '获取失败' });
    }
}