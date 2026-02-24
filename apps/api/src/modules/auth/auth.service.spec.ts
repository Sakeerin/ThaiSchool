// Auth Service Unit Tests

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

const mockPrismaService = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
};

const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // validateUser
    // ─────────────────────────────────────────────

    describe('validateUser', () => {
        const activeUser = {
            id: 'user-1',
            email: 'teacher@school.ac.th',
            passwordHash: 'hashed-password',
            role: 'TEACHER',
            isActive: true,
            student: null,
            teacher: { id: 't-1', titleTh: 'นาย', firstNameTh: 'สมชาย', lastNameTh: 'ใจดี', employeeCode: 'T001' },
            parent: null,
            admin: null,
        };

        it('should return user data without passwordHash on valid credentials', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(activeUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('teacher@school.ac.th', 'password123');

            expect(result).not.toHaveProperty('passwordHash');
            expect(result.email).toBe('teacher@school.ac.th');
            expect(result.role).toBe('TEACHER');
        });

        it('should throw UnauthorizedException when user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.validateUser('notexist@school.ac.th', 'pass')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException when user is inactive', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({ ...activeUser, isActive: false });

            await expect(service.validateUser('teacher@school.ac.th', 'password123')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException on wrong password', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(activeUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.validateUser('teacher@school.ac.th', 'wrongpass')).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    // ─────────────────────────────────────────────
    // login
    // ─────────────────────────────────────────────

    describe('login', () => {
        it('should return access token and user info on successful login', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'teacher@school.ac.th',
                passwordHash: 'hashed',
                role: 'TEACHER',
                isActive: true,
                student: null,
                teacher: { id: 't-1', titleTh: 'นาย', firstNameTh: 'สมชาย', lastNameTh: 'ใจดี', employeeCode: 'T001' },
                parent: null,
                admin: null,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.login({ email: 'teacher@school.ac.th', password: 'password123' });

            expect(result.accessToken).toBe('mock-jwt-token');
            expect(result.user.email).toBe('teacher@school.ac.th');
            expect(result.user.role).toBe('TEACHER');
            expect(result.user.profile).not.toBeNull();
            expect(result.user.profile?.type).toBe('teacher');
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: 'user-1',
                email: 'teacher@school.ac.th',
                role: 'TEACHER',
            });
        });

        it('should update lastLoginAt on successful login', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'admin@school.ac.th',
                passwordHash: 'hashed',
                role: 'ADMIN',
                isActive: true,
                student: null,
                teacher: null,
                parent: null,
                admin: { id: 'a-1', titleTh: 'นาย', firstNameTh: 'ผู้', lastNameTh: 'ดูแล', position: 'ผู้อำนวยการ' },
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await service.login({ email: 'admin@school.ac.th', password: 'Admin123!' });

            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: expect.objectContaining({ lastLoginAt: expect.any(Date) }),
            });
        });
    });

    // ─────────────────────────────────────────────
    // register
    // ─────────────────────────────────────────────

    describe('register', () => {
        it('should create a user and return access token', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null); // no existing user
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
            mockPrismaService.user.create.mockResolvedValue({
                id: 'user-new',
                email: 'new@school.ac.th',
                role: 'STUDENT',
            });

            const result = await service.register({
                email: 'new@school.ac.th',
                password: 'Password1!',
                role: 'STUDENT',
            });

            expect(result.accessToken).toBe('mock-jwt-token');
            expect(result.user.email).toBe('new@school.ac.th');
            expect(result.user.profile).toBeNull();
        });

        it('should throw ConflictException if email already exists', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing', email: 'dup@school.ac.th' });

            await expect(
                service.register({ email: 'dup@school.ac.th', password: 'Password1!', role: 'STUDENT' }),
            ).rejects.toThrow(ConflictException);
        });
    });

    // ─────────────────────────────────────────────
    // changePassword
    // ─────────────────────────────────────────────

    describe('changePassword', () => {
        it('should update passwordHash on valid current password', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                id: 'user-1',
                passwordHash: 'old-hash',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
            mockPrismaService.user.update.mockResolvedValue({});

            await service.changePassword('user-1', 'oldPass', 'NewPass1!');

            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: { passwordHash: 'new-hash' },
            });
        });

        it('should throw UnauthorizedException when user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.changePassword('ghost', 'old', 'New1!')).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException on wrong current password', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1', passwordHash: 'hash' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.changePassword('user-1', 'wrongOld', 'New1!')).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });
});
