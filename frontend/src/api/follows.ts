import api from './client';

export const followAPI = {
    toggleFollow: (userId: number) => api.post(`/follows/${userId}/follow`),
    checkFollow: (userId: number) => api.get(`/follows/${userId}/check`),
    getFollowing: (userId?: number) => api.get(`/follows/${userId || 'me'}/following`),
    getFollowers: (userId?: number) => api.get(`/follows/${userId || 'me'}/followers`),
};