import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { executeQuery } from '../config/database';

// 获取私信列表（最近联系的人）
export async function getConversations(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;

        const result = await executeQuery(
            `SELECT 
                CASE WHEN sender_id = @userId THEN receiver_id ELSE sender_id END as other_user_id,
                u.username, u.avatar_url,
                m.content as last_message,
                m.created_at as last_message_time,
                m.is_read,
                (SELECT COUNT(*) FROM messages 
                 WHERE receiver_id = @userId AND sender_id = CASE WHEN sender_id = @userId THEN receiver_id ELSE sender_id END AND is_read = 0) as unread_count
             FROM messages m
             INNER JOIN users u ON u.id = CASE WHEN m.sender_id = @userId THEN m.receiver_id ELSE m.sender_id END
             WHERE m.id IN (
                 SELECT MAX(id) FROM messages 
                 WHERE sender_id = @userId OR receiver_id = @userId
                 GROUP BY CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END,
                          CASE WHEN sender_id < receiver_id THEN receiver_id ELSE sender_id END
             )
             ORDER BY m.created_at DESC`,
            { userId }
        );

        res.json(result.recordset);
    } catch (error) {
        console.error('获取私信列表错误:', error);
        res.status(500).json({ error: '获取失败' });
    }
}

// 获取与某人的私信
export async function getMessages(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;
        const otherUserId = parseInt(req.params.userId);
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 50;
        const offset = (page - 1) * pageSize;

        // 标记已读
        await executeQuery(
            'UPDATE messages SET is_read = 1 WHERE sender_id = @otherUserId AND receiver_id = @userId',
            { userId, otherUserId }
        );

        const result = await executeQuery(
            `SELECT * FROM messages 
             WHERE (sender_id = @userId AND receiver_id = @otherUserId)
                OR (sender_id = @otherUserId AND receiver_id = @userId)
             ORDER BY created_at DESC
             OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
            { userId, otherUserId, offset, pageSize }
        );

        res.json(result.recordset.reverse());
    } catch (error) {
        console.error('获取私信错误:', error);
        res.status(500).json({ error: '获取失败' });
    }
}

// 发送私信
export async function sendMessage(req: AuthRequest, res: Response) {
    try {
        const senderId = req.userId!;
        const { receiverId, content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: '消息内容不能为空' });
        }

        const result = await executeQuery(
            `INSERT INTO messages (sender_id, receiver_id, content)
             VALUES (@senderId, @receiverId, @content);
             SELECT * FROM messages WHERE id = SCOPE_IDENTITY();`,
            { senderId, receiverId, content }
        );

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('发送私信错误:', error);
        res.status(500).json({ error: '发送失败' });
    }
}