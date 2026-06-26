import api from './client';

export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    other_user_id: number;
    username: string;
    avatar_url: string;
    last_message: string;
    last_message_time: string;
    is_read: boolean;
    unread_count: number;
}

export const messageAPI = {
    getConversations: () => api.get<Conversation[]>('/messages/conversations'),
    getMessages: (userId: number) => api.get<Message[]>(`/messages/${userId}`),
    sendMessage: (receiverId: number, content: string) =>
        api.post('/messages', { receiverId, content }),
};