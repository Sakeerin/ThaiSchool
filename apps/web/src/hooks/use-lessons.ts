// Lessons React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    lessonsApi,
    Lesson,
    LessonContent,
    CreateLessonDto,
    UpdateLessonDto,
    CreateLessonContentDto,
    UpdateLessonContentDto,
    LessonQueryParams,
} from '@/lib/api/lessons';

export const LESSONS_QUERY_KEY = 'lessons';

// Lesson queries
export function useLessons(params?: LessonQueryParams) {
    return useQuery({
        queryKey: [LESSONS_QUERY_KEY, params],
        queryFn: () => lessonsApi.getAll(params),
    });
}

export function useLesson(id: string) {
    return useQuery({
        queryKey: [LESSONS_QUERY_KEY, id],
        queryFn: () => lessonsApi.getById(id),
        enabled: !!id,
    });
}

export function useLessonsBySubjectInstance(subjectInstanceId: string) {
    return useQuery({
        queryKey: [LESSONS_QUERY_KEY, 'subject-instance', subjectInstanceId],
        queryFn: () => lessonsApi.getBySubjectInstance(subjectInstanceId),
        enabled: !!subjectInstanceId,
    });
}

export function useTeacherLessons() {
    return useQuery({
        queryKey: [LESSONS_QUERY_KEY, 'teacher'],
        queryFn: () => lessonsApi.getTeacherLessons(),
    });
}

export function useTeacherSubjects() {
    return useQuery({
        queryKey: [LESSONS_QUERY_KEY, 'teacher-subjects'],
        queryFn: () => lessonsApi.getTeacherSubjects(),
    });
}

export function useStudentLessons() {
    return useQuery({
        queryKey: [LESSONS_QUERY_KEY, 'student'],
        queryFn: () => lessonsApi.getStudentLessons(),
    });
}

// Lesson mutations
export function useCreateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateLessonDto) => lessonsApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY] });
        },
    });
}

export function useUpdateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateLessonDto }) =>
            lessonsApi.update(id, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => lessonsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY] });
        },
    });
}

export function usePublishLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => lessonsApi.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY, id] });
        },
    });
}

export function useUnpublishLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => lessonsApi.unpublish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY, id] });
        },
    });
}

// Content mutations
export function useAddContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateLessonContentDto) => lessonsApi.addContent(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY, variables.lessonId] });
        },
    });
}

export function useUpdateContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contentId, dto, lessonId }: { contentId: string; dto: UpdateLessonContentDto; lessonId: string }) =>
            lessonsApi.updateContent(contentId, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY, variables.lessonId] });
        },
    });
}

export function useDeleteContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contentId, lessonId }: { contentId: string; lessonId: string }) =>
            lessonsApi.deleteContent(contentId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY, variables.lessonId] });
        },
    });
}

export function useReorderContents() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, contentIds }: { lessonId: string; contentIds: string[] }) =>
            lessonsApi.reorderContents(lessonId, contentIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [LESSONS_QUERY_KEY, variables.lessonId] });
        },
    });
}
