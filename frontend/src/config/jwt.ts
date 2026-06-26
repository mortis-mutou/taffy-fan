import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'taffy_is_cute_default_secret_key_2025',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
    refreshExpiresIn: '30d'
};

export default jwtConfig;