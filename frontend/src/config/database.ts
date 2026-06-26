import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config();

const config: sql.config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'taffy_fan',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
    try {
        if (pool && pool.connected) {
            return pool;
        }
        console.log('🔌 正在连接数据库:', config.server);
        pool = await sql.connect(config);
        console.log('✅ MSSQL数据库连接成功');
        return pool;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error);
        throw error;
    }
}

export async function executeQuery(query: string, params: { [key: string]: any } = {}): Promise<any> {
    const pool = await getConnection();
    const request = pool.request();
    
    for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
    }
    
    const result = await request.query(query);
    return result;
}

export default { getConnection, executeQuery };