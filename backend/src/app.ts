import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// 路由导入
import { initDatabase } from './config/init';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import replyRoutes from './routes/replies';
import videoRoutes from './routes/videos';
import userRoutes from './routes/user';
import favoriteRoutes from './routes/favorites';
import notificationRoutes from './routes/notifications';
import messageRoutes from './routes/messages';
import followRoutes from './routes/follows';

dotenv.config();

// 启动时初始化数据库表
initDatabase();

const app = express();
const PORT = process.env.PORT || 3002;

// 安全中间件
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS配置
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// 日志中间件
app.use(morgan('dev'));

// 解析JSON - 增加大小限制
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 限流配置
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 200, // 放宽到200次请求
    message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 路由注册
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/user', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/follows', followRoutes);

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '永雏塔菲粉丝网站API运行中 🎀' });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ error: '接口不存在' });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || '好像出了点小问题... 塔菲在修复啦！'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 塔菲粉丝网站后端启动成功！`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
});

export default app;