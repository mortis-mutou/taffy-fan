import api from './client';

export interface Post {
    id: number;
    title: string;
    content: string;
    user_id: number;
    username: string;
    avatar_url: string;
    view_count: number;
    like_count: number;
    reply_count: number;
    is_pinned: boolean;
    created_at: string;
}

export const postAPI = {
    // 获取帖子列表
    getPosts: (page: number = 1, pageSize: number = 20, keyword?: string) => 
        api.get('/posts', { params: { page, pageSize, keyword } }),
    
    // 获取帖子详情
    getPostById: (id: number) => api.get(`/posts/${id}`),
    
    // 创建帖子
    createPost: (title: string, content: string) => api.post('/posts', { title, content }),
    
    // 删除帖子
    deletePost: (id: number) => api.delete(`/posts/${id}`),
    
    // ✅ 点赞/取消点赞帖子（新增）
        likePost: (id: number) => api.post(`/posts/${id}/like`),

        // ✅ 置顶/取消置顶帖子（管理员）
        pinPost: (id: number, isPinned: boolean) => api.patch(`/posts/${id}/pin`, { is_pinned: isPinned }),
    };