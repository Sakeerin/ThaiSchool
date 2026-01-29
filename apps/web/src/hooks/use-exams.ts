// Exams React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    examsApi,
    Exam,
    Question,
    QuestionBank,
    ExamAttempt,
    CreateExamDto,
    UpdateExamDto,
    CreateQuestionDto,
    CreateQuestionBankDto,
    AddExamQuestionDto,
    SubmitExamAnswerDto,
    ExamQueryParams,
} from '@/lib/api/exams';

export const EXAMS_QUERY_KEY = 'exams';
export const QUESTION_BANKS_QUERY_KEY = 'question-banks';
export const QUESTIONS_QUERY_KEY = 'questions';
export const EXAM_ATTEMPTS_QUERY_KEY = 'exam-attempts';

// =====================
// Exam Queries
// =====================

export function useExams(params?: ExamQueryParams) {
    return useQuery({
        queryKey: [EXAMS_QUERY_KEY, params],
        queryFn: () => examsApi.getAll(params),
    });
}

export function useExam(id: string) {
    return useQuery({
        queryKey: [EXAMS_QUERY_KEY, id],
        queryFn: () => examsApi.getById(id),
        enabled: !!id,
    });
}

// =====================
// Exam Mutations
// =====================

export function useCreateExam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateExamDto) => examsApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EXAMS_QUERY_KEY] });
        },
    });
}

export function useUpdateExam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateExamDto }) =>
            examsApi.update(id, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [EXAMS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [EXAMS_QUERY_KEY, variables.id] });
        },
    });
}

export function useDeleteExam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => examsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EXAMS_QUERY_KEY] });
        },
    });
}

export function usePublishExam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => examsApi.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: [EXAMS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [EXAMS_QUERY_KEY, id] });
        },
    });
}

export function useUnpublishExam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => examsApi.unpublish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: [EXAMS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [EXAMS_QUERY_KEY, id] });
        },
    });
}

// =====================
// Exam Question Mutations
// =====================

export function useAddExamQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ examId, dto }: { examId: string; dto: AddExamQuestionDto }) =>
            examsApi.addQuestion(examId, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [EXAMS_QUERY_KEY, variables.examId] });
        },
    });
}

export function useRemoveExamQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ examId, questionId }: { examId: string; questionId: string }) =>
            examsApi.removeQuestion(examId, questionId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [EXAMS_QUERY_KEY, variables.examId] });
        },
    });
}

// =====================
// Question Bank Queries & Mutations
// =====================

export function useQuestionBanks(subjectId: string) {
    return useQuery({
        queryKey: [QUESTION_BANKS_QUERY_KEY, subjectId],
        queryFn: () => examsApi.getQuestionBanks(subjectId),
        enabled: !!subjectId,
    });
}

export function useCreateQuestionBank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateQuestionBankDto) => examsApi.createQuestionBank(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUESTION_BANKS_QUERY_KEY, variables.subjectId] });
        },
    });
}

// =====================
// Question Queries & Mutations
// =====================

export function useQuestions(bankId: string) {
    return useQuery({
        queryKey: [QUESTIONS_QUERY_KEY, bankId],
        queryFn: () => examsApi.getQuestionsByBank(bankId),
        enabled: !!bankId,
    });
}

export function useCreateQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateQuestionDto) => examsApi.createQuestion(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUESTIONS_QUERY_KEY, variables.questionBankId] });
        },
    });
}

// =====================
// Exam Attempt Queries & Mutations
// =====================

export function useExamAttempt(attemptId: string) {
    return useQuery({
        queryKey: [EXAM_ATTEMPTS_QUERY_KEY, attemptId],
        queryFn: () => examsApi.getAttempt(attemptId),
        enabled: !!attemptId,
    });
}

export function useStudentAttempts(studentId: string) {
    return useQuery({
        queryKey: [EXAM_ATTEMPTS_QUERY_KEY, 'student', studentId],
        queryFn: () => examsApi.getStudentAttempts(studentId),
        enabled: !!studentId,
    });
}

export function useStartExamAttempt() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (examId: string) => examsApi.startAttempt(examId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EXAM_ATTEMPTS_QUERY_KEY] });
        },
    });
}

export function useSubmitAnswer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ attemptId, dto }: { attemptId: string; dto: SubmitExamAnswerDto }) =>
            examsApi.submitAnswer(attemptId, dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [EXAM_ATTEMPTS_QUERY_KEY, variables.attemptId] });
        },
    });
}

export function useSubmitExam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (attemptId: string) => examsApi.submitExam(attemptId),
        onSuccess: (_, attemptId) => {
            queryClient.invalidateQueries({ queryKey: [EXAM_ATTEMPTS_QUERY_KEY, attemptId] });
            queryClient.invalidateQueries({ queryKey: [EXAM_ATTEMPTS_QUERY_KEY] });
        },
    });
}
