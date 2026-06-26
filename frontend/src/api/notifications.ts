import api from './client';

export const notificationAPI = {
    getNotifications: (page: number = 1) =>
        api.get('/notifications', { params: { page } }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (ids?: number[]) =>
        api.put('/notifications/read', { ids }),
};