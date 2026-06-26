import api from './client';

export interface Video {
    id: number;
    title: string;
    description: string;
    video_url: string;
    cover_url: string;
    like_count: number;
    view_count: number;
    is_liked?: boolean;
}

export const videoAPI = {
    getVideos: (page: number = 1) => api.get('/videos', { params: { page } }),
    getVideoById: (id: number) => api.get(`/videos/${id}`),
    likeVideo: (id: number) => api.post(`/videos/${id}/like`),
};