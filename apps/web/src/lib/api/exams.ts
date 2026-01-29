// Exams API - CRUD operations for exams, questions, question banks, and attempts

import api, { ApiResponse, QueryParams } from '../api';

// Enums
export type ExamType = 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PRACTICE';
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'SHORT_ANSWER' | 'ESSAY' | 'MATCHING';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ExamAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';

// Interfaces
export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    questionBankId: string;
    type: QuestionType;
    content: string;
    explanation?: string;
    options?: QuestionOption[];
    matchingPairs?: { left: string; right: string }[];
    correctAnswer?: string;
    acceptedAnswers?: string[];
    difficulty: Difficulty;
    points: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface QuestionBank {
    id: string;
    subjectId: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    subject?: {
        id: string;
        code: string;
        nameTh: string;
        nameEn?: string;
    };
    _count?: {
        questions: number;
    };
}

export interface ExamQuestion {
    id: string;
    examId: string;
    questionId: string;
    order: number;
    points: number;
    question?: Question;
}

export interface Exam {
    id: string;
    subjectInstanceId: string;
    title: string;
    description?: string;
    instructions?: string;
    type: ExamType;
    maxScore: number;
    passingScore?: number;
    startTime: string;
    endTime: string;
    duration: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResult: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    maxAttempts: number;
    preventTabSwitch: boolean;
    requireCamera: boolean;
    createdById: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    subjectInstance?: {
        id: string;
        subject: {
            id: string;
            code: string;
            nameTh: string;
            nameEn?: string;
            subjectArea?: {
                id: string;
                code: string;
                nameTh: string;
                color?: string;
            };
        };
        semester?: {
            id: string;
            number: number;
            name: string;
            academicYear?: {
                id: string;
                year: number;
                name: string;
            };
        };
    };
    createdBy?: {
        id: string;
        titleTh: string;
        firstNameTh: string;
        lastNameTh: string;
    };
    questions?: ExamQuestion[];
    _count?: {
        questions: number;
        attempts: number;
    };
}

export interface ExamAttemptAnswer {
    questionId: string;
    answer: any;
    isCorrect?: boolean;
    points?: number;
}

export interface ExamAttempt {
    id: string;
    examId: string;
    studentId: string;
    attemptNumber: number;
    status: ExamAttemptStatus;
    startedAt: string;
    submittedAt?: string;
    score?: number;
    correctCount?: number;
    totalQuestions?: number;
    answers?: ExamAttemptAnswer[];
    tabSwitchCount: number;
    exam?: Exam;
    student?: {
        id: string;
        titleTh: string;
        firstNameTh: string;
        lastNameTh: string;
        studentNumber: number;
    };
}

// DTOs
export interface CreateExamDto {
    subjectInstanceId: string;
    title: string;
    description?: string;
    instructions?: string;
    type: ExamType;
    maxScore: number;
    passingScore?: number;
    startTime: string;
    endTime: string;
    duration: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    maxAttempts?: number;
}

export interface UpdateExamDto {
    title?: string;
    description?: string;
    instructions?: string;
    startTime?: string;
    endTime?: string;
    duration?: number;
    isPublished?: boolean;
}

export interface CreateQuestionBankDto {
    subjectId: string;
    name: string;
    description?: string;
}

export interface CreateQuestionDto {
    questionBankId: string;
    type: QuestionType;
    content: string;
    explanation?: string;
    options?: QuestionOption[];
    matchingPairs?: { left: string; right: string }[];
    correctAnswer?: string;
    acceptedAnswers?: string[];
    difficulty?: Difficulty;
    points?: number;
    tags?: string[];
}

export interface AddExamQuestionDto {
    questionId: string;
    order?: number;
    points?: number;
}

export interface SubmitExamAnswerDto {
    questionId: string;
    answer: any;
}

export interface ExamQueryParams extends QueryParams {
    subjectInstanceId?: string;
    type?: ExamType;
    isPublished?: boolean;
}

export const examsApi = {
    // =====================
    // Exams
    // =====================

    getAll: async (params?: ExamQueryParams): Promise<ApiResponse<Exam>> => {
        const { data } = await api.get('/exams', { params });
        return data;
    },

    getById: async (id: string): Promise<Exam> => {
        const { data } = await api.get(`/exams/${id}`);
        return data;
    },

    create: async (dto: CreateExamDto): Promise<Exam> => {
        const { data } = await api.post('/exams', dto);
        return data;
    },

    update: async (id: string, dto: UpdateExamDto): Promise<Exam> => {
        const { data } = await api.put(`/exams/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/exams/${id}`);
    },

    publish: async (id: string): Promise<Exam> => {
        const { data } = await api.put(`/exams/${id}`, { isPublished: true });
        return data;
    },

    unpublish: async (id: string): Promise<Exam> => {
        const { data } = await api.put(`/exams/${id}`, { isPublished: false });
        return data;
    },

    // =====================
    // Exam Questions
    // =====================

    addQuestion: async (examId: string, dto: AddExamQuestionDto): Promise<ExamQuestion> => {
        const { data } = await api.post(`/exams/${examId}/questions`, dto);
        return data;
    },

    removeQuestion: async (examId: string, questionId: string): Promise<void> => {
        await api.delete(`/exams/${examId}/questions/${questionId}`);
    },

    // =====================
    // Question Banks
    // =====================

    createQuestionBank: async (dto: CreateQuestionBankDto): Promise<QuestionBank> => {
        const { data } = await api.post('/exams/question-banks', dto);
        return data;
    },

    getQuestionBanks: async (subjectId: string): Promise<QuestionBank[]> => {
        const { data } = await api.get(`/exams/question-banks/subject/${subjectId}`);
        return data;
    },

    // =====================
    // Questions
    // =====================

    createQuestion: async (dto: CreateQuestionDto): Promise<Question> => {
        const { data } = await api.post('/exams/questions', dto);
        return data;
    },

    getQuestionsByBank: async (bankId: string): Promise<Question[]> => {
        const { data } = await api.get(`/exams/question-banks/${bankId}/questions`);
        return data;
    },

    // =====================
    // Exam Attempts (Student)
    // =====================

    startAttempt: async (examId: string): Promise<ExamAttempt> => {
        const { data } = await api.post(`/exams/${examId}/start`);
        return data;
    },

    submitAnswer: async (attemptId: string, dto: SubmitExamAnswerDto): Promise<ExamAttempt> => {
        const { data } = await api.put(`/exams/attempts/${attemptId}/answer`, dto);
        return data;
    },

    submitExam: async (attemptId: string): Promise<ExamAttempt> => {
        const { data } = await api.post(`/exams/attempts/${attemptId}/submit`);
        return data;
    },

    getAttempt: async (attemptId: string): Promise<ExamAttempt> => {
        const { data } = await api.get(`/exams/attempts/${attemptId}`);
        return data;
    },

    getStudentAttempts: async (studentId: string): Promise<ExamAttempt[]> => {
        const { data } = await api.get(`/exams/student/${studentId}/attempts`);
        return data;
    },
};

export default examsApi;
