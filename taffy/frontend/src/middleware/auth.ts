import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '请先登录' });
    }

    try {
        const decoded = jwt.verify(token, jwtConfig.secret) as { userId: number; role: string };
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(403).json({ error: '登录已过期，请重新登录' });
    }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
}