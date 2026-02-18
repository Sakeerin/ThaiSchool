// Academic Years React Query Hooks

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicYearsApi, CreateAcademicYearDto, CreateSemesterDto } from '@/lib/api/academic-years';

export const ACADEMIC_YEARS_KEY = 'academic-years';

export function useAcademicYears() {
    return useQuery({
        queryKey: [ACADEMIC_YEARS_KEY],
        queryFn: () => academicYearsApi.getAll(),
    });
}

export function useCurrentAcademicYear() { 
    return useQuery({
        queryKey: [ACADEMIC_YEARS_KEY, 'current'],
        queryFn: () => academicYearsApi.getCurrent(),
    });
}

export function useAcademicYear(id: string) {
    return useQuery({
        queryKey: [ACADEMIC_YEARS_KEY, id],
        queryFn: () => academicYearsApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateAcademicYear() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateAcademicYearDto) => academicYearsApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACADEMIC_YEARS_KEY] });
        },
    });
}

export function useSetCurrentAcademicYear() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => academicYearsApi.setCurrent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACADEMIC_YEARS_KEY] });
        },
    });
}

export function useDeleteAcademicYear() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => academicYearsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACADEMIC_YEARS_KEY] });
        },
    });
}

export function useCreateSemester() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateSemesterDto) => academicYearsApi.createSemester(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACADEMIC_YEARS_KEY] });
        },
    });
}

export function useSetCurrentSemester() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (semesterId: string) => academicYearsApi.setCurrentSemester(semesterId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACADEMIC_YEARS_KEY] });
        },
    });
}
