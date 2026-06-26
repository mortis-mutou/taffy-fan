import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { executeQuery } from '../config/database';

// 收藏帖子
export async function toggleFavoritePost(req: AuthRequest, res: Response) {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.userId!;

        const existing = await executeQuery(
            'SELECT 1 FROM favorites WHERE user_id = @userId AND post_id = @postId',
            { userId, postId }
        );

        if (existing.recordset.length > 0) {
            await executeQuery(
                'DELETE FROM favorites WHERE user_id = @userId AND post_id = @postId',
                { userId, postId }
            );
            res.json({ message: '取消收藏', is_favorited: false });
        } else {
            await executeQuery(
                'INSERT INTO favorites (user_id, post_id) VALUES (@userId, @postId)',
                { userId, postId }
            );
            res.json({ message: '收藏成功', is_favorited: true });
        }
    } catch (error) {
        console.error('收藏操作错误:', error);
        res.status(500).json({ error: '操作失败' });
    }
}

// 获取用户的收藏列表
export async function getMyFavorites(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const offset = (page - 1) * pageSize;

        const [postsResult, countResult] = await Promise.all([
            executeQuery(
                `SELECT p.*, u.username, u.avatar_url, f.created_at as favorited_at
                 FROM favorites f
                 INNER JOIN posts p ON f.post_id = p.id
                 INNER JOIN users u ON p.user_id = u.id
                 WHERE f.user_id = @userId
                 ORDER BY f.created_at DESC
                 OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
                { userId, offset, pageSize }
            ),
            executeQuery(
                'SELECT COUNT(*) AS total FROM favorites WHERE user_id = @userId',
                { userId }
            )
        ]);

        res.json({
            data: postsResult.recordset,
            pagination: {
                page, pageSize,
                total: countResult.recordset[0].total,
                totalPages: Math.ceil(countResult.recordset[0].total / pageSize)
            }
        });
    } catch (error) {
        console.error('获取收藏列表错误:', error);
        res.status(500).json({ error: '获取失败' });
    }
}

// 举报帖子
export async function reportPost(req: AuthRequest, res: Response) {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.userId!;
        const { reason } = req.body;

        await executeQuery(
            `INSERT INTO notifications (user_id, type, content, related_id) 
             VALUES (1, 'system', @content, @postId)`,
            {
                userId: 1,
                content: `举报帖子 #${postId}: ${reason || '未说明原因'}`,
                postId
            }
        );

        res.json({ message: '举报已提交，管理员会尽快处理' });
    } catch (error) {
        console.error('举报错误:', error);
        res.status(500).json({ error: '举报失败' });
    }
}