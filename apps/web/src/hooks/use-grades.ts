// Grades React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    gradesApi,
    Grade,
    GPAResult,
    GPAXResult,
    ReportCardData,
    TranscriptData,
    CreateGradeDto,
    UpdateGradeDto,
    BulkGradeDto,
} from '@/lib/api/grades';

export const GRADES_QUERY_KEY = 'grades';
export const GPA_QUERY_KEY = 'gpa';
export const GPAX_QUERY_KEY = 'gpax';
export const REPORT_CARD_QUERY_KEY = 'report-card';
export const TRANSCRIPT_QUERY_KEY = 'transcript';

// =====================
// Grade Queries
// =====================

export function useStudentGrades(studentId: string, semesterId?: string) {
    return useQuery({
        queryKey: [GRADES_QUERY_KEY, 'student', studentId, semesterId],
        queryFn: () => gradesApi.getByStudent(studentId, semesterId),
        enabled: !!studentId,
    });
}

export function useSubjectInstanceGrades(subjectInstanceId: string) {
    return useQuery({
        queryKey: [GRADES_QUERY_KEY, 'subject-instance', subjectInstanceId],
        queryFn: () => gradesApi.getBySubjectInstance(subjectInstanceId),
        enabled: !!subjectInstanceId,
    });
}

export function useClassroomGrades(classroomId: string, semesterId: string) {
    return useQuery({
        queryKey: [GRADES_QUERY_KEY, 'classroom', classroomId, semesterId],
        queryFn: () => gradesApi.getByClassroom(classroomId, semesterId),
        enabled: !!classroomId && !!semesterId,
    });
}

// =====================
// GPA Queries
// =====================

export function useStudentGPA(studentId: string, semesterId: string) {
    return useQuery({
        queryKey: [GPA_QUERY_KEY, studentId, semesterId],
        queryFn: () => gradesApi.calculateGPA(studentId, semesterId),
        enabled: !!studentId && !!semesterId,
    });
}

export function useStudentGPAX(studentId: string) {
    return useQuery({
        queryKey: [GPAX_QUERY_KEY, studentId],
        queryFn: () => gradesApi.calculateGPAX(studentId),
        enabled: !!studentId,
    });
}

// =====================
// Report Queries
// =====================

export function useReportCard(studentId: string, semesterId: string) {
    return useQuery({
        queryKey: [REPORT_CARD_QUERY_KEY, studentId, semesterId],
        queryFn: () => gradesApi.getReportCard(studentId, semesterId),
        enabled: !!studentId && !!semesterId,
    });
}

export function useTranscript(studentId: string) {
    return useQuery({
        queryKey: [TRANSCRIPT_QUERY_KEY, studentId],
        queryFn: () => gradesApi.getTranscript(studentId),
        enabled: !!studentId,
    });
}

// =====================
// Grade Mutations
// =====================

export function useCreateGrade() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateGradeDto) => gradesApi.create(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [GRADES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GPA_QUERY_KEY, variables.studentId] });
            queryClient.invalidateQueries({ queryKey: [GPAX_QUERY_KEY, variables.studentId] });
        },
    });
}

export function useUpdateGrade() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateGradeDto }) =>
            gradesApi.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GRADES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GPA_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GPAX_QUERY_KEY] });
        },
    });
}

export function useBulkGrades() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: BulkGradeDto) => gradesApi.bulkCreateOrUpdate(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [GRADES_QUERY_KEY, 'subject-instance', variables.subjectInstanceId],
            });
            queryClient.invalidateQueries({ queryKey: [GRADES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GPA_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GPAX_QUERY_KEY] });
        },
    });
}
