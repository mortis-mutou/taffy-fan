import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { executeQuery } from '../config/database';

// 获取视频列表
export async function getVideos(req: AuthRequest, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 12;
        const offset = (page - 1) * pageSize;

        const [videosResult, countResult] = await Promise.all([
            executeQuery(
                `SELECT * FROM videos 
                 ORDER BY created_at DESC
                 OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
                { offset, pageSize }
            ),
            executeQuery('SELECT COUNT(*) AS total FROM videos')
        ]);

        // 获取当前用户的点赞状态
        let userLikes: Set<number> = new Set();
        if (req.userId) {
            const likesResult = await executeQuery(
                'SELECT video_id FROM user_video_likes WHERE user_id = @userId',
                { userId: req.userId }
            );
            userLikes = new Set(likesResult.recordset.map((r: any) => r.video_id));
        }

        const videos = videosResult.recordset.map((video: any) => ({
            ...video,
            is_liked: userLikes.has(video.id)
        }));

        res.json({
            data: videos,
            pagination: {
                page,
                pageSize,
                total: countResult.recordset[0].total,
                totalPages: Math.ceil(countResult.recordset[0].total / pageSize)
            }
        });
    } catch (error) {
        console.error('获取视频列表错误:', error);
        res.status(500).json({ error: '获取视频列表失败' });
    }
}

// 获取视频详情
export async function getVideoById(req: AuthRequest, res: Response) {
    try {
        const videoId = parseInt(req.params.id);

        // 增加观看次数
        await executeQuery(
            'UPDATE videos SET view_count = view_count + 1 WHERE id = @videoId',
            { videoId }
        );

        const result = await executeQuery(
            'SELECT * FROM videos WHERE id = @videoId',
            { videoId }
        );

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: '视频不存在' });
        }

        let isLiked = false;
        if (req.userId) {
            const likeResult = await executeQuery(
                'SELECT 1 FROM user_video_likes WHERE user_id = @userId AND video_id = @videoId',
                { userId: req.userId, videoId }
            );
            isLiked = likeResult.recordset.length > 0;
        }

        res.json({
            ...result.recordset[0],
            is_liked: isLiked
        });
    } catch (error) {
        console.error('获取视频详情错误:', error);
        res.status(500).json({ error: '获取视频详情失败' });
    }
}

// 点赞/取消点赞视频
export async function toggleLikeVideo(req: AuthRequest, res: Response) {
    try {
        const videoId = parseInt(req.params.id);
        const userId = req.userId!;

        // 检查是否已点赞
        const existing = await executeQuery(
            'SELECT 1 FROM user_video_likes WHERE user_id = @userId AND video_id = @videoId',
            { userId, videoId }
        );

        if (existing.recordset.length > 0) {
            // 取消点赞
            await executeQuery(
                'DELETE FROM user_video_likes WHERE user_id = @userId AND video_id = @videoId',
                { userId, videoId }
            );
            await executeQuery(
                'UPDATE videos SET like_count = like_count - 1 WHERE id = @videoId',
                { videoId }
            );
            res.json({ message: '取消点赞', is_liked: false });
        } else {
            // 点赞
            await executeQuery(
                'INSERT INTO user_video_likes (user_id, video_id) VALUES (@userId, @videoId)',
                { userId, videoId }
            );
            await executeQuery(
                'UPDATE videos SET like_count = like_count + 1 WHERE id = @videoId',
                { videoId }
            );
            res.json({ message: '点赞成功', is_liked: true });
        }
    } catch (error) {
        console.error('点赞操作错误:', error);
        res.status(500).json({ error: '操作失败' });
    }
}

// 获取热门视频（按点赞数排序）
export async function getPopularVideos(req: AuthRequest, res: Response) {
    try {
        const limit = parseInt(req.query.limit as string) || 6;
        
        const result = await executeQuery(
            `SELECT TOP (@limit) * FROM videos 
             ORDER BY like_count DESC, view_count DESC`,
            { limit }
        );

        res.json(result.recordset);
    } catch (error) {
        console.error('获取热门视频错误:', error);
        res.status(500).json({ error: '获取热门视频失败' });
    }
}