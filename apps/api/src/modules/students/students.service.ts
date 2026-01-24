// Students Service

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: {
        page?: number;
        limit?: number;
        classroomId?: string;
        gradeLevelId?: string;
        search?: string;
    }) {
        const { page = 1, limit = 20, classroomId, gradeLevelId, search } = params;

        const where: any = {};

        if (classroomId) {
            where.classroomId = classroomId;
        }

        if (gradeLevelId) {
            where.classroom = { gradeLevelId };
        }

        if (search) {
            where.OR = [
                { firstNameTh: { contains: search, mode: 'insensitive' } },
                { lastNameTh: { contains: search, mode: 'insensitive' } },
                { studentCode: { contains: search, mode: 'insensitive' } },
                { nationalId: { contains: search } },
            ];
        }

        return this.prisma.paginate('student', {
            page,
            limit,
            where,
            orderBy: [{ classroom: { gradeLevel: { order: 'asc' } } }, { studentNumber: 'asc' }],
            include: {
                user: { select: { email: true, isActive: true } },
                classroom: {
                    include: { gradeLevel: true },
                },
            },
        });
    }

    async findById(id: string) {
        const student = await this.prisma.student.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, email: true, isActive: true, createdAt: true } },
                classroom: { include: { gradeLevel: true, advisor: true } },
                parents: { include: { parent: true } },
            },
        });

        if (!student) {
            throw new NotFoundException('ไม่พบนักเรียน');
        }

        return student;
    }

    async create(data: {
        nationalId: string;
        studentCode: string;
        titleTh: string;
        firstNameTh: string;
        lastNameTh: string;
        gender: 'MALE' | 'FEMALE';
        birthDate: Date;
        classroomId: string;
        studentNumber: number;
        email: string;
        password?: string;
    }) {
        // Check for duplicate national ID
        const existingNationalId = await this.prisma.student.findUnique({
            where: { nationalId: data.nationalId },
        });
        if (existingNationalId) {
            throw new ConflictException('เลขประจำตัวประชาชนนี้ถูกใช้งานแล้ว');
        }

        // Check for duplicate student code
        const existingCode = await this.prisma.student.findUnique({
            where: { studentCode: data.studentCode },
        });
        if (existingCode) {
            throw new ConflictException('รหัสนักเรียนนี้ถูกใช้งานแล้ว');
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

        // Create user and student in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash,
                    role: 'STUDENT',
                },
            });

            const student = await tx.student.create({
                data: {
                    userId: user.id,
                    nationalId: data.nationalId,
                    studentCode: data.studentCode,
                    titleTh: data.titleTh,
                    firstNameTh: data.firstNameTh,
                    lastNameTh: data.lastNameTh,
                    gender: data.gender,
                    birthDate: data.birthDate,
                    classroomId: data.classroomId,
                    studentNumber: data.studentNumber,
                    enrollmentDate: new Date(),
                },
                include: {
                    user: { select: { email: true } },
                    classroom: { include: { gradeLevel: true } },
                },
            });

            return student;
        });

        return result;
    }

    async update(id: string, data: Partial<{
        titleTh: string;
        firstNameTh: string;
        lastNameTh: string;
        classroomId: string;
        studentNumber: number;
        address: string;
        photoUrl: string;
    }>) {
        const student = await this.prisma.student.findUnique({ where: { id } });
        if (!student) {
            throw new NotFoundException('ไม่พบนักเรียน');
        }

        return this.prisma.student.update({
            where: { id },
            data,
            include: {
                classroom: { include: { gradeLevel: true } },
            },
        });
    }

    async delete(id: string) {
        const student = await this.prisma.student.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!student) {
            throw new NotFoundException('ไม่พบนักเรียน');
        }

        // Delete student and user
        await this.prisma.$transaction([
            this.prisma.student.delete({ where: { id } }),
            this.prisma.user.delete({ where: { id: student.userId } }),
        ]);

        return { message: 'ลบนักเรียนสำเร็จ' };
    }

    async getByClassroom(classroomId: string) {
        return this.prisma.student.findMany({
            where: { classroomId },
            orderBy: { studentNumber: 'asc' },
            include: {
                user: { select: { email: true, isActive: true } },
            },
        });
    }
}
