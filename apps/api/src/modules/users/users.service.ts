// Users Service

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@school/database';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: { page?: number; limit?: number; role?: UserRole; search?: string }) {
        const { page = 1, limit = 20, role, search } = params;

        const where: any = {};

        if (role) {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { student: { firstNameTh: { contains: search, mode: 'insensitive' } } },
                { student: { lastNameTh: { contains: search, mode: 'insensitive' } } },
                { teacher: { firstNameTh: { contains: search, mode: 'insensitive' } } },
                { teacher: { lastNameTh: { contains: search, mode: 'insensitive' } } },
            ];
        }

        return this.prisma.paginate('user', {
            page,
            limit,
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                student: { select: { id: true, firstNameTh: true, lastNameTh: true, studentCode: true } },
                teacher: { select: { id: true, firstNameTh: true, lastNameTh: true, employeeCode: true } },
                parent: { select: { id: true, firstNameTh: true, lastNameTh: true } },
                admin: { select: { id: true, firstNameTh: true, lastNameTh: true, position: true } },
            },
        });
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                student: true,
                teacher: true,
                parent: true,
                admin: true,
            },
        });

        if (!user) {
            throw new NotFoundException('ไม่พบผู้ใช้');
        }

        const { passwordHash, ...result } = user;
        return result;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async updateStatus(id: string, isActive: boolean) {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException('ไม่พบผู้ใช้');
        }

        return this.prisma.user.update({
            where: { id },
            data: { isActive },
        });
    }

    async delete(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException('ไม่พบผู้ใช้');
        }

        return this.prisma.user.delete({ where: { id } });
    }
}
