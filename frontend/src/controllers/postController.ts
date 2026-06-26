import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { executeQuery } from '../config/database';

// 获取帖子列表（分页）
export async function getPosts(req: AuthRequest, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const keyword = req.query.keyword as string || null;

        const offset = (page - 1) * pageSize;

        let query = `
            SELECT 
                p.id, p.title, p.content, p.view_count, p.like_count, p.reply_count,
                p.is_pinned, p.created_at, p.updated_at,
                u.id AS user_id, u.username, u.avatar_url
            FROM posts p
            INNER JOIN users u ON p.user_id = u.id
        `;

        let countQuery = 'SELECT COUNT(*) AS total FROM posts p';
        let params: any = {};

        if (keyword) {
            query += ` WHERE p.title LIKE @keyword OR p.content LIKE @keyword`;
            countQuery += ` WHERE p.title LIKE @keyword OR p.content LIKE @keyword`;
            params.keyword = `%${keyword}%`;
        }

        query += ` ORDER BY p.is_pinned DESC, p.created_at DESC
                   OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`;
        
        params.offset = offset;
        params.pageSize = pageSize;

        const [postsResult, countResult] = await Promise.all([
            executeQuery(query, params),
            executeQuery(countQuery, params)
        ]);

        res.json({
            data: postsResult.recordset,
            pagination: {
                page,
                pageSize,
                total: countResult.recordset[0].total,
                totalPages: Math.ceil(countResult.recordset[0].total / pageSize)
            }
        });
    } catch (error) {
        console.error('获取帖子列表错误:', error);
        res.status(500).json({ error: '获取帖子列表失败' });
    }
}

// 获取帖子详情
export async function getPostById(req: AuthRequest, res: Response) {
    try {
        const postId = parseInt(req.params.id);

        // 更新浏览量并获取帖子详情
        await executeQuery(
            'UPDATE posts SET view_count = view_count + 1 WHERE id = @postId',
            { postId }
        );

        const result = await executeQuery(
            `SELECT 
                p.*,
                u.username, u.avatar_url, u.signature
            FROM posts p
            INNER JOIN users u ON p.user_id = u.id
            WHERE p.id = @postId`,
            { postId }
        );

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: '帖子不存在' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('获取帖子详情错误:', error);
        res.status(500).json({ error: '获取帖子详情失败' });
    }
}

// 创建帖子
export async function createPost(req: AuthRequest, res: Response) {
    try {
        const { title, content } = req.body;
        const userId = req.userId;

        if (!title || !content) {
            return res.status(400).json({ error: '请填写标题和内容' });
        }

        if (title.length > 200) {
            return res.status(400).json({ error: '标题不能超过200字' });
        }

        const result = await executeQuery(
            `INSERT INTO posts (user_id, title, content) 
             VALUES (@userId, @title, @content);
             SELECT * FROM posts WHERE id = SCOPE_IDENTITY();`,
            { userId, title, content }
        );

        res.status(201).json({
            message: '发布成功',
            post: result.recordset[0]
        });
    } catch (error) {
        console.error('创建帖子错误:', error);
        res.status(500).json({ error: '发布失败，请稍后重试' });
    }
}

// 更新帖子
export async function updatePost(req: AuthRequest, res: Response) {
    try {
        const postId = parseInt(req.params.id);
        const { title, content } = req.body;
        const userId = req.userId;
        const userRole = req.userRole;

        // 检查帖子是否存在及权限
        const post = await executeQuery(
            'SELECT user_id FROM posts WHERE id = @postId',
            { postId }
        );

        if (post.recordset.length === 0) {
            return res.status(404).json({ error: '帖子不存在' });
        }

        if (post.recordset[0].user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: '没有权限编辑此帖子' });
        }

        await executeQuery(
            `UPDATE posts SET title = @title, content = @content, updated_at = GETDATE() 
             WHERE id = @postId`,
            { title, content, postId }
        );

        res.json({ message: '更新成功' });
    } catch (error) {
        console.error('更新帖子错误:', error);
        res.status(500).json({ error: '更新失败' });
    }
}

// 删除帖子
export async function deletePost(req: AuthRequest, res: Response) {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.userId;
        const userRole = req.userRole;

        const post = await executeQuery(
            'SELECT user_id FROM posts WHERE id = @postId',
            { postId }
        );

        if (post.recordset.length === 0) {
            return res.status(404).json({ error: '帖子不存在' });
        }

        if (post.recordset[0].user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: '没有权限删除此帖子' });
        }

        await executeQuery('DELETE FROM posts WHERE id = @postId', { postId });

        res.json({ message: '删除成功' });
    } catch (error) {
        console.error('删除帖子错误:', error);
        res.status(500).json({ error: '删除失败' });
    }
}

// 置顶帖子（管理员）
export async function pinPost(req: AuthRequest, res: Response) {
    try {
        const postId = parseInt(req.params.id);
        const { is_pinned } = req.body;

        await executeQuery(
            'UPDATE posts SET is_pinned = @is_pinned WHERE id = @postId',
            { is_pinned, postId }
        );

        res.json({ message: is_pinned ? '置顶成功' : '取消置顶成功' });
    } catch (error) {
        console.error('置顶操作错误:', error);
        res.status(500).json({ error: '操作失败' });
    }
}
// 点赞/取消点赞帖子
export async function toggleLikePost(req: AuthRequest, res: Response) {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.userId!;

        // 检查是否已点赞（需要先创建 post_likes 表）
        const existing = await executeQuery(
            'SELECT 1 FROM post_likes WHERE user_id = @userId AND post_id = @postId',
            { userId, postId }
        );

        if (existing.recordset.length > 0) {
            // 取消点赞
            await executeQuery(
                'DELETE FROM post_likes WHERE user_id = @userId AND post_id = @postId',
                { userId, postId }
            );
            await executeQuery(
                'UPDATE posts SET like_count = like_count - 1 WHERE id = @postId',
                { postId }
            );
            res.json({ message: '取消点赞', is_liked: false });
        } else {
            // 点赞
            await executeQuery(
                'INSERT INTO post_likes (user_id, post_id) VALUES (@userId, @postId)',
                { userId, postId }
            );
            await executeQuery(
                'UPDATE posts SET like_count = like_count + 1 WHERE id = @postId',
                { postId }
            );
            res.json({ message: '点赞成功', is_liked: true });
        }
    } catch (error) {
        console.error('点赞操作错误:', error);
        res.status(500).json({ error: '操作失败' });
    }
}