import api from './client';

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    avatar_url: string;
    signature: string;
}

export const authAPI = {
    login: (username: string, password: string, captchaToken?: string) => 
            api.post<{ token: string; user: User }>('/auth/login', { username, password, captchaToken }),
    register: (username: string, email: string, password: string, captchaToken?: string) => 
            api.post('/auth/register', { username, email, password, captchaToken }),
    getMe: () => api.get<User>('/auth/me'),
};