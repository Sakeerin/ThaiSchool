// Assignments React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    assignmentsApi,
    Assignment,
    Submission,
    CreateAssignmentDto,
    UpdateAssignmentDto,
    SubmitAssignmentDto,
    GradeSubmissionDto,
    AssignmentQueryParams,
} from '@/lib/api/assignments';

export const ASSIGNMENTS_QUERY_KEY = 'assignments';

// Assignment queries
export function useAssignments(params?: AssignmentQueryParams) {
    return useQuery({
        queryKey: [ASSIGNMENTS_QUERY_KEY, params],
        queryFn: () => assignmentsApi.getAll(params),
    });
}

export function useAssignment(id: string) {
    return useQuery({
        queryKey: [ASSIGNMENTS_QUERY_KEY, id],
        queryFn: () => assignmentsApi.getById(id),
        enabled: !!id,
    });
}

export function useAssignmentsBySubjectInstance(subjectInstanceId: string) {
    return useQuery({
        queryKey: [ASSIGNMENTS_QUERY_KEY, 'subject-instance', subjectInstanceId],
        queryFn: () => assignmentsApi.getBySubjectInstance(subjectInstanceId),
        enabled: !!subjectInstanceId,
    });
}

export function useTeacherAssignments() {
    return useQuery({
        queryKey: [ASSIGNMENTS_QUERY_KEY, 'teacher'],
        queryFn: () => assignmentsApi.getTeacherAssignments(),
    });
}

export function useTeacherSubjects() {
    return useQuery({
        queryKey: [ASSIGNMENTS_QUERY_KEY, 'teacher-subjects'],
        queryFn: () => assignmentsApi.getTeacherSubjects(),
    });
}

export function useStudentAssignments() {
    return useQuery({
        queryKey: [ASSIGNMENTS_QUERY_KEY, 'student'],
        queryFn: () => assignmentsApi.getStudentAssignments(),
    });
}

export function useStudentSubmissions() {
    return useQuery({
        queryKey: [ASSIGNMENTS_QUERY_KEY, 'student-submissions'],
        queryFn: () => assignmentsApi.getStudentSubmissions(),
    });
}

// Assignment mutations
export function useCreateAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateAssignmentDto) => assignmentsApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY] });
        },
    });
}

export function useUpdateAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateAssignmentDto }) =>
            assignmentsApi.update(id, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => assignmentsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY] });
        },
    });
}

export function usePublishAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => assignmentsApi.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY, id] });
        },
    });
}

export function useUnpublishAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => assignmentsApi.unpublish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY, id] });
        },
    });
}

// Submission mutations
export function useSubmitAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ assignmentId, dto }: { assignmentId: string; dto: SubmitAssignmentDto }) =>
            assignmentsApi.submit(assignmentId, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY, variables.assignmentId] });
        },
    });
}

export function useGradeSubmission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ submissionId, dto, assignmentId }: { submissionId: string; dto: GradeSubmissionDto; assignmentId: string }) =>
            assignmentsApi.gradeSubmission(submissionId, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY, variables.assignmentId] });
        },
    });
}

export function useReturnSubmission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ submissionId, feedback, assignmentId }: { submissionId: string; feedback: string; assignmentId: string }) =>
            assignmentsApi.returnSubmission(submissionId, feedback),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [ASSIGNMENTS_QUERY_KEY, variables.assignmentId] });
        },
    });
}
