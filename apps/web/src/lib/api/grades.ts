// Grades API - CRUD operations for grades, GPA/GPAX calculations, and reports

import api, { ApiResponse, QueryParams } from '../api';

// Interfaces
export interface Grade {
    id: string;
    studentId: string;
    subjectInstanceId: string;
    gradingPeriodId?: string;
    classworkScore?: number;
    midtermScore?: number;
    finalScore?: number;
    behaviorScore?: number;
    totalScore?: number;
    percentage?: number;
    gradePoint?: number;
    gradeLabel?: string;
    remarks?: string;
    createdAt: string;
    updatedAt: string;
    student?: {
        id: string;
        studentCode: string;
        titleTh: string;
        firstNameTh: string;
        lastNameTh: string;
        studentNumber: number;
        classroom?: {
            id: string;
            name: string;
            gradeLevel?: {
                id: string;
                code: string;
                nameTh: string;
            };
        };
    };
    subjectInstance?: {
        id: string;
        subject: {
            id: string;
            code: string;
            nameTh: string;
            nameEn?: string;
            credits: number;
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
    gradingPeriod?: {
        id: string;
        name: string;
        type: string;
        weight: number;
    };
}

export interface GradeSummary {
    student: {
        id: string;
        studentCode: string;
        name: string;
        studentNumber: number;
    };
    grades: Grade[];
}

export interface GPAResult {
    gpa: number;
    totalCredits: number;
    grades: Grade[];
}

export interface GPAXResult {
    gpax: number;
    totalCredits: number;
    semesters: {
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
        gpa: number;
        credits: number;
    }[];
}

export interface ReportCardData {
    student: {
        id: string;
        studentCode: string;
        titleTh: string;
        firstNameTh: string;
        lastNameTh: string;
        nationalId: string;
        birthDate: string;
        classroom: {
            name: string;
            gradeLevel: {
                nameTh: string;
            };
        };
    };
    semester: {
        name: string;
        academicYear: {
            year: number;
            name: string;
        };
    };
    grades: {
        subjectArea: {
            code: string;
            nameTh: string;
            color?: string;
        };
        subjects: {
            code: string;
            nameTh: string;
            credits: number;
            gradeLabel: string;
            gradePoint: number;
        }[];
    }[];
    gpa: number;
    totalCredits: number;
    attendance: {
        present: number;
        absent: number;
        late: number;
        sickLeave: number;
        personalLeave: number;
    };
    behavior: {
        score: number;
        maxScore: number;
        remarks?: string;
    };
}

export interface TranscriptData {
    student: {
        id: string;
        studentCode: string;
        titleTh: string;
        firstNameTh: string;
        lastNameTh: string;
        nationalId: string;
        birthDate: string;
        enrollmentDate: string;
    };
    semesters: {
        semester: {
            number: number;
            name: string;
            academicYear: {
                year: number;
                name: string;
            };
        };
        classroom: {
            name: string;
            gradeLevel: {
                nameTh: string;
            };
        };
        grades: {
            subject: {
                code: string;
                nameTh: string;
                credits: number;
            };
            gradeLabel: string;
            gradePoint: number;
        }[];
        gpa: number;
        credits: number;
    }[];
    gpax: number;
    totalCredits: number;
}

// DTOs
export interface CreateGradeDto {
    studentId: string;
    subjectInstanceId: string;
    gradingPeriodId?: string;
    classworkScore?: number;
    midtermScore?: number;
    finalScore?: number;
    behaviorScore?: number;
    remarks?: string;
}

export interface UpdateGradeDto {
    classworkScore?: number;
    midtermScore?: number;
    finalScore?: number;
    behaviorScore?: number;
    remarks?: string;
}

export interface BulkGradeDto {
    subjectInstanceId: string;
    gradingPeriodId?: string;
    grades: {
        studentId: string;
        classworkScore?: number;
        midtermScore?: number;
        finalScore?: number;
    }[];
}

export interface GradeQueryParams extends QueryParams {
    studentId?: string;
    subjectInstanceId?: string;
    semesterId?: string;
    classroomId?: string;
}

export const gradesApi = {
    // =====================
    // Grade CRUD
    // =====================

    getByStudent: async (studentId: string, semesterId?: string): Promise<Grade[]> => {
        const params: any = {};
        if (semesterId) params.semesterId = semesterId;
        const { data } = await api.get(`/grades/student/${studentId}`, { params });
        return data;
    },

    getBySubjectInstance: async (subjectInstanceId: string): Promise<Grade[]> => {
        const { data } = await api.get(`/grades/subject-instance/${subjectInstanceId}`);
        return data;
    },

    getByClassroom: async (classroomId: string, semesterId: string): Promise<GradeSummary[]> => {
        const { data } = await api.get(`/grades/classroom/${classroomId}/semester/${semesterId}`);
        return data;
    },

    create: async (dto: CreateGradeDto): Promise<Grade> => {
        const { data } = await api.post('/grades', dto);
        return data;
    },

    update: async (id: string, dto: UpdateGradeDto): Promise<Grade> => {
        const { data } = await api.put(`/grades/${id}`, dto);
        return data;
    },

    bulkCreateOrUpdate: async (dto: BulkGradeDto): Promise<Grade[]> => {
        const { data } = await api.post('/grades/bulk', dto);
        return data;
    },

    // =====================
    // GPA Calculations
    // =====================

    calculateGPA: async (studentId: string, semesterId: string): Promise<GPAResult> => {
        const { data } = await api.get(`/grades/gpa/student/${studentId}/semester/${semesterId}`);
        return data;
    },

    calculateGPAX: async (studentId: string): Promise<GPAXResult> => {
        const { data } = await api.get(`/grades/gpax/student/${studentId}`);
        return data;
    },

    // =====================
    // Reports
    // =====================

    getReportCard: async (studentId: string, semesterId: string): Promise<ReportCardData> => {
        const { data } = await api.get(`/grades/report-card/${studentId}/${semesterId}`);
        return data;
    },

    getTranscript: async (studentId: string): Promise<TranscriptData> => {
        const { data } = await api.get(`/grades/transcript/${studentId}`);
        return data;
    },
};

export default gradesApi;
