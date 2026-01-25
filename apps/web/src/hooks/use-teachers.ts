// Teachers React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersApi, Teacher, CreateTeacherDto, UpdateTeacherDto, TeacherQueryParams } from '@/lib/api/teachers';

export const TEACHERS_QUERY_KEY = 'teachers';

export function useTeachers(params?: TeacherQueryParams) {
    return useQuery({
        queryKey: [TEACHERS_QUERY_KEY, params],
        queryFn: () => teachersApi.getAll(params),
    });
}

export function useTeacher(id: string) {
    return useQuery({
        queryKey: [TEACHERS_QUERY_KEY, id],
        queryFn: () => teachersApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateTeacher() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateTeacherDto) => teachersApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TEACHERS_QUERY_KEY] });
        },
    });
}

export function useUpdateTeacher() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateTeacherDto }) => teachersApi.update(id, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [TEACHERS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [TEACHERS_QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteTeacher() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => teachersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TEACHERS_QUERY_KEY] });
        },
    });
}
