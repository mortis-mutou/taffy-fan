import api from './client';

export const favoriteAPI = {
    toggleFavorite: (postId: number) => api.post(`/favorites/${postId}/favorite`),
    getMyFavorites: (page: number = 1) => api.get('/favorites', { params: { page } }),
    reportPost: (postId: number, reason: string) =>
        api.post(`/favorites/${postId}/report`, { reason }),
};