import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { executeQuery } from '../config/database';

// 获取用户通知
export async function getNotifications(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const offset = (page - 1) * pageSize;

        // 确保通知表存在
        await ensureNotificationsTable();

        const [result, countResult] = await Promise.all([
            executeQuery(
                `SELECT * FROM notifications 
                 WHERE user_id = @userId
                 ORDER BY created_at DESC
                 OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
                { userId, offset, pageSize }
            ),
            executeQuery(
                'SELECT COUNT(*) AS total FROM notifications WHERE user_id = @userId',
                { userId }
            )
        ]);

        res.json({
            data: result.recordset,
            pagination: {
                page, pageSize,
                total: countResult.recordset[0].total,
                totalPages: Math.ceil(countResult.recordset[0].total / pageSize)
            }
        });
    } catch (error) {
        console.error('获取通知错误:', error);
        res.status(500).json({ error: '获取失败' });
    }
}

// 获取未读通知数
export async function getUnreadCount(req: AuthRequest, res: Response) {
    try {
        await ensureNotificationsTable();
        const result = await executeQuery(
            'SELECT COUNT(*) AS count FROM notifications WHERE user_id = @userId AND is_read = 0',
            { userId: req.userId }
        );
        res.json({ count: result.recordset[0].count });
    } catch (error) {
        console.error('获取未读数错误:', error);
        res.status(500).json({ error: '获取失败' });
    }
}

// 标记通知已读
export async function markAsRead(req: AuthRequest, res: Response) {
    try {
        const { ids } = req.body;
        const userId = req.userId!;

        await ensureNotificationsTable();

        if (ids && Array.isArray(ids) && ids.length > 0) {
            // 使用参数化查询替代字符串拼接，防止 SQL 注入
            // 为每个 id 创建一个参数
            const conditions = ids.map((_, index) => `@id${index}`).join(',');
            const params: any = { userId };
            ids.forEach((id, index) => {
                params[`id${index}`] = id;
            });

            await executeQuery(
                `UPDATE notifications SET is_read = 1 
                 WHERE id IN (${conditions}) AND user_id = @userId`,
                params
            );
        } else {
            await executeQuery(
                'UPDATE notifications SET is_read = 1 WHERE user_id = @userId',
                { userId }
            );
        }

        res.json({ message: '已标记为已读' });
    } catch (error) {
        console.error('标记已读错误:', error);
        res.status(500).json({ error: '操作失败' });
    }
}

// 确保通知表存在
async function ensureNotificationsTable() {
    try {
        await executeQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'notifications')
            BEGIN
                CREATE TABLE notifications (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    type NVARCHAR(50) NOT NULL,
                    content NVARCHAR(MAX) NOT NULL,
                    related_id INT NULL,
                    is_read BIT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
                );
            END
        `);
    } catch (error) {
        console.error('确保通知表存在时出错:', error);
    }
}
