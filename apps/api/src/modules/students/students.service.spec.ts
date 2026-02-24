// Students Service Unit Tests

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StudentsService } from './students.service';
import { PrismaService } from '../../database/prisma.service';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn(),
}));

const mockStudent = {
    id: 'student-1',
    userId: 'user-1',
    nationalId: '1234567890123',
    studentCode: 'S001',
    titleTh: 'เด็กชาย',
    firstNameTh: 'สมชาย',
    lastNameTh: 'ใจดี',
    gender: 'MALE',
    classroomId: 'classroom-1',
    studentNumber: 1,
    user: { id: 'user-1', email: 'student@school.ac.th', isActive: true },
    classroom: { id: 'classroom-1', gradeLevel: { id: 'gl-1', name: 'ป.1' } },
    parents: [],
};

const mockPrismaService = {
    student: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    paginate: jest.fn(),
    $transaction: jest.fn(),
};

describe('StudentsService', () => {
    let service: StudentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StudentsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<StudentsService>(StudentsService);
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // findById
    // ─────────────────────────────────────────────

    describe('findById', () => {
        it('should return a student by ID', async () => {
            mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);

            const result = await service.findById('student-1');

            expect(result).toEqual(mockStudent);
            expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 'student-1' } }),
            );
        });

        it('should throw NotFoundException when student not found', async () => {
            mockPrismaService.student.findUnique.mockResolvedValue(null);

            await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });

    // ─────────────────────────────────────────────
    // create
    // ─────────────────────────────────────────────

    describe('create', () => {
        const createData = {
            nationalId: '1234567890123',
            studentCode: 'S002',
            titleTh: 'เด็กหญิง',
            firstNameTh: 'สมหญิง',
            lastNameTh: 'ใจดี',
            gender: 'FEMALE' as const,
            birthDate: new Date('2015-01-01'),
            classroomId: 'classroom-1',
            studentNumber: 2,
            email: 'newstudent@school.ac.th',
        };

        it('should create student with user in transaction', async () => {
            mockPrismaService.student.findUnique.mockResolvedValue(null);
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.$transaction.mockImplementation(async (cb: any) => {
                const tx = {
                    user: { create: jest.fn().mockResolvedValue({ id: 'user-new', email: createData.email, role: 'STUDENT' }) },
                    student: { create: jest.fn().mockResolvedValue({ ...mockStudent, id: 'student-new' }) },
                };
                return cb(tx);
            });

            const result = await service.create(createData);

            expect(result).toBeDefined();
            expect(mockPrismaService.$transaction).toHaveBeenCalled();
        });

        it('should throw ConflictException on duplicate nationalId', async () => {
            mockPrismaService.student.findUnique.mockResolvedValueOnce(mockStudent); // nationalId conflict

            await expect(service.create(createData)).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException on duplicate studentCode', async () => {
            mockPrismaService.student.findUnique
                .mockResolvedValueOnce(null)  // nationalId OK
                .mockResolvedValueOnce(mockStudent); // studentCode conflict

            await expect(service.create(createData)).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException on duplicate email', async () => {
            mockPrismaService.student.findUnique
                .mockResolvedValueOnce(null) // nationalId OK
                .mockResolvedValueOnce(null); // studentCode OK
            mockPrismaService.user.findUnique.mockResolvedValue({ id: 'other-user', email: createData.email });

            await expect(service.create(createData)).rejects.toThrow(ConflictException);
        });

        it('should use last 6 digits of nationalId as default password', async () => {
            mockPrismaService.student.findUnique.mockResolvedValue(null);
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.$transaction.mockResolvedValue(mockStudent);

            await service.create(createData);

            // nationalId is '1234567890123', last 6 = '890123'
            expect(bcrypt.hash).toHaveBeenCalledWith('890123', 10);
        });
    });

    // ─────────────────────────────────────────────
    // update
    // ─────────────────────────────────────────────

    describe('update', () => {
        it('should update a student record', async () => {
            mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
            mockPrismaService.student.update.mockResolvedValue({ ...mockStudent, firstNameTh: 'สมชาย_updated' });

            const result = await service.update('student-1', { firstNameTh: 'สมชาย_updated' });

            expect(result.firstNameTh).toBe('สมชาย_updated');
        });

        it('should throw NotFoundException when student does not exist', async () => {
            mockPrismaService.student.findUnique.mockResolvedValue(null);

            await expect(service.update('ghost', { firstNameTh: 'Test' })).rejects.toThrow(NotFoundException);
        });
    });

    // ─────────────────────────────────────────────
    // delete
    // ─────────────────────────────────────────────

    describe('delete', () => {
        it('should delete student and associated user', async () => {
            mockPrismaService.student.findUnique.mockResolvedValue({ ...mockStudent, user: { id: 'user-1' } });
            mockPrismaService.$transaction.mockResolvedValue([{}, {}]);

            const result = await service.delete('student-1');

            expect(result.message).toContain('สำเร็จ');
            expect(mockPrismaService.$transaction).toHaveBeenCalled();
        });

        it('should throw NotFoundException when student not found', async () => {
            mockPrismaService.student.findUnique.mockResolvedValue(null);

            await expect(service.delete('ghost')).rejects.toThrow(NotFoundException);
        });
    });
});
