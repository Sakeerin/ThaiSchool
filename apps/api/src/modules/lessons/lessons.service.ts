// Lessons Service

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateLessonDto,
    UpdateLessonDto,
    CreateLessonContentDto,
    UpdateLessonContentDto,
    LessonQueryDto,
} from './dto';

@Injectable()
export class LessonsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: LessonQueryDto) {
        const { page = 1, limit = 20, subjectInstanceId, isPublished, search } = params;

        const where: any = {};

        if (subjectInstanceId) {
            where.subjectInstanceId = subjectInstanceId;
        }

        if (isPublished !== undefined) {
            where.isPublished = isPublished;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.paginate('lesson', {
            page,
            limit,
            where,
            orderBy: { order: 'asc' },
            include: {
                subjectInstance: {
                    include: {
                        subject: { include: { subjectArea: true } },
                        semester: true,
                    },
                },
                createdBy: {
                    select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true },
                },
                _count: { select: { contents: true } },
            },
        });
    }

    async findById(id: string) {
        const lesson = await this.prisma.lesson.findUnique({
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
                contents: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!lesson) {
            throw new NotFoundException('ไม่พบบทเรียน');
        }

        return lesson;
    }

    async create(data: CreateLessonDto, teacherId: string) {
        // Get max order for this subject instance
        const maxOrder = await this.prisma.lesson.aggregate({
            where: { subjectInstanceId: data.subjectInstanceId },
            _max: { order: true },
        });

        return this.prisma.lesson.create({
            data: {
                subjectInstanceId: data.subjectInstanceId,
                title: data.title,
                description: data.description,
                order: data.order ?? (maxOrder._max.order ?? 0) + 1,
                createdById: teacherId,
            },
            include: {
                subjectInstance: {
                    include: { subject: true },
                },
                createdBy: {
                    select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true },
                },
            },
        });
    }

    async update(id: string, data: UpdateLessonDto) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) {
            throw new NotFoundException('ไม่พบบทเรียน');
        }

        const updateData: any = { ...data };

        // Handle publishing
        if (data.isPublished === true && !lesson.isPublished) {
            updateData.publishedAt = new Date();
            updateData.version = lesson.version + 1;
        }

        return this.prisma.lesson.update({
            where: { id },
            data: updateData,
            include: {
                contents: { orderBy: { order: 'asc' } },
            },
        });
    }

    async delete(id: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) {
            throw new NotFoundException('ไม่พบบทเรียน');
        }

        await this.prisma.lesson.delete({ where: { id } });

        return { message: 'ลบบทเรียนสำเร็จ' };
    }

    async publish(id: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) {
            throw new NotFoundException('ไม่พบบทเรียน');
        }

        return this.prisma.lesson.update({
            where: { id },
            data: {
                isPublished: true,
                publishedAt: new Date(),
                version: lesson.version + 1,
            },
        });
    }

    async unpublish(id: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id } });
        if (!lesson) {
            throw new NotFoundException('ไม่พบบทเรียน');
        }

        return this.prisma.lesson.update({
            where: { id },
            data: { isPublished: false },
        });
    }

    // =====================
    // Lesson Contents
    // =====================

    async addContent(data: CreateLessonContentDto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: data.lessonId },
        });

        if (!lesson) {
            throw new NotFoundException('ไม่พบบทเรียน');
        }

        // Get max order for this lesson
        const maxOrder = await this.prisma.lessonContent.aggregate({
            where: { lessonId: data.lessonId },
            _max: { order: true },
        });

        return this.prisma.lessonContent.create({
            data: {
                lessonId: data.lessonId,
                type: data.type,
                title: data.title,
                content: data.content,
                fileUrl: data.fileUrl,
                fileSize: data.fileSize,
                duration: data.duration,
                order: data.order ?? (maxOrder._max.order ?? 0) + 1,
            },
        });
    }

    async updateContent(contentId: string, data: UpdateLessonContentDto) {
        const content = await this.prisma.lessonContent.findUnique({
            where: { id: contentId },
        });

        if (!content) {
            throw new NotFoundException('ไม่พบเนื้อหา');
        }

        return this.prisma.lessonContent.update({
            where: { id: contentId },
            data,
        });
    }

    async deleteContent(contentId: string) {
        const content = await this.prisma.lessonContent.findUnique({
            where: { id: contentId },
        });

        if (!content) {
            throw new NotFoundException('ไม่พบเนื้อหา');
        }

        await this.prisma.lessonContent.delete({ where: { id: contentId } });

        return { message: 'ลบเนื้อหาสำเร็จ' };
    }

    async reorderContents(lessonId: string, contentIds: string[]) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) {
            throw new NotFoundException('ไม่พบบทเรียน');
        }

        // Update order for each content
        await Promise.all(
            contentIds.map((contentId, index) =>
                this.prisma.lessonContent.update({
                    where: { id: contentId },
                    data: { order: index + 1 },
                }),
            ),
        );

        return this.findById(lessonId);
    }

    async getBySubjectInstance(subjectInstanceId: string) {
        return this.prisma.lesson.findMany({
            where: { subjectInstanceId, isPublished: true },
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { contents: true } },
            },
        });
    }

    async findByTeacher(teacherId: string) {
        return this.prisma.lesson.findMany({
            where: { createdById: teacherId },
            orderBy: [{ updatedAt: 'desc' }],
            include: {
                subjectInstance: {
                    include: {
                        subject: { include: { subjectArea: true } },
                        semester: { include: { academicYear: true } },
                    },
                },
                _count: { select: { contents: true } },
            },
        });
    }

    async findForStudent(studentId: string) {
        // Get student's enrolled subject instances
        const enrollments = await this.prisma.subjectEnrollment.findMany({
            where: { studentId },
            select: { subjectInstanceId: true },
        });

        const subjectInstanceIds = enrollments.map((e) => e.subjectInstanceId);

        // Get published lessons for enrolled subjects
        return this.prisma.lesson.findMany({
            where: {
                subjectInstanceId: { in: subjectInstanceIds },
                isPublished: true,
            },
            orderBy: [
                { subjectInstanceId: 'asc' },
                { order: 'asc' },
            ],
            include: {
                subjectInstance: {
                    include: {
                        subject: { include: { subjectArea: true } },
                        semester: true,
                    },
                },
                _count: { select: { contents: true } },
            },
        });
    }

    async getSubjectInstancesForTeacher(teacherId: string) {
        const assignments = await this.prisma.teachingAssignment.findMany({
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

        return assignments.map((a) => a.subjectInstance);
    }
}
