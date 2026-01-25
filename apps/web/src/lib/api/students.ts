// Students API - CRUD operations for students

import api, { ApiResponse, QueryParams } from '../api';

export interface Student {
    id: string;
    userId: string;
    studentCode: string;
    nationalId: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn?: string;
    lastNameEn?: string;
    nickname?: string;
    gender: 'MALE' | 'FEMALE';
    dateOfBirth?: string;
    bloodType?: string;
    religion?: string;
    nationality?: string;
    ethnicity?: string;
    studentNumber?: number;
    enrollmentDate?: string;
    status: 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'DROPPED';
    classroomId?: string;
    classroom?: {
        id: string;
        name: string;
        gradeLevel: {
            id: string;
            name: string;
            nameTh: string;
            level: number;
        };
    };
    user?: {
        email: string;
        phone?: string;
        isActive: boolean;
    };
}

export interface CreateStudentDto {
    email: string;
    password: string;
    nationalId: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn?: string;
    lastNameEn?: string;
    nickname?: string;
    gender: string;
    dateOfBirth?: string;
    classroomId?: string;
}

export interface UpdateStudentDto {
    titleTh?: string;
    firstNameTh?: string;
    lastNameTh?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    nickname?: string;
    gender?: string;
    dateOfBirth?: string;
    bloodType?: string;
    religion?: string;
    classroomId?: string;
    status?: string;
}

export interface StudentQueryParams extends QueryParams {
    classroomId?: string;
    gradeLevelId?: string;
    status?: string;
}

export const studentsApi = {
    getAll: async (params?: StudentQueryParams): Promise<ApiResponse<Student>> => {
        const { data } = await api.get('/students', { params });
        return data;
    },

    getById: async (id: string): Promise<Student> => {
        const { data } = await api.get(`/students/${id}`);
        return data;
    },

    create: async (dto: CreateStudentDto): Promise<Student> => {
        const { data } = await api.post('/students', dto);
        return data;
    },

    update: async (id: string, dto: UpdateStudentDto): Promise<Student> => {
        const { data } = await api.put(`/students/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/students/${id}`);
    },

    getByClassroom: async (classroomId: string): Promise<Student[]> => {
        const { data } = await api.get(`/students/classroom/${classroomId}`);
        return data;
    },
};

export default studentsApi;
