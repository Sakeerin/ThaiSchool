// Lessons API - CRUD operations for lessons and content

import api, { ApiResponse, QueryParams } from '../api';

// Types
export type ContentType = 'TEXT' | 'VIDEO' | 'PDF' | 'AUDIO' | 'SLIDE' | 'LINK' | 'QUIZ';

export interface LessonContent {
    id: string;
    lessonId: string;
    type: ContentType;
    title: string;
    content?: string;
    fileUrl?: string;
    fileSize?: number;
    duration?: number;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface Lesson {
    id: string;
    subjectInstanceId: string;
    title: string;
    description?: string;
    order: number;
    version: number;
    isPublished: boolean;
    publishedAt?: string;
    createdById: string;
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
    contents?: LessonContent[];
    _count?: {
        contents: number;
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

export interface CreateLessonDto {
    subjectInstanceId: string;
    title: string;
    description?: string;
    order?: number;
}

export interface UpdateLessonDto {
    title?: string;
    description?: string;
    order?: number;
    isPublished?: boolean;
}

export interface CreateLessonContentDto {
    lessonId: string;
    type: ContentType;
    title: string;
    content?: string;
    fileUrl?: string;
    fileSize?: number;
    duration?: number;
    order?: number;
}

export interface UpdateLessonContentDto {
    title?: string;
    content?: string;
    fileUrl?: string;
    order?: number;
}

export interface LessonQueryParams extends QueryParams {
    subjectInstanceId?: string;
    isPublished?: boolean;
}

export const lessonsApi = {
    // Get all lessons with pagination
    getAll: async (params?: LessonQueryParams): Promise<ApiResponse<Lesson>> => {
        const { data } = await api.get('/lessons', { params });
        return data;
    },

    // Get single lesson by ID
    getById: async (id: string): Promise<Lesson> => {
        const { data } = await api.get(`/lessons/${id}`);
        return data;
    },

    // Get lessons by subject instance
    getBySubjectInstance: async (subjectInstanceId: string): Promise<Lesson[]> => {
        const { data } = await api.get(`/lessons/subject-instance/${subjectInstanceId}`);
        return data;
    },

    // Get lessons created by current teacher
    getTeacherLessons: async (): Promise<Lesson[]> => {
        const { data } = await api.get('/lessons/teacher/my-lessons');
        return data;
    },

    // Get subject instances for current teacher
    getTeacherSubjects: async (): Promise<SubjectInstance[]> => {
        const { data } = await api.get('/lessons/teacher/subjects');
        return data;
    },

    // Get lessons for current student's enrolled subjects
    getStudentLessons: async (): Promise<Lesson[]> => {
        const { data } = await api.get('/lessons/student/enrolled');
        return data;
    },

    // Create new lesson
    create: async (dto: CreateLessonDto): Promise<Lesson> => {
        const { data } = await api.post('/lessons', dto);
        return data;
    },

    // Update lesson
    update: async (id: string, dto: UpdateLessonDto): Promise<Lesson> => {
        const { data } = await api.put(`/lessons/${id}`, dto);
        return data;
    },

    // Delete lesson
    delete: async (id: string): Promise<void> => {
        await api.delete(`/lessons/${id}`);
    },

    // Publish lesson
    publish: async (id: string): Promise<Lesson> => {
        const { data } = await api.put(`/lessons/${id}/publish`);
        return data;
    },

    // Unpublish lesson
    unpublish: async (id: string): Promise<Lesson> => {
        const { data } = await api.put(`/lessons/${id}/unpublish`);
        return data;
    },

    // Content operations
    addContent: async (dto: CreateLessonContentDto): Promise<LessonContent> => {
        const { data } = await api.post('/lessons/contents', dto);
        return data;
    },

    updateContent: async (contentId: string, dto: UpdateLessonContentDto): Promise<LessonContent> => {
        const { data } = await api.put(`/lessons/contents/${contentId}`, dto);
        return data;
    },

    deleteContent: async (contentId: string): Promise<void> => {
        await api.delete(`/lessons/contents/${contentId}`);
    },

    reorderContents: async (lessonId: string, contentIds: string[]): Promise<Lesson> => {
        const { data } = await api.put(`/lessons/${lessonId}/reorder-contents`, { contentIds });
        return data;
    },
};

export default lessonsApi;
