// Academic Years Service

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateAcademicYearDto,
    UpdateAcademicYearDto,
    CreateSemesterDto,
    CreateGradingPeriodDto,
} from './dto';

@Injectable()
export class AcademicYearsService {
    constructor(private readonly prisma: PrismaService) { }

    // =====================
    // Academic Years
    // =====================

    async findAll() {
        return this.prisma.academicYear.findMany({
            orderBy: { year: 'desc' },
            include: {
                semesters: {
                    orderBy: { number: 'asc' },
                },
                _count: { select: { classrooms: true } },
            },
        });
    }

    async findCurrent() {
        const current = await this.prisma.academicYear.findFirst({
            where: { isCurrent: true },
            include: {
                semesters: {
                    orderBy: { number: 'asc' },
                    include: {
                        gradingPeriods: { orderBy: { startDate: 'asc' } },
                    },
                },
            },
        });

        if (!current) {
            throw new NotFoundException('ไม่พบปีการศึกษาปัจจุบัน');
        }

        return current;
    }

    async findById(id: string) {
        const academicYear = await this.prisma.academicYear.findUnique({
            where: { id },
            include: {
                semesters: {
                    orderBy: { number: 'asc' },
                    include: {
                        gradingPeriods: { orderBy: { startDate: 'asc' } },
                        subjectInstances: {
                            include: { subject: true },
                        },
                    },
                },
                classrooms: {
                    include: {
                        gradeLevel: true,
                        _count: { select: { students: true } },
                    },
                },
            },
        });

        if (!academicYear) {
            throw new NotFoundException('ไม่พบปีการศึกษา');
        }

        return academicYear;
    }

    async create(data: CreateAcademicYearDto) {
        const existing = await this.prisma.academicYear.findUnique({
            where: { year: data.year },
        });

        if (existing) {
            throw new ConflictException('ปีการศึกษานี้มีอยู่แล้ว');
        }

        // If new year is current, unset other current years
        if (data.isCurrent) {
            await this.prisma.academicYear.updateMany({
                where: { isCurrent: true },
                data: { isCurrent: false },
            });
        }

        return this.prisma.academicYear.create({
            data: {
                year: data.year,
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                isCurrent: data.isCurrent || false,
            },
            include: { semesters: true },
        });
    }

    async update(id: string, data: UpdateAcademicYearDto) {
        const academicYear = await this.prisma.academicYear.findUnique({
            where: { id },
        });

        if (!academicYear) {
            throw new NotFoundException('ไม่พบปีการศึกษา');
        }

        // If setting as current, unset other current years
        if (data.isCurrent) {
            await this.prisma.academicYear.updateMany({
                where: { isCurrent: true, id: { not: id } },
                data: { isCurrent: false },
            });
        }

        return this.prisma.academicYear.update({
            where: { id },
            data,
            include: { semesters: true },
        });
    }

    async delete(id: string) {
        const academicYear = await this.prisma.academicYear.findUnique({
            where: { id },
            include: { _count: { select: { classrooms: true, semesters: true } } },
        });

        if (!academicYear) {
            throw new NotFoundException('ไม่พบปีการศึกษา');
        }

        if (academicYear._count.classrooms > 0) {
            throw new ConflictException('ไม่สามารถลบปีการศึกษาที่มีห้องเรียนได้');
        }

        await this.prisma.academicYear.delete({ where: { id } });

        return { message: 'ลบปีการศึกษาสำเร็จ' };
    }

    async setCurrent(id: string) {
        const academicYear = await this.prisma.academicYear.findUnique({
            where: { id },
        });

        if (!academicYear) {
            throw new NotFoundException('ไม่พบปีการศึกษา');
        }

        // Unset all current
        await this.prisma.academicYear.updateMany({
            where: { isCurrent: true },
            data: { isCurrent: false },
        });

        // Also unset current semester
        await this.prisma.semester.updateMany({
            where: { isCurrent: true },
            data: { isCurrent: false },
        });

        // Set new current
        return this.prisma.academicYear.update({
            where: { id },
            data: { isCurrent: true },
            include: { semesters: true },
        });
    }

    // =====================
    // Semesters
    // =====================

    async createSemester(data: CreateSemesterDto) {
        const existing = await this.prisma.semester.findUnique({
            where: {
                academicYearId_number: {
                    academicYearId: data.academicYearId,
                    number: data.number,
                },
            },
        });

        if (existing) {
            throw new ConflictException('ภาคเรียนนี้มีอยู่แล้ว');
        }

        // If new semester is current, unset other current semesters
        if (data.isCurrent) {
            await this.prisma.semester.updateMany({
                where: { isCurrent: true },
                data: { isCurrent: false },
            });
        }

        return this.prisma.semester.create({
            data: {
                academicYearId: data.academicYearId,
                number: data.number,
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                isCurrent: data.isCurrent || false,
            },
            include: { academicYear: true },
        });
    }

    async setCurrentSemester(semesterId: string) {
        const semester = await this.prisma.semester.findUnique({
            where: { id: semesterId },
        });

        if (!semester) {
            throw new NotFoundException('ไม่พบภาคเรียน');
        }

        // Unset all current semesters
        await this.prisma.semester.updateMany({
            where: { isCurrent: true },
            data: { isCurrent: false },
        });

        return this.prisma.semester.update({
            where: { id: semesterId },
            data: { isCurrent: true },
            include: { academicYear: true, gradingPeriods: true },
        });
    }

    async getCurrentSemester() {
        const semester = await this.prisma.semester.findFirst({
            where: { isCurrent: true },
            include: {
                academicYear: true,
                gradingPeriods: { orderBy: { startDate: 'asc' } },
            },
        });

        if (!semester) {
            throw new NotFoundException('ไม่พบภาคเรียนปัจจุบัน');
        }

        return semester;
    }

    // =====================
    // Grading Periods
    // =====================

    async createGradingPeriod(data: CreateGradingPeriodDto) {
        return this.prisma.gradingPeriod.create({
            data: {
                semesterId: data.semesterId,
                name: data.name,
                type: data.type,
                weight: data.weight,
                startDate: data.startDate,
                endDate: data.endDate,
            },
            include: { semester: { include: { academicYear: true } } },
        });
    }

    async getGradingPeriodsBySemester(semesterId: string) {
        return this.prisma.gradingPeriod.findMany({
            where: { semesterId },
            orderBy: { startDate: 'asc' },
        });
    }
}
