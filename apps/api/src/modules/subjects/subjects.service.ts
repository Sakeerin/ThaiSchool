// Subjects Service

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateSubjectDto,
    UpdateSubjectDto,
    SubjectQueryDto,
    CreateSubjectAreaDto,
    CreateSubjectInstanceDto,
} from './dto';

@Injectable()
export class SubjectsService {
    constructor(private readonly prisma: PrismaService) { }

    // =====================
    // Subject Areas (8 กลุ่มสาระ)
    // =====================

    async findAllAreas() {
        return this.prisma.subjectArea.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { subjects: true } },
            },
        });
    }

    async createArea(data: CreateSubjectAreaDto) {
        const existing = await this.prisma.subjectArea.findUnique({
            where: { code: data.code },
        });

        if (existing) {
            throw new ConflictException('รหัสกลุ่มสาระนี้มีอยู่แล้ว');
        }

        return this.prisma.subjectArea.create({ data });
    }

    // =====================
    // Subjects
    // =====================

    async findAll(params: SubjectQueryDto) {
        const { page = 1, limit = 50, subjectAreaId, gradeLevelId, search } = params;

        const where: any = {};

        if (subjectAreaId) {
            where.subjectAreaId = subjectAreaId;
        }

        if (gradeLevelId) {
            where.gradeLevels = { some: { id: gradeLevelId } };
        }

        if (search) {
            where.OR = [
                { nameTh: { contains: search, mode: 'insensitive' } },
                { nameEn: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.paginate('subject', {
            page,
            limit,
            where,
            orderBy: { code: 'asc' },
            include: {
                subjectArea: true,
                gradeLevels: true,
            },
        });
    }

    async findById(id: string) {
        const subject = await this.prisma.subject.findUnique({
            where: { id },
            include: {
                subjectArea: true,
                gradeLevels: true,
                instances: {
                    include: {
                        semester: { include: { academicYear: true } },
                        teachings: {
                            include: { teacher: true },
                        },
                    },
                },
            },
        });

        if (!subject) {
            throw new NotFoundException('ไม่พบข้อมูลวิชา');
        }

        return subject;
    }

    async findByCode(code: string) {
        const subject = await this.prisma.subject.findUnique({
            where: { code },
            include: {
                subjectArea: true,
                gradeLevels: true,
            },
        });

        if (!subject) {
            throw new NotFoundException('ไม่พบข้อมูลวิชา');
        }

        return subject;
    }

    async create(data: CreateSubjectDto) {
        const existingCode = await this.prisma.subject.findUnique({
            where: { code: data.code },
        });

        if (existingCode) {
            throw new ConflictException('รหัสวิชานี้มีอยู่แล้ว');
        }

        return this.prisma.subject.create({
            data: {
                code: data.code,
                nameTh: data.nameTh,
                nameEn: data.nameEn,
                description: data.description,
                subjectAreaId: data.subjectAreaId,
                credits: data.credits,
                hoursPerWeek: data.hoursPerWeek || 1,
                gradeLevels: data.gradeLevelIds
                    ? { connect: data.gradeLevelIds.map((id) => ({ id })) }
                    : undefined,
            },
            include: {
                subjectArea: true,
                gradeLevels: true,
            },
        });
    }

    async update(id: string, data: UpdateSubjectDto) {
        const subject = await this.prisma.subject.findUnique({ where: { id } });
        if (!subject) {
            throw new NotFoundException('ไม่พบข้อมูลวิชา');
        }

        const { gradeLevelIds, ...updateData } = data;

        return this.prisma.subject.update({
            where: { id },
            data: {
                ...updateData,
                gradeLevels: gradeLevelIds
                    ? { set: gradeLevelIds.map((id) => ({ id })) }
                    : undefined,
            },
            include: {
                subjectArea: true,
                gradeLevels: true,
            },
        });
    }

    async delete(id: string) {
        const subject = await this.prisma.subject.findUnique({
            where: { id },
            include: { _count: { select: { instances: true } } },
        });

        if (!subject) {
            throw new NotFoundException('ไม่พบข้อมูลวิชา');
        }

        if (subject._count.instances > 0) {
            throw new ConflictException('ไม่สามารถลบวิชาที่มีการเปิดสอนแล้วได้');
        }

        await this.prisma.subject.delete({ where: { id } });

        return { message: 'ลบวิชาสำเร็จ' };
    }

    // =====================
    // Subject Instances (การเปิดวิชา)
    // =====================

    async createInstance(data: CreateSubjectInstanceDto) {
        const existing = await this.prisma.subjectInstance.findUnique({
            where: {
                subjectId_semesterId: {
                    subjectId: data.subjectId,
                    semesterId: data.semesterId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('วิชานี้ถูกเปิดในภาคเรียนนี้แล้ว');
        }

        return this.prisma.subjectInstance.create({
            data: {
                subjectId: data.subjectId,
                semesterId: data.semesterId,
            },
            include: {
                subject: { include: { subjectArea: true } },
                semester: { include: { academicYear: true } },
            },
        });
    }

    async getInstancesBySemester(semesterId: string) {
        return this.prisma.subjectInstance.findMany({
            where: { semesterId },
            include: {
                subject: { include: { subjectArea: true, gradeLevels: true } },
                teachings: {
                    include: { teacher: true },
                },
                _count: { select: { enrollments: true } },
            },
            orderBy: { subject: { code: 'asc' } },
        });
    }

    async assignTeacher(instanceId: string, teacherId: string) {
        const instance = await this.prisma.subjectInstance.findUnique({
            where: { id: instanceId },
        });

        if (!instance) {
            throw new NotFoundException('ไม่พบข้อมูลการเปิดวิชา');
        }

        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
        });

        if (!teacher) {
            throw new NotFoundException('ไม่พบข้อมูลครู');
        }

        const existing = await this.prisma.teachingAssignment.findUnique({
            where: {
                teacherId_subjectInstanceId: {
                    teacherId,
                    subjectInstanceId: instanceId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('ครูท่านนี้สอนวิชานี้อยู่แล้ว');
        }

        return this.prisma.teachingAssignment.create({
            data: {
                teacherId,
                subjectInstanceId: instanceId,
            },
            include: {
                teacher: true,
                subjectInstance: {
                    include: { subject: true },
                },
            },
        });
    }

    async getGradeLevels() {
        return this.prisma.gradeLevel.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async getSubjectsByGradeLevel(gradeLevelId: string) {
        return this.prisma.subject.findMany({
            where: {
                gradeLevels: { some: { id: gradeLevelId } },
            },
            include: {
                subjectArea: true,
            },
            orderBy: { code: 'asc' },
        });
    }
}
