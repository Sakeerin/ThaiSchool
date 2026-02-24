// Grades Service Unit Tests
// Validates Thai grade scale logic, GPA/GPAX calculations — no DB needed

import { Test, TestingModule } from '@nestjs/testing';
import { GradesService } from './grades.service';
import { PrismaService } from '../../database/prisma.service';

const mockPrismaService = {
    grade: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    student: {
        findMany: jest.fn(),
    },
};

describe('GradesService', () => {
    let service: GradesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GradesService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<GradesService>(GradesService);
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // calculateGrade — Pure function, no DB
    // Thai Grade Scale (MoE standard)
    // ─────────────────────────────────────────────

    describe('calculateGrade', () => {
        const cases: [number, string, number][] = [
            [100, 'A', 4.0],
            [80, 'A', 4.0],
            [75, 'B+', 3.5],
            [70, 'B', 3.0],
            [65, 'C+', 2.5],
            [60, 'C', 2.0],
            [55, 'D+', 1.5],
            [50, 'D', 1.0],
            [49, 'F', 0],
            [0, 'F', 0],
        ];

        it.each(cases)(
            'score %i → grade %s (%.1f points)',
            (score, expectedLabel, expectedPoint) => {
                const result = service.calculateGrade(score);
                expect(result.label).toBe(expectedLabel);
                expect(result.point).toBe(expectedPoint);
            },
        );

        it('should return F for negative scores', () => {
            const result = service.calculateGrade(-5);
            expect(result.label).toBe('F');
            expect(result.point).toBe(0);
        });

        it('should return A at exactly 80', () => {
            const result = service.calculateGrade(80);
            expect(result.label).toBe('A');
        });

        it('should return B+ at exactly 75', () => {
            const result = service.calculateGrade(75);
            expect(result.label).toBe('B+');
        });
    });

    // ─────────────────────────────────────────────
    // calculateGPA
    // ─────────────────────────────────────────────

    describe('calculateGPA', () => {
        it('should return zero GPA when no grades exist', async () => {
            mockPrismaService.grade.findMany.mockResolvedValue([]);

            const result = await service.calculateGPA('student-1', 'semester-1');

            expect(result.gpa).toBe(0);
            expect(result.totalCredits).toBe(0);
            expect(result.grades).toHaveLength(0);
        });

        it('should calculate weighted GPA correctly', async () => {
            // Math (3 credits, A=4.0) + Thai (2 credits, B=3.0) = (4.0*3 + 3.0*2) / 5 = 3.6
            mockPrismaService.grade.findMany.mockResolvedValue([
                {
                    id: 'g1',
                    studentId: 'student-1',
                    gradePoint: 4.0,
                    subjectInstance: { semesterId: 'semester-1', subject: { code: 'MATH', credits: 3 } },
                },
                {
                    id: 'g2',
                    studentId: 'student-1',
                    gradePoint: 3.0,
                    subjectInstance: { semesterId: 'semester-1', subject: { code: 'THAI', credits: 2 } },
                },
            ]);

            const result = await service.calculateGPA('student-1', 'semester-1');

            expect(result.gpa).toBe(3.6);
            expect(result.totalCredits).toBe(5);
        });

        it('should round GPA to 2 decimal places', async () => {
            // 4.0 + 3.5 + 3.0 = 10.5 / 3 credits each → 3.5 exactly but test rounding
            mockPrismaService.grade.findMany.mockResolvedValue([
                { id: 'g1', gradePoint: 4.0, subjectInstance: { semesterId: 's1', subject: { credits: 1 } } },
                { id: 'g2', gradePoint: 3.0, subjectInstance: { semesterId: 's1', subject: { credits: 1 } } },
                { id: 'g3', gradePoint: 2.0, subjectInstance: { semesterId: 's1', subject: { credits: 1 } } },
            ]);

            const result = await service.calculateGPA('student-1', 'semester-1');

            // (4+3+2)/3 = 3.0
            expect(result.gpa).toBe(3.0);
            // Verify it's a number with at most 2 decimal places
            expect(result.gpa.toString().split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);
        });
    });

    // ─────────────────────────────────────────────
    // calculateGPAX
    // ─────────────────────────────────────────────

    describe('calculateGPAX', () => {
        it('should return zero GPAX when no grades exist', async () => {
            mockPrismaService.grade.findMany.mockResolvedValue([]);

            const result = await service.calculateGPAX('student-1');

            expect(result.gpax).toBe(0);
            expect(result.totalCredits).toBe(0);
            expect(result.semesters).toHaveLength(0);
        });

        it('should calculate cumulative GPAX across multiple semesters', async () => {
            mockPrismaService.grade.findMany.mockResolvedValue([
                // Semester 1: 4.0 × 3 credits
                {
                    id: 'g1',
                    gradePoint: 4.0,
                    subjectInstance: {
                        semesterId: 'sem-1',
                        subject: { credits: 3 },
                        semester: { number: 1, academicYear: { year: 2567 } },
                    },
                },
                // Semester 2: 2.0 × 3 credits
                {
                    id: 'g2',
                    gradePoint: 2.0,
                    subjectInstance: {
                        semesterId: 'sem-2',
                        subject: { credits: 3 },
                        semester: { number: 2, academicYear: { year: 2567 } },
                    },
                },
            ]);

            const result = await service.calculateGPAX('student-1');

            // (4.0*3 + 2.0*3) / 6 = 18/6 = 3.0
            expect(result.gpax).toBe(3.0);
            expect(result.totalCredits).toBe(6);
            expect(result.semesters).toHaveLength(2);
        });

        it('should sort semesters by year then number ascending', async () => {
            mockPrismaService.grade.findMany.mockResolvedValue([
                {
                    id: 'g1',
                    gradePoint: 4.0,
                    subjectInstance: {
                        semesterId: 'sem-2',
                        subject: { credits: 1 },
                        semester: { number: 2, academicYear: { year: 2567 } },
                    },
                },
                {
                    id: 'g2',
                    gradePoint: 3.0,
                    subjectInstance: {
                        semesterId: 'sem-1',
                        subject: { credits: 1 },
                        semester: { number: 1, academicYear: { year: 2567 } },
                    },
                },
            ]);

            const result = await service.calculateGPAX('student-1');
            const semNumbers = result.semesters.map((s: any) => s.semester.number);
            expect(semNumbers).toEqual([1, 2]);
        });
    });
});
