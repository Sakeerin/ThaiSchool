// Grades Service
// Thai Grading System: 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0 (A, B+, B, C+, C, D+, D, F)

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateGradeDto, UpdateGradeDto, BulkGradeDto, GradeQueryDto } from './dto';

// Thai Grade Scale
const GRADE_SCALE = [
    { min: 80, label: 'A', point: 4.0 },
    { min: 75, label: 'B+', point: 3.5 },
    { min: 70, label: 'B', point: 3.0 },
    { min: 65, label: 'C+', point: 2.5 },
    { min: 60, label: 'C', point: 2.0 },
    { min: 55, label: 'D+', point: 1.5 },
    { min: 50, label: 'D', point: 1.0 },
    { min: 0, label: 'F', point: 0 },
];

@Injectable()
export class GradesService {
    constructor(private readonly prisma: PrismaService) { }

    calculateGrade(percentage: number): { label: string; point: number } {
        const grade = GRADE_SCALE.find((g) => percentage >= g.min);
        return grade || { label: 'F', point: 0 };
    }

    async findByStudent(studentId: string, semesterId?: string) {
        const where: any = { studentId };

        if (semesterId) {
            where.subjectInstance = { semesterId };
        }

        return this.prisma.grade.findMany({
            where,
            include: {
                subjectInstance: {
                    include: {
                        subject: { include: { subjectArea: true } },
                        semester: { include: { academicYear: true } },
                    },
                },
                gradingPeriod: true,
            },
            orderBy: { subjectInstance: { subject: { code: 'asc' } } },
        });
    }

