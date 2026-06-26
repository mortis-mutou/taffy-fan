import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { executeQuery } from '../config/database';

// 获取帖子的回帖列表
export async function getRepliesByPost(req: AuthRequest, res: Response) {
    try {
        const postId = parseInt(req.params.postId);
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 50;
        const offset = (page - 1) * pageSize;

        const [repliesResult, countResult] = await Promise.all([
            executeQuery(
                `SELECT 
                    r.*,
                    u.username, u.avatar_url
                FROM replies r
                INNER JOIN users u ON r.user_id = u.id
                WHERE r.post_id = @postId
                ORDER BY r.created_at ASC
                OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
                { postId, offset, pageSize }
            ),
            executeQuery(
                'SELECT COUNT(*) AS total FROM replies WHERE post_id = @postId',
                { postId }
            )
        ]);

        res.json({
            data: repliesResult.recordset,
            pagination: {
                page,
                pageSize,
                total: countResult.recordset[0].total,
                totalPages: Math.ceil(countResult.recordset[0].total / pageSize)
            }
        });
    } catch (error) {
        console.error('获取回帖列表错误:', error);
        res.status(500).json({ error: '获取回帖失败' });
    }
}

// 创建回帖
export async function createReply(req: AuthRequest, res: Response) {
    try {
        const { postId, content } = req.body;
        const userId = req.userId;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: '回帖内容不能为空' });
        }

        if (content.length > 2000) {
            return res.status(400).json({ error: '回帖内容不能超过2000字' });
        }

        // 检查帖子是否存在
        const post = await executeQuery(
            'SELECT id FROM posts WHERE id = @postId',
            { postId }
        );

        if (post.recordset.length === 0) {
            return res.status(404).json({ error: '帖子不存在' });
        }

        // 创建回帖
        const result = await executeQuery(
            `INSERT INTO replies (post_id, user_id, content) 
             VALUES (@postId, @userId, @content);
             SELECT * FROM replies WHERE id = SCOPE_IDENTITY();`,
            { postId, userId, content }
        );

        // 更新帖子的回帖数
        await executeQuery(
            'UPDATE posts SET reply_count = reply_count + 1 WHERE id = @postId',
            { postId }
        );

        // 获取用户信息
        const userResult = await executeQuery(
            'SELECT username, avatar_url FROM users WHERE id = @userId',
            { userId }
        );

        const newReply = {
            ...result.recordset[0],
            username: userResult.recordset[0].username,
            avatar_url: userResult.recordset[0].avatar_url
        };

        res.status(201).json({
            message: '回帖成功',
            reply: newReply
        });
    } catch (error) {
        console.error('创建回帖错误:', error);
        res.status(500).json({ error: '回帖失败，请稍后重试' });
    }
}

// 删除回帖
export async function deleteReply(req: AuthRequest, res: Response) {
    try {
        const replyId = parseInt(req.params.id);
        const userId = req.userId;
        const userRole = req.userRole;

        // 检查回帖是否存在及权限
        const reply = await executeQuery(
            'SELECT user_id, post_id FROM replies WHERE id = @replyId',
            { replyId }
        );

        if (reply.recordset.length === 0) {
            return res.status(404).json({ error: '回帖不存在' });
        }

        if (reply.recordset[0].user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: '没有权限删除此回帖' });
        }

        const postId = reply.recordset[0].post_id;

        await executeQuery('DELETE FROM replies WHERE id = @replyId', { replyId });

        // 更新帖子的回帖数
        await executeQuery(
            'UPDATE posts SET reply_count = reply_count - 1 WHERE id = @postId',
            { postId }
        );

        res.json({ message: '删除成功' });
    } catch (error) {
        console.error('删除回帖错误:', error);
        res.status(500).json({ error: '删除失败' });
    }
}