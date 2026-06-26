import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database';
import { jwtConfig } from '../config/jwt';

// 用户注册
export async function register(req: Request, res: Response) {
    try {
        const { username, email, password } = req.body;

        // 验证必填字段
        if (!username || !email || !password) {
            return res.status(400).json({ error: '请填写完整信息' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: '密码长度至少6位' });
        }

        // 检查用户是否已存在
        const existingUser = await executeQuery(
            'SELECT id FROM users WHERE username = @username OR email = @email',
            { username, email }
        );

        if (existingUser.recordset.length > 0) {
            return res.status(400).json({ error: '用户名或邮箱已存在' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户
        await executeQuery(
            `INSERT INTO users (username, email, password_hash) 
             VALUES (@username, @email, @password_hash)`,
            { username, email, password_hash: hashedPassword }
        );

        res.status(201).json({ message: '注册成功，请登录' });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '注册失败，请稍后重试' });
    }
}

// 用户登录
export async function login(req: Request, res: Response) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '请填写用户名和密码' });
        }

        // 查找用户
        const result = await executeQuery(
            'SELECT id, username, email, password_hash, role, avatar_url, signature FROM users WHERE username = @username OR email = @username',
            { username }
        );

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const user = result.recordset[0];

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 生成JWT - 修复：确保 expiresIn 是字符串类型
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn'] }
        );

        // 返回用户信息（不包含密码）
        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar_url: user.avatar_url,
                signature: user.signature
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '登录失败，请稍后重试' });
    }
}

// 获取当前用户信息
export async function getMe(req: any, res: Response) {
    try {
        const result = await executeQuery(
            'SELECT id, username, email, role, avatar_url, signature, created_at FROM users WHERE id = @userId',
            { userId: req.userId }
        );

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ error: '获取用户信息失败' });
    }
}