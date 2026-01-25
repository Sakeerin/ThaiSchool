// Teachers API - CRUD operations for teachers

import api, { ApiResponse, QueryParams } from '../api';

export interface Teacher {
    id: string;
    userId: string;
    employeeCode: string;
    nationalId?: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn?: string;
    lastNameEn?: string;
    nickname?: string;
    gender?: 'MALE' | 'FEMALE';
    dateOfBirth?: string;
    position?: string;
    academicRank?: string;
    department?: string;
    specializations?: string[];
    hireDate?: string;
    status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'RETIRED';
    user?: {
        email: string;
        phone?: string;
        isActive: boolean;
    };
    _count?: {
        teachingAssignments: number;
        advisedClassrooms: number;
    };
}

export interface CreateTeacherDto {
    email: string;
    password: string;
    employeeCode: string;
    nationalId?: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn?: string;
    lastNameEn?: string;
    gender?: string;
    position?: string;
    department?: string;
    hireDate?: string;
}

export interface UpdateTeacherDto {
    titleTh?: string;
    firstNameTh?: string;
    lastNameTh?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    position?: string;
    academicRank?: string;
    department?: string;
    specializations?: string[];
    status?: string;
}

export interface TeacherQueryParams extends QueryParams {
    department?: string;
    status?: string;
}

export const teachersApi = {
    getAll: async (params?: TeacherQueryParams): Promise<ApiResponse<Teacher>> => {
        const { data } = await api.get('/teachers', { params });
        return data;
    },

    getById: async (id: string): Promise<Teacher> => {
        const { data } = await api.get(`/teachers/${id}`);
        return data;
    },

    create: async (dto: CreateTeacherDto): Promise<Teacher> => {
        const { data } = await api.post('/teachers', dto);
        return data;
    },

    update: async (id: string, dto: UpdateTeacherDto): Promise<Teacher> => {
        const { data } = await api.put(`/teachers/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/teachers/${id}`);
    },
};

export default teachersApi;
