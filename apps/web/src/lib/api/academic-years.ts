// Academic Years API - Academic year and semester management

import api from '../api';

export interface Semester {
    id: string;
    number: number;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    gradingPeriods?: GradingPeriod[];
}

export interface GradingPeriod {
    id: string;
    name: string;
    type: string;
    weight: number;
    startDate: string;
    endDate: string;
}

export interface AcademicYear {
    id: string;
    year: number;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    semesters: Semester[];
    _count?: { classrooms: number };
}

export interface CreateAcademicYearDto {
    year: number;
    name: string;
    startDate: string;
    endDate: string;
}

export interface CreateSemesterDto {
    academicYearId: string;
    number: number;
    name: string;
    startDate: string;
    endDate: string;
}

// API Functions
export const academicYearsApi = {
    getAll: async (): Promise<AcademicYear[]> => {
        const { data } = await api.get('/academic-years');
        return data;
    },

    getCurrent: async (): Promise<AcademicYear> => {
        const { data } = await api.get('/academic-years/current');
        return data;
    },

    getById: async (id: string): Promise<AcademicYear> => {
        const { data } = await api.get(`/academic-years/${id}`);
        return data;
    },

    create: async (dto: CreateAcademicYearDto): Promise<AcademicYear> => {
        const { data } = await api.post('/academic-years', dto);
        return data;
    },

    update: async (id: string, dto: Partial<CreateAcademicYearDto>): Promise<AcademicYear> => {
        const { data } = await api.put(`/academic-years/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/academic-years/${id}`);
    },

    setCurrent: async (id: string): Promise<AcademicYear> => {
        const { data } = await api.put(`/academic-years/${id}/set-current`);
        return data;
    },

    createSemester: async (dto: CreateSemesterDto): Promise<Semester> => {
        const { data } = await api.post('/academic-years/semesters', dto);
        return data;
    },

    setCurrentSemester: async (semesterId: string): Promise<Semester> => {
        const { data } = await api.put(`/academic-years/semesters/${semesterId}/set-current`);
        return data;
    },
};

export default academicYearsApi;
