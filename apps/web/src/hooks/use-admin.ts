// Admin React Query Hooks

'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi, ReportQueryParams } from '@/lib/api/admin';

export const ADMIN_DASHBOARD_KEY = 'admin-dashboard';
export const ADMIN_REPORTS_KEY = 'admin-reports';
export const ADMIN_SYSTEM_INFO_KEY = 'admin-system-info';

export function useAdminDashboard() {
    return useQuery({
        queryKey: [ADMIN_DASHBOARD_KEY],
        queryFn: () => adminApi.getDashboardStats(),
    });
}

export function useAdminReports(params?: ReportQueryParams) {
    return useQuery({
        queryKey: [ADMIN_REPORTS_KEY, params],
        queryFn: () => adminApi.getReportSummary(params),
    });
}

export function useAdminSystemInfo() {
    return useQuery({
        queryKey: [ADMIN_SYSTEM_INFO_KEY],
        queryFn: () => adminApi.getSystemInfo(),
    });
}