    async findBySubjectInstance(subjectInstanceId: string) {
        return this.prisma.grade.findMany({
            where: { subjectInstanceId },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        titleTh: true,
                        firstNameTh: true,
                        lastNameTh: true,
                        studentNumber: true,
                        classroom: { include: { gradeLevel: true } },
                    },
                },
                gradingPeriod: true,
            },
            orderBy: { student: { studentNumber: 'asc' } },
        });
    }

    async create(data: CreateGradeDto) {
        // Calculate total and grade
        const { totalScore, percentage, gradeInfo } = this.calculateTotal(data);

        return this.prisma.grade.create({
            data: {
                studentId: data.studentId,
                subjectInstanceId: data.subjectInstanceId,
                gradingPeriodId: data.gradingPeriodId,
                classworkScore: data.classworkScore,
                midtermScore: data.midtermScore,
                finalScore: data.finalScore,
                behaviorScore: data.behaviorScore,
                totalScore,
                percentage,
                gradePoint: gradeInfo.point,
                gradeLabel: gradeInfo.label,
                remarks: data.remarks,
            },
            include: {
                student: { select: { firstNameTh: true, lastNameTh: true } },
            },
        });
    }

    async update(id: string, data: UpdateGradeDto) {
        const grade = await this.prisma.grade.findUnique({ where: { id } });
        if (!grade) {
            throw new NotFoundException('ไม่พบข้อมูลเกรด');
        }

        // Merge existing data with updates
        const merged = {
            classworkScore: data.classworkScore ?? grade.classworkScore,
            midtermScore: data.midtermScore ?? grade.midtermScore,
            finalScore: data.finalScore ?? grade.finalScore,
            behaviorScore: data.behaviorScore ?? grade.behaviorScore,
        };

        const { totalScore, percentage, gradeInfo } = this.calculateTotal(merged);

        return this.prisma.grade.update({
            where: { id },
            data: {
                ...data,
                totalScore,
                percentage,
                gradePoint: gradeInfo.point,
                gradeLabel: gradeInfo.label,
            },
        });
    }

    async bulkCreateOrUpdate(data: BulkGradeDto) {
        const results = [];

        for (const gradeData of data.grades) {
            // Check if grade exists
            const existing = await this.prisma.grade.findFirst({
                where: {
                    studentId: gradeData.studentId,
                    subjectInstanceId: data.subjectInstanceId,
                    gradingPeriodId: data.gradingPeriodId || null,
                },
            });

            const { totalScore, percentage, gradeInfo } = this.calculateTotal(gradeData);

            if (existing) {
                const updated = await this.prisma.grade.update({
                    where: { id: existing.id },
                    data: {
                        classworkScore: gradeData.classworkScore,
                        midtermScore: gradeData.midtermScore,
                        finalScore: gradeData.finalScore,
                        totalScore,
                        percentage,
                        gradePoint: gradeInfo.point,
                        gradeLabel: gradeInfo.label,
                    },
                });
                results.push(updated);
            } else {
                const created = await this.prisma.grade.create({
                    data: {
                        studentId: gradeData.studentId,
                        subjectInstanceId: data.subjectInstanceId,
                        gradingPeriodId: data.gradingPeriodId,
                        classworkScore: gradeData.classworkScore,
                        midtermScore: gradeData.midtermScore,
                        finalScore: gradeData.finalScore,
                        totalScore,
                        percentage,
                        gradePoint: gradeInfo.point,
                        gradeLabel: gradeInfo.label,
                    },
                });
                results.push(created);
            }
        }

        return results;
    }

    private calculateTotal(data: {
        classworkScore?: number | null;
        midtermScore?: number | null;
        finalScore?: number | null;
    }) {
        // Default weights: classwork 30%, midterm 20%, final 50%
        const classwork = data.classworkScore ?? 0;
        const midterm = data.midtermScore ?? 0;
        const final_ = data.finalScore ?? 0;

        // Assuming scores are out of 100
        const totalScore = classwork * 0.3 + midterm * 0.2 + final_ * 0.5;
        const percentage = totalScore;
        const gradeInfo = this.calculateGrade(percentage);

        return { totalScore, percentage, gradeInfo };
    }

    // =====================
    // GPA Calculation
    // =====================

    async calculateGPA(studentId: string, semesterId: string) {
        const grades = await this.prisma.grade.findMany({
            where: {
                studentId,
                subjectInstance: { semesterId },
                gradePoint: { not: null },
            },
            include: {
                subjectInstance: {
                    include: { subject: true },
                },
            },
        });

        if (grades.length === 0) {
            return { gpa: 0, totalCredits: 0, grades: [] };
        }

        let totalPoints = 0;
        let totalCredits = 0;

        for (const grade of grades) {
            const credits = grade.subjectInstance.subject.credits;
            totalPoints += (grade.gradePoint ?? 0) * credits;
            totalCredits += credits;
        }

        const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

        return {
            gpa: Math.round(gpa * 100) / 100,
            totalCredits,
            grades,
        };
    }

    async calculateGPAX(studentId: string) {
        // Calculate cumulative GPA across all semesters
        const grades = await this.prisma.grade.findMany({
            where: {
                studentId,
                gradePoint: { not: null },
            },
            include: {
                subjectInstance: {
                    include: {
                        subject: true,
                        semester: { include: { academicYear: true } },
                    },
                },
            },
        });

        if (grades.length === 0) {
            return { gpax: 0, totalCredits: 0, semesters: [] };
        }

        // Group by semester and calculate
        const semesterMap = new Map<string, { semester: any; grades: any[] }>();

        for (const grade of grades) {
            const semesterId = grade.subjectInstance.semesterId;
            if (!semesterMap.has(semesterId)) {
                semesterMap.set(semesterId, {
                    semester: grade.subjectInstance.semester,
                    grades: [],
                });
            }
            semesterMap.get(semesterId)!.grades.push(grade);
        }

        let totalPoints = 0;
        let totalCredits = 0;
        const semesters = [];

        for (const [_, data] of semesterMap) {
            let semesterPoints = 0;
            let semesterCredits = 0;

            for (const grade of data.grades) {
                const credits = grade.subjectInstance.subject.credits;
                semesterPoints += (grade.gradePoint ?? 0) * credits;
                semesterCredits += credits;
            }

            totalPoints += semesterPoints;
            totalCredits += semesterCredits;

            semesters.push({
                semester: data.semester,
                gpa: semesterCredits > 0 ? Math.round((semesterPoints / semesterCredits) * 100) / 100 : 0,
                credits: semesterCredits,
            });
        }

        const gpax = totalCredits > 0 ? totalPoints / totalCredits : 0;

        return {
            gpax: Math.round(gpax * 100) / 100,
            totalCredits,
            semesters: semesters.sort((a, b) =>
                a.semester.academicYear.year - b.semester.academicYear.year ||
                a.semester.number - b.semester.number
            ),
        };
    }

    async getClassroomGrades(classroomId: string, semesterId: string) {
        const students = await this.prisma.student.findMany({
            where: { classroomId },
            include: {
                grades: {
                    where: { subjectInstance: { semesterId } },
                    include: {
                        subjectInstance: { include: { subject: true } },
                    },
                },
            },
            orderBy: { studentNumber: 'asc' },
        });

        return students.map((student) => ({
            student: {
                id: student.id,
                studentCode: student.studentCode,
                name: `${student.titleTh}${student.firstNameTh} ${student.lastNameTh}`,
                studentNumber: student.studentNumber,
            },
            grades: student.grades,
        }));
    }
}
