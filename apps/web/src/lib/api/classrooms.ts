// Classrooms API - CRUD operations for classroom management

import api, { ApiResponse, QueryParams } from '../api';

export interface Classroom {
    id: string;
    name: string;
    room: number;
    capacity: number;
    studyPlan?: string;
    createdAt: string;
    updatedAt: string;
    academicYear: { id: string; year: number; name: string };
    gradeLevel: { id: string; code: string; nameTh: string; nameEn: string; level: number; stage: string };
    advisor?: { id: string; titleTh: string; firstNameTh: string; lastNameTh: string };
    _count?: { students: number };
}

export interface CreateClassroomDto {
    academicYearId: string;
    gradeLevelId: string;
    room: number;
    name: string;
    capacity?: number;
    studyPlan?: string;
    advisorId?: string;
}

export interface UpdateClassroomDto {
    room?: number;
    name?: string;
    capacity?: number;
    studyPlan?: string;
    advisorId?: string | null;
}

export interface ClassroomQueryParams extends QueryParams {
    academicYearId?: string;
    gradeLevelId?: string;
}

// API Functions
export const classroomsApi = {
    getAll: async (params?: ClassroomQueryParams): Promise<ApiResponse<Classroom>> => {
        const { data } = await api.get('/classrooms', { params });
        return data;
    },

    getById: async (id: string): Promise<Classroom> => {
        const { data } = await api.get(`/classrooms/${id}`);
        return data;
    },

    getByAcademicYear: async (academicYearId: string): Promise<Classroom[]> => {
        const { data } = await api.get(`/classrooms/academic-year/${academicYearId}`);
        return data;
    },

    create: async (dto: CreateClassroomDto): Promise<Classroom> => {
        const { data } = await api.post('/classrooms', dto);
        return data;
    },

    update: async (id: string, dto: UpdateClassroomDto): Promise<Classroom> => {
        const { data } = await api.put(`/classrooms/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/classrooms/${id}`);
    },

    assignAdvisor: async (id: string, advisorId: string): Promise<Classroom> => {
        const { data } = await api.put(`/classrooms/${id}/advisor/${advisorId}`);
        return data;
    },

    removeAdvisor: async (id: string): Promise<Classroom> => {
        const { data } = await api.delete(`/classrooms/${id}/advisor`);
        return data;
    },
};

export default classroomsApi;
