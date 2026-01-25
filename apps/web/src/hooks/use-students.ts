// Students React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi, Student, CreateStudentDto, UpdateStudentDto, StudentQueryParams } from '@/lib/api/students';

export const STUDENTS_QUERY_KEY = 'students';

export function useStudents(params?: StudentQueryParams) {
    return useQuery({
        queryKey: [STUDENTS_QUERY_KEY, params],
        queryFn: () => studentsApi.getAll(params),
    });
}

export function useStudent(id: string) {
    return useQuery({
        queryKey: [STUDENTS_QUERY_KEY, id],
        queryFn: () => studentsApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateStudentDto) => studentsApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });
        },
    });
}

export function useUpdateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentDto }) => studentsApi.update(id, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => studentsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });
        },
    });
}

export function useStudentsByClassroom(classroomId: string) {
    return useQuery({
        queryKey: [STUDENTS_QUERY_KEY, 'classroom', classroomId],
        queryFn: () => studentsApi.getByClassroom(classroomId),
        enabled: !!classroomId,
    });
}
