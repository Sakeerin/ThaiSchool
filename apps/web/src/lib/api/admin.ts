// Admin API - Dashboard stats, reports, system info

import api from '../api';

// Types
export interface DashboardStats {
    stats: {
        totalStudents: number;
        totalTeachers: number;
        totalClassrooms: number;
        totalSubjects: number;
        totalUsers: number;
        activeUsers: number;
    };
    attendance: {
        present: number;
        absent: number;
        late: number;
        total: number;
        rate: number;
    };
    currentAcademicYear: {
        id: string;
        year: number;
        name: string;
        isCurrent: boolean;
        semesters: { id: string; number: number; name: string; isCurrent: boolean }[];
    } | null;
    recentAnnouncements: {
        id: string;
        title: string;
        type: string;
        priority: string;
        isPublished: boolean;
        createdAt: string;
    }[];
    roleDistribution: Record<string, number>;
}

export interface GradeLevelSummary {
    id: string;
    code: string;
    nameTh: string;
    nameEn: string;
    level: number;
    stage: string;
    totalClassrooms: number;
    totalStudents: number;
    classrooms: { id: string; name: string; studentCount: number }[];
}

export interface ReportSummary {
    gradeLevelSummary: GradeLevelSummary[];
    gradeDistribution: { grade: string; count: number }[];
    attendance: Record<string, number>;
    subjectStats: {
        totalSubjectAreas: number;
        totalSubjects: number;
    };
}

export interface SystemInfo {
    currentAcademicYear: any;
    allAcademicYears: any[];
    gradeLevels: any[];
    subjectAreas: any[];
}

export interface ReportQueryParams {
    academicYearId?: string;
    semesterId?: string;
}

// API Functions
export const adminApi = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const { data } = await api.get('/admin/dashboard');
        return data;
    },

    getReportSummary: async (params?: ReportQueryParams): Promise<ReportSummary> => {
        const { data } = await api.get('/admin/reports/summary', { params });
        return data;
    },

    getSystemInfo: async (): Promise<SystemInfo> => {
        const { data } = await api.get('/admin/system-info');
        return data;
    },
};

export default adminApi;
