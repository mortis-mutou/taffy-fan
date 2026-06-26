import { create } from 'zustand';
import { authAPI, User } from '../api/auth';

interface UserState {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (username: string, password: string, captchaToken?: string) => Promise<void>;
        register: (username: string, email: string, password: string, captchaToken?: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,

    login: async (username, password, captchaToken) => {
            set({ loading: true });
            try {
                const res = await authAPI.login(username, password, captchaToken);
            localStorage.setItem('token', res.data.token);
            set({ user: res.data.user, token: res.data.token, loading: false });
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    register: async (username, email, password, captchaToken) => {
            set({ loading: true });
            try {
                await authAPI.register(username, email, password, captchaToken);
            set({ loading: false });
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
        window.location.href = '/';
    },

    fetchUser: async () => {
        const token = get().token;
        if (!token) return;
        try {
            const res = await authAPI.getMe();
            set({ user: res.data });
        } catch (error) {
            console.error('获取用户失败', error);
        }
    },
}));