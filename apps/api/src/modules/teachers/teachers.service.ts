// Teachers Service

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateTeacherDto, UpdateTeacherDto, TeacherQueryDto } from './dto';

@Injectable()
export class TeachersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: TeacherQueryDto) {
        const { page = 1, limit = 20, department, search } = params;

        const where: any = {};

        if (department) {
            where.department = department;
        }

        if (search) {
            where.OR = [
                { firstNameTh: { contains: search, mode: 'insensitive' } },
                { lastNameTh: { contains: search, mode: 'insensitive' } },
                { employeeCode: { contains: search, mode: 'insensitive' } },
                { nationalId: { contains: search } },
            ];
        }

        return this.prisma.paginate('teacher', {
            page,
            limit,
            where,
            orderBy: { firstNameTh: 'asc' },
            include: {
                user: { select: { email: true, isActive: true } },
            },
        });
    }

    async findById(id: string) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, email: true, isActive: true, createdAt: true } },
                teachingSubjects: {
                    include: {
                        subjectInstance: {
                            include: {
                                subject: { include: { subjectArea: true } },
                                semester: { include: { academicYear: true } },
                            },
                        },
                    },
                },
                advisorOf: {
                    include: { gradeLevel: true },
                },
            },
        });

        if (!teacher) {
            throw new NotFoundException('ไม่พบข้อมูลครู');
        }

        return teacher;
    }

    async create(data: CreateTeacherDto) {
        // Check for duplicate national ID
        const existingNationalId = await this.prisma.teacher.findUnique({
            where: { nationalId: data.nationalId },
        });
        if (existingNationalId) {
            throw new ConflictException('เลขประจำตัวประชาชนนี้ถูกใช้งานแล้ว');
        }

        // Check for duplicate employee code
        const existingCode = await this.prisma.teacher.findUnique({
            where: { employeeCode: data.employeeCode },
        });
        if (existingCode) {
            throw new ConflictException('รหัสพนักงานนี้ถูกใช้งานแล้ว');
        }

        // Check for duplicate email
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingEmail) {
            throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
        }

        // Generate default password if not provided
        const password = data.password || data.nationalId.slice(-6);
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user and teacher in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash,
                    role: 'TEACHER',
                },
            });

            const teacher = await tx.teacher.create({
                data: {
                    userId: user.id,
                    nationalId: data.nationalId,
                    employeeCode: data.employeeCode,
                    titleTh: data.titleTh,
                    firstNameTh: data.firstNameTh,
                    lastNameTh: data.lastNameTh,
                    titleEn: data.titleEn,
                    firstNameEn: data.firstNameEn,
                    lastNameEn: data.lastNameEn,
                    position: data.position,
                    department: data.department,
                    educationLevel: data.educationLevel,
                    specialization: data.specialization,
                },
                include: {
                    user: { select: { email: true } },
                },
            });

            return teacher;
        });

        return result;
    }

    async update(id: string, data: UpdateTeacherDto) {
        const teacher = await this.prisma.teacher.findUnique({ where: { id } });
        if (!teacher) {
            throw new NotFoundException('ไม่พบข้อมูลครู');
        }

        return this.prisma.teacher.update({
            where: { id },
            data,
            include: {
                user: { select: { email: true, isActive: true } },
            },
        });
    }

    async delete(id: string) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!teacher) {
            throw new NotFoundException('ไม่พบข้อมูลครู');
        }

        // Delete teacher and user in transaction
        await this.prisma.$transaction([
            this.prisma.teacher.delete({ where: { id } }),
            this.prisma.user.delete({ where: { id: teacher.userId } }),
        ]);

        return { message: 'ลบข้อมูลครูสำเร็จ' };
    }

    async getByDepartment(department: string) {
        return this.prisma.teacher.findMany({
            where: { department },
            orderBy: { firstNameTh: 'asc' },
            include: {
                user: { select: { email: true, isActive: true } },
            },
        });
    }

    async getDepartments() {
        const teachers = await this.prisma.teacher.findMany({
            select: { department: true },
            distinct: ['department'],
        });

        return teachers
            .map((t) => t.department)
            .filter((d): d is string => d !== null);
    }
}
