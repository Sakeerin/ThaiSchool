// Exams Service

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateExamDto,
    UpdateExamDto,
    CreateQuestionDto,
    AddExamQuestionDto,
    SubmitExamAnswerDto,
    ExamQueryDto,
    CreateQuestionBankDto,
} from './dto';

@Injectable()
export class ExamsService {
    constructor(private readonly prisma: PrismaService) { }

    // =====================
    // Exams
    // =====================

    async findAll(params: ExamQueryDto) {
        const { page = 1, limit = 20, subjectInstanceId, type, isPublished } = params;

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

        return this.prisma.paginate('exam', {
            page,
            limit,
            where,
            orderBy: { startTime: 'asc' },
            include: {
                subjectInstance: {
                    include: { subject: true },
                },
                createdBy: {
                    select: { id: true, titleTh: true, firstNameTh: true, lastNameTh: true },
                },
                _count: { select: { questions: true, attempts: true } },
            },
        });
    }

    async findById(id: string) {
        const exam = await this.prisma.exam.findUnique({
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
                questions: {
                    include: { question: true },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!exam) {
            throw new NotFoundException('ไม่พบข้อสอบ');
        }

        return exam;
    }

    async create(data: CreateExamDto, teacherId: string) {
        return this.prisma.exam.create({
            data: {
                subjectInstanceId: data.subjectInstanceId,
                title: data.title,
                description: data.description,
                instructions: data.instructions,
                type: data.type,
                maxScore: data.maxScore,
                passingScore: data.passingScore,
                startTime: data.startTime,
                endTime: data.endTime,
                duration: data.duration,
                shuffleQuestions: data.shuffleQuestions ?? false,
                shuffleOptions: data.shuffleOptions ?? false,
                maxAttempts: data.maxAttempts ?? 1,
                createdById: teacherId,
            },
        });
    }

    async update(id: string, data: UpdateExamDto) {
        const exam = await this.prisma.exam.findUnique({ where: { id } });
        if (!exam) {
            throw new NotFoundException('ไม่พบข้อสอบ');
        }

        const updateData: any = { ...data };

        if (data.isPublished === true && !exam.isPublished) {
            updateData.publishedAt = new Date();
        }

        return this.prisma.exam.update({
            where: { id },
            data: updateData,
        });
    }

    async delete(id: string) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: { _count: { select: { attempts: true } } },
        });

        if (!exam) {
            throw new NotFoundException('ไม่พบข้อสอบ');
        }

        if (exam._count.attempts > 0) {
            throw new ConflictException('ไม่สามารถลบข้อสอบที่มีการสอบแล้ว');
        }

        await this.prisma.exam.delete({ where: { id } });

