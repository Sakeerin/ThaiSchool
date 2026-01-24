// Auth Service - Authentication logic

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RegisterDto, AuthResponse } from './dto/auth.dto';
import { UserRole } from '@school/database';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                student: true,
                teacher: true,
                parent: true,
                admin: true,
            },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }

        const { passwordHash, ...result } = user;
        return result;
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: this.getUserProfile(user),
            },
        };
    }

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        // Check if email exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(registerDto.password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                passwordHash,
                role: registerDto.role as UserRole,
            },
        });

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: null,
            },
        };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('ไม่พบผู้ใช้');
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: {
                    include: {
                        classroom: {
                            include: {
                                gradeLevel: true,
                            },
                        },
                    },
                },
                teacher: true,
                parent: {
                    include: {
                        children: {
                            include: {
                                student: {
                                    include: {
                                        classroom: {
                                            include: {
                                                gradeLevel: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                admin: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('ไม่พบผู้ใช้');
        }

        const { passwordHash, ...result } = user;
        return result;
    }

    private getUserProfile(user: any) {
        if (user.student) {
            return {
                type: 'student',
                name: `${user.student.firstNameTh} ${user.student.lastNameTh}`,
                code: user.student.studentCode,
            };
        }
        if (user.teacher) {
            return {
                type: 'teacher',
                name: `${user.teacher.titleTh}${user.teacher.firstNameTh} ${user.teacher.lastNameTh}`,
                code: user.teacher.employeeCode,
            };
        }
        if (user.parent) {
            return {
                type: 'parent',
                name: `${user.parent.titleTh}${user.parent.firstNameTh} ${user.parent.lastNameTh}`,
            };
        }
        if (user.admin) {
            return {
                type: 'admin',
                name: `${user.admin.titleTh}${user.admin.firstNameTh} ${user.admin.lastNameTh}`,
                position: user.admin.position,
            };
        }
        return null;
    }
}
