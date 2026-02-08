// Subjects API - CRUD operations for subjects, areas, and instances

import api from '../api';

// Interfaces
export interface SubjectArea {
    id: string;
    code: string;
    nameTh: string;
    nameEn: string;
    color?: string;
    icon?: string;
    order: number;
}

export interface GradeLevel {
    id: string;
    code: string;
    nameTh: string;
    nameEn: string;
    level: number;
    stage: 'PRIMARY' | 'LOWER_SECONDARY' | 'UPPER_SECONDARY';
    order: number;
}

export interface Subject {
    id: string;
    code: string;
    nameTh: string;
    nameEn?: string;
    description?: string;
    credits: number;
    hoursPerWeek: number;
    subjectAreaId: string;
    subjectArea?: SubjectArea;
    gradeLevels?: GradeLevel[];
}

export interface SubjectInstance {
    id: string;
    subjectId: string;
    semesterId: string;
    subject?: Subject;
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
    teachings?: {
        id: string;
        teacherId: string;
        teacher?: {
            id: string;
            titleTh: string;
            firstNameTh: string;
            lastNameTh: string;
        };
    }[];
    _count?: {
        enrollments: number;
        lessons: number;
        assignments: number;
        exams: number;
    };
}

export interface Semester {
    id: string;
    number: number;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    academicYear?: {
        id: string;
        year: number;
        name: string;
    };
}

export interface Classroom {
    id: string;
    name: string;
    room: number;
    capacity: number;
    gradeLevelId: string;
    gradeLevel?: GradeLevel;
    academicYearId: string;
    academicYear?: {
        id: string;
        year: number;
        name: string;
    };
    _count?: {
        students: number;
    };
}

export const subjectsApi = {
    // Subject Areas
    getAreas: async (): Promise<SubjectArea[]> => {
        const { data } = await api.get('/subjects/areas');
        return data;
    },

    // Grade Levels
    getGradeLevels: async (): Promise<GradeLevel[]> => {
        const { data } = await api.get('/subjects/grade-levels');
        return data;
    },

    // Subjects
    getAll: async (): Promise<Subject[]> => {
        const { data } = await api.get('/subjects');
        return data.items || data;
    },

    getById: async (id: string): Promise<Subject> => {
        const { data } = await api.get(`/subjects/${id}`);
        return data;
    },

    // Subject Instances
    getInstancesBySemester: async (semesterId: string): Promise<SubjectInstance[]> => {
        const { data } = await api.get(`/subjects/instances/semester/${semesterId}`);
        return data;
    },

    getTeacherInstances: async (teacherId: string, semesterId?: string): Promise<SubjectInstance[]> => {
        const params: any = { teacherId };
        if (semesterId) params.semesterId = semesterId;
        const { data } = await api.get('/subjects/instances/teacher', { params });
        return data;
    },
};

// Academic Years & Semesters API
export const academicApi = {
    getSemesters: async (): Promise<Semester[]> => {
        const { data } = await api.get('/academic-years/semesters');
        return data;
    },

    getCurrentSemester: async (): Promise<Semester | null> => {
        const { data } = await api.get('/academic-years/current-semester');
        return data;
    },

    getClassrooms: async (academicYearId?: string): Promise<Classroom[]> => {
        const params: any = {};
        if (academicYearId) params.academicYearId = academicYearId;
        const { data } = await api.get('/classrooms', { params });
        return data.items || data;
    },

    getClassroomsBySemester: async (semesterId: string): Promise<Classroom[]> => {
        const { data } = await api.get(`/classrooms/semester/${semesterId}`);
        return data;
    },
};

export default subjectsApi;
