import api from './client';

export interface UserProfile {
    username: string;
    signature?: string;
    avatar_url?: string;
}

export interface PointInfo {
    user_id: number;
    username?: string;
    avatar_url?: string;
    signature?: string;
    points: number;
    level: number;
    signin_streak: number;
    post_count?: number;
    reply_count?: number;
}

export const userAPI = {
    updateProfile: (data: UserProfile) => api.put('/user/profile', data),
    changePassword: (oldPassword: string, newPassword: string) =>
        api.put('/user/password', { oldPassword, newPassword }),
    dailySignIn: () => api.post('/user/signin'),
    getPoints: () => api.get<PointInfo>('/user/points'),
    getLeaderboard: () => api.get('/user/leaderboard'),
    getDailyQuote: () => api.get('/user/daily-quote'),
};