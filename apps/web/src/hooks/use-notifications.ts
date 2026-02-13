// Notifications React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    notificationsApi,
    UserNotification,
    Announcement,
    NotificationQueryParams,
    AnnouncementQueryParams,
    CreateAnnouncementDto,
    UpdateAnnouncementDto,
} from '@/lib/api/notifications';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';
export const ANNOUNCEMENTS_QUERY_KEY = 'announcements';

// Notification Queries
export function useNotifications(params?: NotificationQueryParams) {
    return useQuery({
        queryKey: [NOTIFICATIONS_QUERY_KEY, params],
        queryFn: () => notificationsApi.getAll(params),
    });
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: [NOTIFICATIONS_QUERY_KEY, 'unread-count'],
        queryFn: () => notificationsApi.getUnreadCount(),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

// Notification Mutations
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationsApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
        },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
        },
    });
}

// Announcement Queries
export function useAnnouncements(params?: AnnouncementQueryParams) {
    return useQuery({
        queryKey: [ANNOUNCEMENTS_QUERY_KEY, params],
        queryFn: () => notificationsApi.getAnnouncements(params),
    });
}

export function useAnnouncement(id: string) {
    return useQuery({
        queryKey: [ANNOUNCEMENTS_QUERY_KEY, id],
        queryFn: () => notificationsApi.getAnnouncementById(id),
        enabled: !!id,
    });
}

// Announcement Mutations
export function useCreateAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateAnnouncementDto) => notificationsApi.createAnnouncement(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
        },
    });
}

export function useUpdateAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateAnnouncementDto }) =>
            notificationsApi.updateAnnouncement(id, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationsApi.deleteAnnouncement(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
        },
    });
}

export function usePublishAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationsApi.publishAnnouncement(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY, id] });
        },
    });
}
