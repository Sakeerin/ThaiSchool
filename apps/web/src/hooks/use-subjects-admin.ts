// Subjects React Query Hooks (Admin)

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsApi, Subject } from '@/lib/api/subjects';

export const SUBJECTS_QUERY_KEY = 'subjects';
export const SUBJECT_AREAS_KEY = 'subject-areas';
export const GRADE_LEVELS_KEY = 'grade-levels';

export function useSubjectsAdmin() {
    return useQuery({
        queryKey: [SUBJECTS_QUERY_KEY],
        queryFn: () => subjectsApi.getAll(),
    });
}

export function useSubject(id: string) {
    return useQuery({
        queryKey: [SUBJECTS_QUERY_KEY, id],
        queryFn: () => subjectsApi.getById(id),
        enabled: !!id,
    });
}

export function useSubjectAreas() {
    return useQuery({
        queryKey: [SUBJECT_AREAS_KEY],
        queryFn: () => subjectsApi.getAreas(),
    });
}

export function useGradeLevels() {
    return useQuery({
        queryKey: [GRADE_LEVELS_KEY],
        queryFn: () => subjectsApi.getGradeLevels(),
    });
}

export function useCreateSubject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: Parameters<typeof subjectsApi.create>[0]) => subjectsApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
        },
    });
}

export function useUpdateSubject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof subjectsApi.update>[1] }) => subjectsApi.update(id, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteSubject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => subjectsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
        },
    });
}
