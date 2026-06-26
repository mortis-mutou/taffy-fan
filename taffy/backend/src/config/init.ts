import { executeQuery, getConnection } from './database';

// 初始化数据库表
// 在应用启动时调用，确保所有数据表已创建

export async function initDatabase() {
    try {
        await getConnection();
        console.log('🔄 检查数据库表...');

        // 创建私信表 (如果不存在)
        await executeQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'messages')
            BEGIN
                CREATE TABLE messages (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    sender_id INT NOT NULL,
                    receiver_id INT NOT NULL,
                    content NVARCHAR(MAX) NOT NULL,
                    is_read BIT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id),
                    CONSTRAINT FK_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id)
                );
                PRINT '✅ 已创建 messages 表';
            END
            ELSE
            BEGIN
                PRINT '✅ messages 表已存在';
            END
        `);

        console.log('✅ 数据库初始化完成');
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
    }
}