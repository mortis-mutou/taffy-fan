import api from './client';

export interface Reply {
    id: number;
    content: string;
    user_id: number;
    username: string;
    avatar_url: string;
    created_at: string;
}

export const replyAPI = {
    getReplies: (postId: number, page: number = 1) => 
        api.get(`/replies/post/${postId}`, { params: { page } }),
    createReply: (postId: number, content: string) => 
        api.post('/replies', { postId, content }),
    deleteReply: (id: number) => api.delete(`/replies/${id}`),  // ✅ 必须有这一行
};