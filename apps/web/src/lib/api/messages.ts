// Messages API - Direct messaging between users

import api, { ApiResponse, QueryParams } from '../api';

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    attachments?: any[];
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    sender?: {
        id: string;
        email: string;
        role: string;
    };
    receiver?: {
        id: string;
        email: string;
        role: string;
    };
}

export interface Conversation {
    user: {
        id: string;
        email: string;
        role: string;
        displayName: string;
    };
    lastMessage: {
        content: string;
        createdAt: string;
        isRead: boolean;
        isSentByMe: boolean;
    } | null;
    unreadCount: number;
}

export interface MessageUser {
    id: string;
    email: string;
    role: string;
    displayName: string;
}

export interface SendMessageDto {
    receiverId: string;
    content: string;
    attachments?: string[];
}

export interface MessageQueryParams extends QueryParams {
    // Additional params if needed
}

// Messages API
export const messagesApi = {
    getConversations: async (): Promise<Conversation[]> => {
        const { data } = await api.get('/messages/conversations');
        return data;
    },

    getMessages: async (userId: string, params?: MessageQueryParams): Promise<ApiResponse<Message>> => {
        const { data } = await api.get(`/messages/${userId}`, { params });
        return data;
    },

    sendMessage: async (dto: SendMessageDto): Promise<Message> => {
        const { data } = await api.post('/messages', dto);
        return data;
    },

    markAsRead: async (id: string): Promise<Message> => {
        const { data } = await api.put(`/messages/${id}/read`);
        return data;
    },

    getUnreadCount: async (): Promise<{ count: number }> => {
        const { data } = await api.get('/messages/unread-count');
        return data;
    },

    searchUsers: async (query: string, role?: string): Promise<MessageUser[]> => {
        const params: any = { q: query };
        if (role) params.role = role;
        const { data } = await api.get('/messages/search-users', { params });
        return data;
    },
};

export default messagesApi;
