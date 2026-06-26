import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { executeQuery } from '../config/database';

// 更新用户资料
export async function updateProfile(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;
        const { username, signature, avatar_url } = req.body;

        await executeQuery(
            `UPDATE users SET 
                username = COALESCE(@username, username),
                signature = COALESCE(@signature, signature),
                avatar_url = COALESCE(@avatar_url, avatar_url)
             WHERE id = @userId`,
            { userId, username, signature, avatar_url }
        );

        const result = await executeQuery(
            'SELECT id, username, email, role, avatar_url, signature, created_at FROM users WHERE id = @userId',
            { userId }
        );

        res.json({ message: '更新成功', user: result.recordset[0] });
    } catch (error) {
        console.error('更新资料错误:', error);
        res.status(500).json({ error: '更新失败' });
    }
}

// 修改密码
export async function changePassword(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;
        const { oldPassword, newPassword } = req.body;

        const result = await executeQuery(
            'SELECT password_hash FROM users WHERE id = @userId',
            { userId }
        );

        const isValid = await bcrypt.compare(oldPassword, result.recordset[0].password_hash);
        if (!isValid) {
            return res.status(400).json({ error: '原密码错误' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await executeQuery(
            'UPDATE users SET password_hash = @password WHERE id = @userId',
            { userId, password: hashedPassword }
        );

        res.json({ message: '密码修改成功' });
    } catch (error) {
        console.error('修改密码错误:', error);
        res.status(500).json({ error: '修改失败' });
    }
}

// 每日签到
export async function dailySignIn(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;

        const existing = await executeQuery(
            'SELECT daily_signin_date FROM user_points WHERE user_id = @userId',
            { userId }
        );

        const today = new Date().toISOString().split('T')[0];

        if (existing.recordset.length > 0 && existing.recordset[0].daily_signin_date?.toISOString().split('T')[0] === today) {
            return res.status(400).json({ error: '今天已经签到过了哦~' });
        }

        if (existing.recordset.length > 0) {
            const lastDate = existing.recordset[0].daily_signin_date;
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const streak = lastDate?.toISOString().split('T')[0] === yesterday 
                ? 'signin_streak + 1' 
                : '1';

            await executeQuery(
                `UPDATE user_points SET 
                    points = points + 10,
                    daily_signin_date = GETDATE(),
                    signin_streak = ${streak},
                    level = CASE 
                        WHEN points + 10 >= 1000 THEN 5
                        WHEN points + 10 >= 500 THEN 4
                        WHEN points + 10 >= 200 THEN 3
                        WHEN points + 10 >= 50 THEN 2
                        ELSE 1
                    END
                 WHERE user_id = @userId`,
                { userId }
            );
        } else {
            await executeQuery(
                `INSERT INTO user_points (user_id, points, level, daily_signin_date, signin_streak)
                 VALUES (@userId, 10, 1, GETDATE(), 1)`,
                { userId }
            );
        }

        const points = await executeQuery(
            'SELECT points, level, signin_streak FROM user_points WHERE user_id = @userId',
            { userId }
        );

        res.json({
            message: '签到成功！获得10积分',
            ...points.recordset[0]
        });
    } catch (error) {
        console.error('签到错误:', error);
        res.status(500).json({ error: '签到失败' });
    }
}

// 获取用户积分信息
export async function getUserPoints(req: AuthRequest, res: Response) {
    try {
        const userId = parseInt(req.params.id) || req.userId!;
        const result = await executeQuery(
            `SELECT up.*, u.username, u.avatar_url, u.signature,
                (SELECT COUNT(*) FROM posts WHERE user_id = @userId) as post_count,
                (SELECT COUNT(*) FROM replies WHERE user_id = @userId) as reply_count
             FROM user_points up
             INNER JOIN users u ON u.id = up.user_id
             WHERE up.user_id = @userId`,
            { userId }
        );

        if (result.recordset.length === 0) {
            return res.json({
                user_id: userId,
                points: 0,
                level: 1,
                signin_streak: 0,
                post_count: 0,
                reply_count: 0
            });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('获取积分错误:', error);
        res.status(500).json({ error: '获取失败' });
    }
}

// 获取粉丝排行榜
export async function getLeaderboard(req: AuthRequest, res: Response) {
    try {
        const result = await executeQuery(
            `SELECT TOP 20
                u.id, u.username, u.avatar_url,
                COALESCE(up.points, 0) as points,
                COALESCE(up.level, 1) as level,
                (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count,
                (SELECT SUM(like_count) FROM posts WHERE user_id = u.id) as total_likes
             FROM users u
             LEFT JOIN user_points up ON u.id = up.user_id
             ORDER BY points DESC, post_count DESC`
        );

        res.json(result.recordset);
    } catch (error) {
        console.error('获取排行榜错误:', error);
        res.status(500).json({ error: '获取失败' });
    }
}

// 获取每日一句
export async function getDailyQuote(req: AuthRequest, res: Response) {
    const quotes = [
        { text: '塔菲今天也很可爱呢~', author: '永雏塔菲' },
        { text: '用❤️发电，为塔菲打Call！', author: '粉丝社区' },
        { text: '今天也是充满塔菲能量的一天！', author: '粉丝社区' },
        { text: '塔菲的笑容由我们来守护！', author: '粉丝社区' },
        { text: '只要心中有塔菲，哪里都是舞台~', author: '粉丝社区' },
        { text: '塔菲酱，最喜欢你了！', author: '粉丝社区' },
        { text: '每一个塔菲的瞬间都值得珍藏~', author: '粉丝社区' },
        { text: '愿你今天也充满笑容，塔菲会一直陪着你~', author: '永雏塔菲' },
    ];
    
    const today = new Date().getDate();
    const quote = quotes[today % quotes.length];
    
    res.json(quote);
}