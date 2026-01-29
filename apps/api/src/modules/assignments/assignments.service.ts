// Assignments Service

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateAssignmentDto,
    UpdateAssignmentDto,
    SubmitAssignmentDto,
    GradeSubmissionDto,
    AssignmentQueryDto,
} from './dto';

@Injectable()
export class AssignmentsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: AssignmentQueryDto) {
        const { page = 1, limit = 20, subjectInstanceId, type, isPublished, search } = params;

        const where: any = {};

        if (subjectInstanceId) {
            where.subjectInstanceId = subjectInstanceId;
        }

        if (type) {
            where.type = type;
        }

        if (isPublished !== undefined) {
            where.isPublished = isPublished;
        }

        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        return this.prisma.paginate('assignment', {
            page,
            limit,
            where,
            orderBy: { dueDate: 'asc' },
            include: {
                subjectInstance: {
                    include: {
                        subject: { include: { subjectArea: true } },
                    },
                },
                createdBy: {
                    select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true },
                },
                _count: { select: { submissions: true } },
            },
        });
    }

    async findById(id: string) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
            include: {
                subjectInstance: {
                    include: {
                        subject: { include: { subjectArea: true } },
                        semester: { include: { academicYear: true } },
                    },
                },
                createdBy: {
                    select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true },
                },
                submissions: {
                    include: {
                        student: {
                            select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true, studentNumber: true },
                        },
                    },
                    orderBy: { submittedAt: 'desc' },
                },
            },
        });

        if (!assignment) {
            throw new NotFoundException('ไม่พบงาน');
        }

        return assignment;
    }

    async create(data: CreateAssignmentDto, teacherId: string) {
        return this.prisma.assignment.create({
            data: {
                subjectInstanceId: data.subjectInstanceId,
                title: data.title,
                description: data.description,
                instructions: data.instructions,
                type: data.type,
                maxScore: data.maxScore || 100,
                weight: data.weight || 1.0,
                dueDate: data.dueDate,
                allowLateSubmission: data.allowLateSubmission ?? true,
                latePenaltyPercent: data.latePenaltyPercent || 10,
                createdById: teacherId,
            },
            include: {
                subjectInstance: {
                    include: { subject: true },
                },
            },
        });
    }

    async update(id: string, data: UpdateAssignmentDto) {
        const assignment = await this.prisma.assignment.findUnique({ where: { id } });
        if (!assignment) {
            throw new NotFoundException('ไม่พบงาน');
        }

        const updateData: any = { ...data };

        if (data.isPublished === true && !assignment.isPublished) {
            updateData.publishedAt = new Date();
        }

        return this.prisma.assignment.update({
            where: { id },
            data: updateData,
        });
    }

    async delete(id: string) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
            include: { _count: { select: { submissions: true } } },
        });

        if (!assignment) {
            throw new NotFoundException('ไม่พบงาน');
        }

        if (assignment._count.submissions > 0) {
            throw new ConflictException('ไม่สามารถลบงานที่มีการส่งแล้ว');
        }

        await this.prisma.assignment.delete({ where: { id } });

        return { message: 'ลบงานสำเร็จ' };
    }

    async publish(id: string) {
        const assignment = await this.prisma.assignment.findUnique({ where: { id } });
        if (!assignment) {
            throw new NotFoundException('ไม่พบงาน');
        }

        return this.prisma.assignment.update({
            where: { id },
            data: {
                isPublished: true,
                publishedAt: new Date(),
            },
        });
    }

    async unpublish(id: string) {
        const assignment = await this.prisma.assignment.findUnique({ where: { id } });
        if (!assignment) {
            throw new NotFoundException('ไม่พบงาน');
        }

        return this.prisma.assignment.update({
            where: { id },
            data: {
                isPublished: false,
            },
        });
    }

    async findByTeacher(teacherId: string) {
        return this.prisma.assignment.findMany({
            where: { createdById: teacherId },
            orderBy: { createdAt: 'desc' },
            include: {
                subjectInstance: {
                    include: {
                        subject: { include: { subjectArea: true } },
                        semester: { include: { academicYear: true } },
                    },
                },
                _count: { select: { submissions: true } },
            },
        });
    }

    async getSubjectInstancesForTeacher(teacherId: string) {
        const teachings = await this.prisma.teachingAssignment.findMany({
            where: { teacherId },
            include: {
                subjectInstance: {
                    include: {
                        subject: { include: { subjectArea: true } },
                        semester: { include: { academicYear: true } },
                    },
                },
            },
        });

        return teachings.map(t => t.subjectInstance);
    }

    async findForStudent(studentId: string) {
        // Get student's enrolled subject instances
        const enrollments = await this.prisma.subjectEnrollment.findMany({
            where: { studentId },
            select: { subjectInstanceId: true },
        });

        const subjectInstanceIds = enrollments.map(e => e.subjectInstanceId);

        // Get published assignments for those subjects
        const assignments = await this.prisma.assignment.findMany({
            where: {
                subjectInstanceId: { in: subjectInstanceIds },
                isPublished: true,
            },
            orderBy: { dueDate: 'asc' },
            include: {
                subjectInstance: {
                    include: {
                        subject: { include: { subjectArea: true } },
                    },
                },
                submissions: {
                    where: { studentId },
                    take: 1,
                },
                _count: { select: { submissions: true } },
            },
        });

        // Transform to include student's submission status
        return assignments.map(assignment => ({
            ...assignment,
            mySubmission: assignment.submissions[0] || null,
            submissions: undefined,
        }));
    }

    // =====================
    // Submissions
    // =====================

    async submit(assignmentId: string, studentId: string, data: SubmitAssignmentDto) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: assignmentId },
        });

        if (!assignment) {
            throw new NotFoundException('ไม่พบงาน');
        }

        if (!assignment.isPublished) {
            throw new BadRequestException('งานนี้ยังไม่เปิดให้ส่ง');
        }

        // Check if already submitted
        const existing = await this.prisma.submission.findUnique({
            where: {
                assignmentId_studentId: {
                    assignmentId,
                    studentId,
                },
            },
        });

        if (existing && existing.status !== 'PENDING' && existing.status !== 'RETURNED') {
            throw new ConflictException('ได้ส่งงานนี้แล้ว');
        }

        const now = new Date();
        const isLate = now > assignment.dueDate;

        if (isLate && !assignment.allowLateSubmission) {
            throw new BadRequestException('งานนี้ไม่อนุญาตให้ส่งหลังกำหนด');
        }

        if (existing) {
            // Update existing submission
            return this.prisma.submission.update({
                where: { id: existing.id },
                data: {
                    content: data.content,
                    files: data.files,
                    status: 'SUBMITTED',
                    submittedAt: now,
                    isLate,
                },
            });
        }

        return this.prisma.submission.create({
            data: {
                assignmentId,
                studentId,
                content: data.content,
                files: data.files,
                status: 'SUBMITTED',
                submittedAt: now,
                isLate,
            },
        });
    }

    async gradeSubmission(submissionId: string, data: GradeSubmissionDto, teacherId: string) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: { assignment: true },
        });

        if (!submission) {
            throw new NotFoundException('ไม่พบการส่งงาน');
        }

        if (data.score > submission.assignment.maxScore) {
            throw new BadRequestException(`คะแนนต้องไม่เกิน ${submission.assignment.maxScore}`);
        }

        // Apply late penalty if applicable
        let finalScore = data.score;
        if (submission.isLate && submission.assignment.latePenaltyPercent > 0) {
            const penalty = (submission.assignment.latePenaltyPercent / 100) * data.score;
            finalScore = Math.max(0, data.score - penalty);
        }

        return this.prisma.submission.update({
            where: { id: submissionId },
            data: {
                score: finalScore,
                feedback: data.feedback,
                gradedById: teacherId,
                gradedAt: new Date(),
                status: 'GRADED',
            },
        });
    }

    async returnSubmission(submissionId: string, feedback: string) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
        });

        if (!submission) {
            throw new NotFoundException('ไม่พบการส่งงาน');
        }

        return this.prisma.submission.update({
            where: { id: submissionId },
            data: {
                status: 'RETURNED',
                feedback,
            },
        });
    }

    async getStudentSubmissions(studentId: string) {
        return this.prisma.submission.findMany({
            where: { studentId },
            include: {
                assignment: {
                    include: {
                        subjectInstance: {
                            include: { subject: true },
                        },
                    },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });
    }

    async getAssignmentsBySubjectInstance(subjectInstanceId: string) {
        return this.prisma.assignment.findMany({
            where: { subjectInstanceId, isPublished: true },
            orderBy: { dueDate: 'asc' },
            include: {
                _count: { select: { submissions: true } },
            },
        });
    }
}
