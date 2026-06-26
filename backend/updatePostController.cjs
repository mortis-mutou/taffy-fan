require('dotenv').config();
const fs = require('fs');
const path = 'D:/taffy-fan-site/backend/src/controllers/postController.ts';
let c = fs.readFileSync(path, 'utf8');

// 1. 修改 getPosts - 添加 status 字段，非管理员只看已审核
c = c.replace(`let query = \`\n            SELECT \n                p.id, p.title, p.content, p.view_count, p.like_count, p.reply_count,\n                p.is_pinned, p.created_at, p.updated_at,\n                u.id AS user_id, u.username, u.avatar_url\n            FROM posts p\n            INNER JOIN users u ON p.user_id = u.id\n        \`;`, 
`let query = \`\n            SELECT \n                p.id, p.title, p.content, p.view_count, p.like_count, p.reply_count,\n                p.is_pinned, p.status, p.created_at, p.updated_at,\n                u.id AS user_id, u.username, u.avatar_url\n            FROM posts p\n            INNER JOIN users u ON p.user_id = u.id\n        \`;`);

c = c.replace(`let countQuery = 'SELECT COUNT(*) AS total FROM posts p';
        let params: any = {};

        if (keyword) {`, 
`let countQuery = 'SELECT COUNT(*) AS total FROM posts p';
        let params: any = {};
        let conditions: string[] = [];

        // 非管理员只能看到已审核或自己的帖子
        if (userRole !== 'admin') {
            conditions.push("(p.status = 'approved' OR p.user_id = @userId)");
            params.userId = userId || 0;
        }

        if (keyword) {`);

c = c.replace(`if (keyword) {
            query += WHERE p.title LIKE @keyword OR p.content LIKE @keyword;
            countQuery += WHERE p.title LIKE @keyword OR p.content LIKE @keyword;
            params.keyword = \`%\${keyword}%\`;
        }`, 
`if (keyword) {
            conditions.push("(p.title LIKE @keyword OR p.content LIKE @keyword)");
            params.keyword = \`%\${keyword}%\`;
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }`);

// 2. 修改 createPost 添加 status
c = c.replace("INSERT INTO posts (user_id, title, content) ", "INSERT INTO posts (user_id, title, content, status) ");
c = c.replace("VALUES (@userId, @title, @content);", "VALUES (@userId, @title, @content, 'pending');");
c = c.replace("message: '发布成功'", "message: '发布成功，等待管理员审核'");

// 3. 在 pinPost 后面添加 approvePost 和 getPendingPosts
c = c.replace(`
// 点赞/取消点赞帖子`, 
`
// 审核帖子
export async function approvePost(req: AuthRequest, res: Response) {
    try {
        const postId = parseInt(req.params.id);
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: '无效的状态值' });
        }

        await executeQuery(
            'UPDATE posts SET status = @status WHERE id = @postId',
            { status, postId }
        );

        res.json({ 
            message: status === 'approved' ? '审核通过' : '已拒绝',
            status 
        });
    } catch (error) {
        console.error('审核帖子错误:', error);
        res.status(500).json({ error: '操作失败' });
    }
}

// 获取待审核帖子
export async function getPendingPosts(req: AuthRequest, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const offset = (page - 1) * pageSize;

        const [postsResult, countResult] = await Promise.all([
            executeQuery(\`
                SELECT p.*, u.username, u.avatar_url
                FROM posts p
                INNER JOIN users u ON p.user_id = u.id
                WHERE p.status = 'pending'
                ORDER BY p.created_at DESC
                OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
            \`, { offset, pageSize }),
            executeQuery(\`SELECT COUNT(*) AS total FROM posts WHERE status = 'pending'\`)
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
        console.error('获取待审核帖子错误:', error);
        res.status(500).json({ error: '获取失败' });
    }
}

// 点赞/取消点赞帖子`);

fs.writeFileSync(path, c, 'utf8');
console.log('Updated postController.ts OK');