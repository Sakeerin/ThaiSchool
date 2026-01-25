// Users React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, User, CreateUserDto, UpdateUserDto, UserQueryParams } from '@/lib/api/users';

export const USERS_QUERY_KEY = 'users';

export function useUsers(params?: UserQueryParams) {
    return useQuery({
        queryKey: [USERS_QUERY_KEY, params],
        queryFn: () => usersApi.getAll(params),
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: [USERS_QUERY_KEY, id],
        queryFn: () => usersApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateUserDto) => usersApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) => usersApi.update(id, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => usersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
        },
    });
}
