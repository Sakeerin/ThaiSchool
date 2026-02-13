// Messages React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    messagesApi,
    Message,
    Conversation,
    SendMessageDto,
    MessageQueryParams,
} from '@/lib/api/messages';

export const MESSAGES_QUERY_KEY = 'messages';
export const CONVERSATIONS_QUERY_KEY = 'conversations';

// Query Hooks
export function useConversations() {
    return useQuery({
        queryKey: [CONVERSATIONS_QUERY_KEY],
        queryFn: () => messagesApi.getConversations(),
    });
}

export function useMessages(userId: string, params?: MessageQueryParams) {
    return useQuery({
        queryKey: [MESSAGES_QUERY_KEY, userId, params],
        queryFn: () => messagesApi.getMessages(userId, params),
        enabled: !!userId,
        refetchInterval: 5000, // Poll for new messages every 5 seconds
    });
}

export function useUnreadMessageCount() {
    return useQuery({
        queryKey: [MESSAGES_QUERY_KEY, 'unread-count'],
        queryFn: () => messagesApi.getUnreadCount(),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

export function useSearchMessageUsers(query: string, role?: string) {
    return useQuery({
        queryKey: [MESSAGES_QUERY_KEY, 'search-users', query, role],
        queryFn: () => messagesApi.searchUsers(query, role),
        enabled: query.length >= 2, // Only search when query is at least 2 characters
    });
}

// Mutation Hooks
export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: SendMessageDto) => messagesApi.sendMessage(dto),
        onSuccess: (message) => {
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [MESSAGES_QUERY_KEY, message.receiverId] });
        },
    });
}

export function useMarkMessageAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => messagesApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [MESSAGES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
        },
    });
}
