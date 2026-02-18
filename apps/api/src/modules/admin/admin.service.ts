// Admin Service - Dashboard stats, reports, system info

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    async getDashboardStats() {
        const [
            totalStudents,
            totalTeachers,
            totalClassrooms,
            totalSubjects,
            totalUsers,
            activeUsers,
            currentAcademicYear,
        ] = await Promise.all([
            this.prisma.student.count(),
            this.prisma.teacher.count(),
            this.prisma.classroom.count(),
            this.prisma.subject.count(),
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.academicYear.findFirst({
                where: { isCurrent: true },
                include: {
                    semesters: {
                        orderBy: { number: 'asc' },
                    },
                },
            }),
        ]);

        // Attendance for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [presentToday, absentToday, lateToday] = await Promise.all([
            this.prisma.attendance.count({
                where: { date: { gte: today, lt: tomorrow }, status: 'PRESENT' },
            }),
            this.prisma.attendance.count({
                where: { date: { gte: today, lt: tomorrow }, status: 'ABSENT' },
            }),
            this.prisma.attendance.count({
                where: { date: { gte: today, lt: tomorrow }, status: 'LATE' },
            }),
        ]);

        const totalAttendanceToday = presentToday + absentToday + lateToday;
        const attendanceRate = totalAttendanceToday > 0
            ? Math.round((presentToday / totalAttendanceToday) * 100)
            : 0;

        // Recent announcements
        const recentAnnouncements = await this.prisma.announcement.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                type: true,
                priority: true,
                isPublished: true,
                createdAt: true,
            },
        });

        // Users by role
        const usersByRole = await this.prisma.user.groupBy({
            by: ['role'],
            _count: { id: true },
        });

        const roleDistribution = usersByRole.reduce((acc, item) => {
            acc[item.role] = item._count.id;
            return acc;
        }, {} as Record<string, number>);

        return {
            stats: {
                totalStudents,
                totalTeachers,
                totalClassrooms,
                totalSubjects,
                totalUsers,
                activeUsers,
            },
            attendance: {
                present: presentToday,
                absent: absentToday,
                late: lateToday,
                total: totalAttendanceToday,
                rate: attendanceRate,
            },
            currentAcademicYear,
            recentAnnouncements,
            roleDistribution,
        };
    }

    async getReportSummary(params: { academicYearId?: string; semesterId?: string }) {
        const { academicYearId, semesterId } = params;

        // Student count per grade level
        const studentsPerGradeLevel = await this.prisma.gradeLevel.findMany({
            orderBy: { order: 'asc' },
            select: {
                id: true,
                code: true,
                nameTh: true,
                nameEn: true,
                level: true,
                stage: true,
                classrooms: {
                    where: academicYearId ? { academicYearId } : {},
                    select: {
                        id: true,
                        name: true,
                        _count: { select: { students: true } },
                    },
                },
            },
        });

        const gradeLevelSummary = studentsPerGradeLevel.map((gl) => ({
            id: gl.id,
            code: gl.code,
            nameTh: gl.nameTh,
            nameEn: gl.nameEn,
            level: gl.level,
            stage: gl.stage,
            totalClassrooms: gl.classrooms.length,
            totalStudents: gl.classrooms.reduce((sum, c) => sum + c._count.students, 0),
            classrooms: gl.classrooms.map((c) => ({
                id: c.id,
                name: c.name,
                studentCount: c._count.students,
            })),
        }));

        // Grade distribution (if semester provided)
        let gradeDistribution: any[] = [];
        if (semesterId) {
            const grades = await this.prisma.grade.groupBy({
                by: ['gradeLabel'],
                where: {
                    subjectInstance: { semesterId },
                    gradeLabel: { not: null },
                },
                _count: { id: true },
            });

            gradeDistribution = grades
                .filter((g) => g.gradeLabel)
                .map((g) => ({
                    grade: g.gradeLabel,
                    count: g._count.id,
                }))
                .sort((a, b) => {
                    const order = ['4', '3.5', '3', '2.5', '2', '1.5', '1', '0'];
                    return order.indexOf(a.grade!) - order.indexOf(b.grade!);
                });
        }

        // Attendance summary (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendanceSummary = await this.prisma.attendance.groupBy({
            by: ['status'],
            where: {
                date: { gte: thirtyDaysAgo },
            },
            _count: { id: true },
        });

        const attendanceByStatus = attendanceSummary.reduce((acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
        }, {} as Record<string, number>);

        // Subject stats
        const totalSubjectAreas = await this.prisma.subjectArea.count();
        const totalSubjects = await this.prisma.subject.count();

        return {
            gradeLevelSummary,
            gradeDistribution,
            attendance: attendanceByStatus,
            subjectStats: {
                totalSubjectAreas,
                totalSubjects,
            },
        };
    }

    async getSystemInfo() {
        const currentAcademicYear = await this.prisma.academicYear.findFirst({
            where: { isCurrent: true },
            include: {
                semesters: {
                    orderBy: { number: 'asc' },
                    include: {
                        gradingPeriods: {
                            orderBy: { startDate: 'asc' },
                        },
                    },
                },
            },
        });

        const allAcademicYears = await this.prisma.academicYear.findMany({
            orderBy: { year: 'desc' },
            include: {
                semesters: {
                    orderBy: { number: 'asc' },
                },
                _count: { select: { classrooms: true } },
            },
        });

        const gradeLevels = await this.prisma.gradeLevel.findMany({
            orderBy: { order: 'asc' },
        });

        const subjectAreas = await this.prisma.subjectArea.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { subjects: true } },
            },
        });

        return {
            currentAcademicYear,
            allAcademicYears,
            gradeLevels,
            subjectAreas,
        };
    }
}
