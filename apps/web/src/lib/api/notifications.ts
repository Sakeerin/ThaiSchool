// Notifications API - Notifications and Announcements

import api, { ApiResponse, QueryParams } from '../api';

export interface UserNotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    link?: string;
    data?: any;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

export type NotificationType =
    | 'ASSIGNMENT_NEW'
    | 'ASSIGNMENT_DUE'
    | 'ASSIGNMENT_GRADED'
    | 'EXAM_UPCOMING'
    | 'EXAM_RESULT'
    | 'GRADE_UPDATED'
    | 'MESSAGE_NEW'
    | 'ANNOUNCEMENT'
    | 'SYSTEM';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    priority: Priority;
    targetRoles: string[];
    targetGradeLevels: string[];
    targetClassrooms: string[];
    attachments?: any[];
    isPublished: boolean;
    publishedAt?: string;
    expiresAt?: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}

export type AnnouncementType = 'GENERAL' | 'ACADEMIC' | 'ACTIVITY' | 'URGENT';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationQueryParams extends QueryParams {
    isRead?: boolean;
    type?: NotificationType;
}

export interface AnnouncementQueryParams extends QueryParams {
    type?: AnnouncementType;
}

export interface CreateAnnouncementDto {
    title: string;
    content: string;
    type: AnnouncementType;
    priority?: Priority;
    targetRoles?: string[];
    targetGradeLevels?: string[];
    targetClassrooms?: string[];
    attachments?: any[];
    isPublished?: boolean;
}

export interface UpdateAnnouncementDto {
    title?: string;
    content?: string;
    type?: AnnouncementType;
    priority?: Priority;
    isPublished?: boolean;
}

// Notifications API
export const notificationsApi = {
    // User Notifications
    getAll: async (params?: NotificationQueryParams): Promise<ApiResponse<UserNotification>> => {
        const { data } = await api.get('/notifications', { params });
        return data;
    },

    getUnreadCount: async (): Promise<{ count: number }> => {
        const { data } = await api.get('/notifications/unread-count');
        return data;
    },

    markAsRead: async (id: string): Promise<UserNotification> => {
        const { data } = await api.put(`/notifications/${id}/read`);
        return data;
    },

    markAllAsRead: async (): Promise<{ message: string }> => {
        const { data } = await api.put('/notifications/read-all');
        return data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const { data } = await api.delete(`/notifications/${id}`);
        return data;
    },

    // Announcements
    getAnnouncements: async (params?: AnnouncementQueryParams): Promise<ApiResponse<Announcement>> => {
        const { data } = await api.get('/notifications/announcements', { params });
        return data;
    },

    getAnnouncementById: async (id: string): Promise<Announcement> => {
        const { data } = await api.get(`/notifications/announcements/${id}`);
        return data;
    },

    createAnnouncement: async (dto: CreateAnnouncementDto): Promise<Announcement> => {
        const { data } = await api.post('/notifications/announcements', dto);
        return data;
    },

    updateAnnouncement: async (id: string, dto: UpdateAnnouncementDto): Promise<Announcement> => {
        const { data } = await api.put(`/notifications/announcements/${id}`, dto);
        return data;
    },

    deleteAnnouncement: async (id: string): Promise<{ message: string }> => {
        const { data } = await api.delete(`/notifications/announcements/${id}`);
        return data;
    },

    publishAnnouncement: async (id: string): Promise<Announcement> => {
        const { data } = await api.put(`/notifications/announcements/${id}/publish`);
        return data;
    },
};

export default notificationsApi;
