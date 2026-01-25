// Classrooms Service

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClassroomDto, UpdateClassroomDto, ClassroomQueryDto } from './dto';

@Injectable()
export class ClassroomsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: ClassroomQueryDto) {
        const { page = 1, limit = 50, academicYearId, gradeLevelId, search } = params;

        const where: any = {};

        if (academicYearId) {
            where.academicYearId = academicYearId;
        }

        if (gradeLevelId) {
            where.gradeLevelId = gradeLevelId;
        }

        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        return this.prisma.paginate('classroom', {
            page,
            limit,
            where,
            orderBy: [
                { gradeLevel: { order: 'asc' } },
                { room: 'asc' },
            ],
            include: {
                gradeLevel: true,
                academicYear: true,
                advisor: {
                    select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true },
                },
                _count: { select: { students: true } },
            },
        });
    }

    async findById(id: string) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { id },
            include: {
                gradeLevel: true,
                academicYear: true,
                advisor: {
                    include: { user: { select: { email: true } } },
                },
                students: {
                    orderBy: { studentNumber: 'asc' },
                    include: {
                        user: { select: { email: true, isActive: true } },
                    },
                },
            },
        });

        if (!classroom) {
            throw new NotFoundException('ไม่พบข้อมูลห้องเรียน');
        }

        return classroom;
    }

    async create(data: CreateClassroomDto) {
        // Check for duplicate classroom
        const existing = await this.prisma.classroom.findUnique({
            where: {
                academicYearId_gradeLevelId_room: {
                    academicYearId: data.academicYearId,
                    gradeLevelId: data.gradeLevelId,
                    room: data.room,
                },
            },
        });

        if (existing) {
            throw new ConflictException('ห้องเรียนนี้มีอยู่แล้วในระบบ');
        }

        return this.prisma.classroom.create({
            data: {
                academicYearId: data.academicYearId,
                gradeLevelId: data.gradeLevelId,
                room: data.room,
                name: data.name,
                capacity: data.capacity || 40,
                studyPlan: data.studyPlan,
                advisorId: data.advisorId,
            },
            include: {
                gradeLevel: true,
                academicYear: true,
                advisor: {
                    select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true },
                },
            },
        });
    }

    async update(id: string, data: UpdateClassroomDto) {
        const classroom = await this.prisma.classroom.findUnique({ where: { id } });
        if (!classroom) {
            throw new NotFoundException('ไม่พบข้อมูลห้องเรียน');
        }

        return this.prisma.classroom.update({
            where: { id },
            data,
            include: {
                gradeLevel: true,
                academicYear: true,
                advisor: {
                    select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true },
                },
            },
        });
    }

    async delete(id: string) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { id },
            include: { _count: { select: { students: true } } },
        });

        if (!classroom) {
            throw new NotFoundException('ไม่พบข้อมูลห้องเรียน');
        }

        if (classroom._count.students > 0) {
            throw new ConflictException('ไม่สามารถลบห้องเรียนที่มีนักเรียนอยู่ได้');
        }

        await this.prisma.classroom.delete({ where: { id } });

        return { message: 'ลบห้องเรียนสำเร็จ' };
    }

    async assignAdvisor(id: string, advisorId: string) {
        const classroom = await this.prisma.classroom.findUnique({ where: { id } });
        if (!classroom) {
            throw new NotFoundException('ไม่พบข้อมูลห้องเรียน');
        }

        const teacher = await this.prisma.teacher.findUnique({ where: { id: advisorId } });
        if (!teacher) {
            throw new NotFoundException('ไม่พบข้อมูลครู');
        }

        return this.prisma.classroom.update({
            where: { id },
            data: { advisorId },
            include: {
                gradeLevel: true,
                advisor: {
                    select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true },
                },
            },
        });
    }

    async removeAdvisor(id: string) {
        const classroom = await this.prisma.classroom.findUnique({ where: { id } });
        if (!classroom) {
            throw new NotFoundException('ไม่พบข้อมูลห้องเรียน');
        }

        return this.prisma.classroom.update({
            where: { id },
            data: { advisorId: null },
            include: {
                gradeLevel: true,
            },
        });
    }

    async getStudents(id: string) {
        const classroom = await this.prisma.classroom.findUnique({
            where: { id },
            include: {
                students: {
                    orderBy: { studentNumber: 'asc' },
                    include: {
                        user: { select: { email: true, isActive: true } },
                    },
                },
            },
        });

        if (!classroom) {
            throw new NotFoundException('ไม่พบข้อมูลห้องเรียน');
        }

        return classroom.students;
    }

    async getByAcademicYear(academicYearId: string) {
        return this.prisma.classroom.findMany({
            where: { academicYearId },
            orderBy: [
                { gradeLevel: { order: 'asc' } },
                { room: 'asc' },
            ],
            include: {
                gradeLevel: true,
                advisor: {
                    select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true },
                },
                _count: { select: { students: true } },
            },
        });
    }
}