        return { message: 'ลบข้อสอบสำเร็จ' };
    }

    async addQuestion(examId: string, data: AddExamQuestionDto) {
        const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) {
            throw new NotFoundException('ไม่พบข้อสอบ');
        }

        const question = await this.prisma.question.findUnique({
            where: { id: data.questionId },
        });
        if (!question) {
            throw new NotFoundException('ไม่พบคำถาม');
        }

        // Get max order
        const maxOrder = await this.prisma.examQuestion.aggregate({
            where: { examId },
            _max: { order: true },
        });

        return this.prisma.examQuestion.create({
            data: {
                examId,
                questionId: data.questionId,
                order: data.order ?? (maxOrder._max.order ?? 0) + 1,
                points: data.points ?? question.points,
            },
            include: { question: true },
        });
    }

    async removeQuestion(examId: string, questionId: string) {
        await this.prisma.examQuestion.delete({
            where: {
                examId_questionId: {
                    examId,
                    questionId,
                },
            },
        });

        return { message: 'ลบคำถามออกจากข้อสอบสำเร็จ' };
    }

    // =====================
    // Question Bank
    // =====================

    async createQuestionBank(data: CreateQuestionBankDto) {
        return this.prisma.questionBank.create({ data });
    }

    async getQuestionBanks(subjectId: string) {
        return this.prisma.questionBank.findMany({
            where: { subjectId },
            include: { _count: { select: { questions: true } } },
        });
    }

    async createQuestion(data: CreateQuestionDto) {
        return this.prisma.question.create({
            data: {
                questionBankId: data.questionBankId,
                type: data.type,
                content: data.content,
                explanation: data.explanation,
                options: data.options,
                matchingPairs: data.matchingPairs,
                correctAnswer: data.correctAnswer,
                acceptedAnswers: data.acceptedAnswers,
                difficulty: data.difficulty ?? 'MEDIUM',
                points: data.points ?? 1,
                tags: data.tags ?? [],
            },
        });
    }

    async getQuestionsByBank(questionBankId: string) {
        return this.prisma.question.findMany({
            where: { questionBankId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // =====================
    // Exam Attempts
    // =====================

    async startAttempt(examId: string, studentId: string) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            include: { questions: true },
        });

        if (!exam) {
            throw new NotFoundException('ไม่พบข้อสอบ');
        }

        if (!exam.isPublished) {
            throw new BadRequestException('ข้อสอบยังไม่เปิดให้สอบ');
        }

        const now = new Date();
        if (now < exam.startTime) {
            throw new BadRequestException('ข้อสอบยังไม่เริ่ม');
        }
        if (now > exam.endTime) {
            throw new BadRequestException('ข้อสอบหมดเวลาแล้ว');
        }

        // Check number of attempts
        const attemptCount = await this.prisma.examAttempt.count({
            where: { examId, studentId },
        });

        if (attemptCount >= exam.maxAttempts) {
            throw new BadRequestException('ทำข้อสอบครบจำนวนครั้งแล้ว');
        }

        // Check for in-progress attempt
        const inProgress = await this.prisma.examAttempt.findFirst({
            where: { examId, studentId, status: 'IN_PROGRESS' },
        });

        if (inProgress) {
            return inProgress;
        }

        return this.prisma.examAttempt.create({
            data: {
                examId,
                studentId,
                attemptNumber: attemptCount + 1,
                status: 'IN_PROGRESS',
                totalQuestions: exam.questions.length,
            },
        });
    }

    async submitAnswer(attemptId: string, data: SubmitExamAnswerDto) {
        const attempt = await this.prisma.examAttempt.findUnique({
            where: { id: attemptId },
            include: { exam: true },
        });

        if (!attempt) {
            throw new NotFoundException('ไม่พบการสอบ');
        }

        if (attempt.status !== 'IN_PROGRESS') {
            throw new BadRequestException('การสอบนี้จบแล้ว');
        }

        // Update answers in JSON field
        const answers = (attempt.answers as any[]) || [];
        const existingIdx = answers.findIndex((a) => a.questionId === data.questionId);

        if (existingIdx >= 0) {
            answers[existingIdx].answer = data.answer;
        } else {
            answers.push({ questionId: data.questionId, answer: data.answer });
        }

        return this.prisma.examAttempt.update({
            where: { id: attemptId },
            data: { answers },
        });
    }

    async submitExam(attemptId: string) {
        const attempt = await this.prisma.examAttempt.findUnique({
            where: { id: attemptId },
            include: {
                exam: {
                    include: {
                        questions: { include: { question: true } },
                    },
                },
            },
        });

        if (!attempt) {
            throw new NotFoundException('ไม่พบการสอบ');
        }

        if (attempt.status !== 'IN_PROGRESS') {
            throw new BadRequestException('การสอบนี้จบแล้ว');
        }

        // Grade the exam (auto-grade MCQ, TRUE_FALSE, FILL_BLANK)
        const answers = (attempt.answers as any[]) || [];
        let score = 0;
        let correctCount = 0;

        for (const eq of attempt.exam.questions) {
            const studentAnswer = answers.find((a) => a.questionId === eq.questionId);
            if (!studentAnswer) continue;

            const question = eq.question;
            let isCorrect = false;

            if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
                const options = question.options as any[];
                const correctOption = options?.find((o) => o.isCorrect);
                isCorrect = studentAnswer.answer === correctOption?.id;
            } else if (question.type === 'FILL_BLANK' || question.type === 'SHORT_ANSWER') {
                const accepted = [question.correctAnswer, ...(question.acceptedAnswers as string[] || [])];
                isCorrect = accepted.some((a) =>
                    a?.toLowerCase().trim() === studentAnswer.answer?.toLowerCase().trim()
                );
            }

            if (isCorrect) {
                score += eq.points;
                correctCount++;
            }

            // Update answer with grading result
            const answerIdx = answers.findIndex((a) => a.questionId === eq.questionId);
            if (answerIdx >= 0) {
                answers[answerIdx].isCorrect = isCorrect;
                answers[answerIdx].points = isCorrect ? eq.points : 0;
            }
        }

        return this.prisma.examAttempt.update({
            where: { id: attemptId },
            data: {
                status: 'GRADED',
                submittedAt: new Date(),
                score,
                correctCount,
                answers,
            },
        });
    }

    async getAttempt(attemptId: string) {
        return this.prisma.examAttempt.findUnique({
            where: { id: attemptId },
            include: {
                exam: {
                    include: {
                        questions: {
                            include: { question: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
    }

    async getStudentAttempts(studentId: string) {
        return this.prisma.examAttempt.findMany({
            where: { studentId },
            include: {
                exam: {
                    include: {
                        subjectInstance: { include: { subject: true } },
                    },
                },
            },
            orderBy: { startedAt: 'desc' },
        });
    }
}
