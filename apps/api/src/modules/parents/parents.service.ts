// Parents Service

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateParentDto, UpdateParentDto, ParentQueryDto, LinkStudentDto } from './dto';

@Injectable()
export class ParentsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: ParentQueryDto) {
        const { page = 1, limit = 20, search } = params;

        const where: any = {};

        if (search) {
            where.OR = [
                { firstNameTh: { contains: search, mode: 'insensitive' } },
                { lastNameTh: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }

        return this.prisma.paginate('parent', {
            page,
            limit,
            where,
            orderBy: { firstNameTh: 'asc' },
            include: {
                user: { select: { email: true, isActive: true } },
                children: {
                    include: {
                        student: {
                            include: { classroom: { include: { gradeLevel: true } } },
                        },
                    },
                },
            },
        });
    }

    async findById(id: string) {
        const parent = await this.prisma.parent.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, email: true, isActive: true, createdAt: true } },
                children: {
                    include: {
                        student: {
                            include: {
                                classroom: { include: { gradeLevel: true, advisor: true } },
                                user: { select: { email: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!parent) {
            throw new NotFoundException('ไม่พบข้อมูลผู้ปกครอง');
        }

        return parent;
    }

    async create(data: CreateParentDto) {
        // Check for duplicate email
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingEmail) {
            throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
        }

        // Check for duplicate phone
        const existingPhone = await this.prisma.user.findUnique({
            where: { phone: data.phone },
        });
        if (existingPhone) {
            throw new ConflictException('เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว');
        }

        // Generate default password if not provided
        const password = data.password || data.phone.slice(-6);
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user and parent in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    phone: data.phone,
                    passwordHash,
                    role: 'PARENT',
                },
            });

            const parent = await tx.parent.create({
                data: {
                    userId: user.id,
                    titleTh: data.titleTh,
                    firstNameTh: data.firstNameTh,
                    lastNameTh: data.lastNameTh,
                    relationship: data.relationship,
                    phone: data.phone,
                    lineId: data.lineId,
                    occupation: data.occupation,
                    workplace: data.workplace,
                    address: data.address,
                },
                include: {
                    user: { select: { email: true } },
                },
            });

            // Link students if provided
            if (data.studentIds && data.studentIds.length > 0) {
                for (const studentId of data.studentIds) {
                    await tx.studentParent.create({
                        data: {
                            studentId,
                            parentId: parent.id,
                            isPrimary: data.studentIds.indexOf(studentId) === 0,
                        },
                    });
                }
            }

            return parent;
        });

        return result;
    }

    async update(id: string, data: UpdateParentDto) {
        const parent = await this.prisma.parent.findUnique({ where: { id } });
        if (!parent) {
            throw new NotFoundException('ไม่พบข้อมูลผู้ปกครอง');
        }

        return this.prisma.parent.update({
            where: { id },
            data,
            include: {
                user: { select: { email: true, isActive: true } },
            },
        });
    }

    async delete(id: string) {
        const parent = await this.prisma.parent.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!parent) {
            throw new NotFoundException('ไม่พบข้อมูลผู้ปกครอง');
        }

        // Delete parent-student links, parent, and user in transaction
        await this.prisma.$transaction([
            this.prisma.studentParent.deleteMany({ where: { parentId: id } }),
            this.prisma.parent.delete({ where: { id } }),
            this.prisma.user.delete({ where: { id: parent.userId } }),
        ]);

        return { message: 'ลบข้อมูลผู้ปกครองสำเร็จ' };
    }

    async linkStudent(parentId: string, data: LinkStudentDto) {
        const parent = await this.prisma.parent.findUnique({ where: { id: parentId } });
        if (!parent) {
            throw new NotFoundException('ไม่พบข้อมูลผู้ปกครอง');
        }

        const student = await this.prisma.student.findUnique({ where: { id: data.studentId } });
        if (!student) {
            throw new NotFoundException('ไม่พบข้อมูลนักเรียน');
        }

        // Check if already linked
        const existing = await this.prisma.studentParent.findUnique({
            where: {
                studentId_parentId: {
                    studentId: data.studentId,
                    parentId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('ผู้ปกครองเชื่อมต่อกับนักเรียนนี้แล้ว');
        }

        return this.prisma.studentParent.create({
            data: {
                studentId: data.studentId,
                parentId,
                isPrimary: data.isPrimary || false,
            },
            include: {
                student: { include: { classroom: { include: { gradeLevel: true } } } },
                parent: true,
            },
        });
    }

    async unlinkStudent(parentId: string, studentId: string) {
        const link = await this.prisma.studentParent.findUnique({
            where: {
                studentId_parentId: {
                    studentId,
                    parentId,
                },
            },
        });

        if (!link) {
            throw new NotFoundException('ไม่พบความสัมพันธ์ระหว่างผู้ปกครองและนักเรียน');
        }

        await this.prisma.studentParent.delete({
            where: { id: link.id },
        });

        return { message: 'ยกเลิกการเชื่อมต่อสำเร็จ' };
    }

    async getChildren(parentId: string) {
        const parent = await this.prisma.parent.findUnique({
            where: { id: parentId },
            include: {
                children: {
                    include: {
                        student: {
                            include: {
                                classroom: { include: { gradeLevel: true } },
                                user: { select: { email: true, isActive: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!parent) {
            throw new NotFoundException('ไม่พบข้อมูลผู้ปกครอง');
        }

        return parent.children.map((c) => ({
            ...c.student,
            isPrimary: c.isPrimary,
        }));
    }
}
