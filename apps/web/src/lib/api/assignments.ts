// Assignments API - CRUD operations for assignments and submissions

import api, { ApiResponse, QueryParams } from '../api';

// Types
export type AssignmentType = 'HOMEWORK' | 'PROJECT' | 'REPORT' | 'PRESENTATION' | 'EXERCISE' | 'OTHER';
export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'RETURNED';

export interface Submission {
    id: string;
    assignmentId: string;
    studentId: string;
    content?: string;
    files?: { url: string; name: string; size: number }[];
    status: SubmissionStatus;
    submittedAt?: string;
    isLate: boolean;
    score?: number;
    feedback?: string;
    gradedById?: string;
    gradedAt?: string;
    createdAt: string;
    updatedAt: string;
    student?: {
        id: string;
        titleTh: string;
        firstNameTh: string;
        lastNameTh: string;
        studentNumber: number;
    };
}

export interface Assignment {
    id: string;
    subjectInstanceId: string;
    title: string;
    description?: string;
    instructions?: string;
    type: AssignmentType;
    maxScore: number;
    weight: number;
    assignedDate: string;
    dueDate: string;
    allowLateSubmission: boolean;
    latePenaltyPercent: number;
    attachments?: { url: string; name: string; size: number }[];
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
    submissions?: Submission[];
    mySubmission?: Submission | null;
    _count?: {
        submissions: number;
    };
}

export interface SubjectInstance {
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
    semester: {
        id: string;
        number: number;
        name: string;
        academicYear: {
            id: string;
            year: number;
            name: string;
        };
    };
}

export interface CreateAssignmentDto {
    subjectInstanceId: string;
    title: string;
    description?: string;
    instructions?: string;
    type: AssignmentType;
    maxScore?: number;
    weight?: number;
    dueDate: string;
    allowLateSubmission?: boolean;
    latePenaltyPercent?: number;
    attachments?: { url: string; name: string; size: number }[];
}

export interface UpdateAssignmentDto {
    title?: string;
    description?: string;
    instructions?: string;
    maxScore?: number;
    dueDate?: string;
    allowLateSubmission?: boolean;
    latePenaltyPercent?: number;
    isPublished?: boolean;
}

export interface SubmitAssignmentDto {
    content?: string;
    files?: { url: string; name: string; size: number }[];
}

export interface GradeSubmissionDto {
    score: number;
    feedback?: string;
}

export interface AssignmentQueryParams extends QueryParams {
    subjectInstanceId?: string;
    type?: AssignmentType;
    isPublished?: boolean;
    search?: string;
}

export const assignmentsApi = {
    // Get all assignments with pagination
    getAll: async (params?: AssignmentQueryParams): Promise<ApiResponse<Assignment>> => {
        const { data } = await api.get('/assignments', { params });
        return data;
    },

    // Get single assignment by ID
    getById: async (id: string): Promise<Assignment> => {
        const { data } = await api.get(`/assignments/${id}`);
        return data;
    },

    // Get assignments by subject instance
    getBySubjectInstance: async (subjectInstanceId: string): Promise<Assignment[]> => {
        const { data } = await api.get(`/assignments/subject-instance/${subjectInstanceId}`);
        return data;
    },

    // Get assignments created by current teacher
    getTeacherAssignments: async (): Promise<Assignment[]> => {
        const { data } = await api.get('/assignments/teacher/my-assignments');
        return data;
    },

    // Get subject instances for current teacher
    getTeacherSubjects: async (): Promise<SubjectInstance[]> => {
        const { data } = await api.get('/assignments/teacher/subjects');
        return data;
    },

    // Get assignments for current student's enrolled subjects
    getStudentAssignments: async (): Promise<Assignment[]> => {
        const { data } = await api.get('/assignments/student/enrolled');
        return data;
    },

    // Get current student's submissions
    getStudentSubmissions: async (): Promise<Submission[]> => {
        const { data } = await api.get('/assignments/student/my-submissions');
        return data;
    },

    // Create new assignment
    create: async (dto: CreateAssignmentDto): Promise<Assignment> => {
        const { data } = await api.post('/assignments', dto);
        return data;
    },

    // Update assignment
    update: async (id: string, dto: UpdateAssignmentDto): Promise<Assignment> => {
        const { data } = await api.put(`/assignments/${id}`, dto);
        return data;
    },

    // Delete assignment
    delete: async (id: string): Promise<void> => {
        await api.delete(`/assignments/${id}`);
    },

    // Publish assignment
    publish: async (id: string): Promise<Assignment> => {
        const { data } = await api.put(`/assignments/${id}/publish`);
        return data;
    },

    // Unpublish assignment
    unpublish: async (id: string): Promise<Assignment> => {
        const { data } = await api.put(`/assignments/${id}/unpublish`);
        return data;
    },

    // Submit assignment (student)
    submit: async (id: string, dto: SubmitAssignmentDto): Promise<Submission> => {
        const { data } = await api.post(`/assignments/${id}/submit`, dto);
        return data;
    },

    // Grade submission (teacher)
    gradeSubmission: async (submissionId: string, dto: GradeSubmissionDto): Promise<Submission> => {
        const { data } = await api.put(`/assignments/submissions/${submissionId}/grade`, dto);
        return data;
    },

    // Return submission for revision
    returnSubmission: async (submissionId: string, feedback: string): Promise<Submission> => {
        const { data } = await api.put(`/assignments/submissions/${submissionId}/return`, { feedback });
        return data;
    },
};

export default assignmentsApi;
