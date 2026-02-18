// Classrooms React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomsApi, CreateClassroomDto, UpdateClassroomDto, ClassroomQueryParams } from '@/lib/api/classrooms';

export const CLASSROOMS_QUERY_KEY = 'classrooms';

export function useClassrooms(params?: ClassroomQueryParams) {
    return useQuery({
        queryKey: [CLASSROOMS_QUERY_KEY, params],
        queryFn: () => classroomsApi.getAll(params),
    });
}

export function useClassroom(id: string) {
    return useQuery({
        queryKey: [CLASSROOMS_QUERY_KEY, id],
        queryFn: () => classroomsApi.getById(id),
        enabled: !!id,
    });
}

export function useClassroomsByAcademicYear(academicYearId: string) {
    return useQuery({
        queryKey: [CLASSROOMS_QUERY_KEY, 'academic-year', academicYearId],
        queryFn: () => classroomsApi.getByAcademicYear(academicYearId),
        enabled: !!academicYearId,
    });
}

export function useCreateClassroom() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateClassroomDto) => classroomsApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CLASSROOMS_QUERY_KEY] });
        },
    });
}

export function useUpdateClassroom() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateClassroomDto }) => classroomsApi.update(id, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [CLASSROOMS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [CLASSROOMS_QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteClassroom() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => classroomsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CLASSROOMS_QUERY_KEY] });
        },
    });
}
