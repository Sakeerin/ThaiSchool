// Users API - CRUD operations for users

import api, { ApiResponse, QueryParams } from '../api';

export interface User {
    id: string;
    email: string;
    phone?: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
    student?: StudentProfile;
    teacher?: TeacherProfile;
    parent?: ParentProfile;
    admin?: AdminProfile;
}

export interface StudentProfile {
    id: string;
    studentCode: string;
    nationalId: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn?: string;
    lastNameEn?: string;
    studentNumber?: number;
    classroom?: {
        id: string;
        name: string;
        gradeLevel: { name: string };
    };
}

export interface TeacherProfile {
    id: string;
    employeeCode: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn?: string;
    lastNameEn?: string;
    position?: string;
    department?: string;
}

export interface ParentProfile {
    id: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    occupation?: string;
    relationship?: string;
}

export interface AdminProfile {
    id: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    position?: string;
}

export interface CreateUserDto {
    email: string;
    password: string;
    phone?: string;
    role: string;
}

export interface UpdateUserDto {
    email?: string;
    phone?: string;
    isActive?: boolean;
}

export interface UserQueryParams extends QueryParams {
    role?: string;
    isActive?: boolean;
}

// API Functions
export const usersApi = {
    getAll: async (params?: UserQueryParams): Promise<ApiResponse<User>> => {
        const { data } = await api.get('/users', { params });
        return data;
    },

    getById: async (id: string): Promise<User> => {
        const { data } = await api.get(`/users/${id}`);
        return data;
    },

    create: async (dto: CreateUserDto): Promise<User> => {
        const { data } = await api.post('/users', dto);
        return data;
    },

    update: async (id: string, dto: UpdateUserDto): Promise<User> => {
        const { data } = await api.put(`/users/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};

export default usersApi;
