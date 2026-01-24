// Thai School LMS - Zod Validators

import { z } from 'zod';

// Thai National ID validation
const thaiNationalIdRegex = /^\d{13}$/;

export const validateThaiId = (id: string): boolean => {
    if (!thaiNationalIdRegex.test(id)) return false;

    const digits = id.split('').map(Number);
    let sum = 0;

    for (let i = 0; i < 12; i++) {
        sum += digits[i] * (13 - i);
    }

    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === digits[12];
};

// Common schemas
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const idParamSchema = z.object({
    id: z.string().cuid(),
});

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('อีเมลไม่ถูกต้อง'),
    password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

export const registerSchema = z.object({
    email: z.string().email('อีเมลไม่ถูกต้อง'),
    password: z.string()
        .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        .regex(/[A-Z]/, 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว')
        .regex(/[0-9]/, 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว'),
    confirmPassword: z.string(),
    role: z.enum(['TEACHER', 'STUDENT', 'PARENT']),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
    newPassword: z.string()
        .min(8, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร')
        .regex(/[A-Z]/, 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว')
        .regex(/[0-9]/, 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'รหัสผ่านใหม่ไม่ตรงกัน',
    path: ['confirmPassword'],
});

// Student schemas
export const createStudentSchema = z.object({
    nationalId: z.string()
        .length(13, 'เลขประจำตัวประชาชนต้องมี 13 หลัก')
        .refine(validateThaiId, 'เลขประจำตัวประชาชนไม่ถูกต้อง'),
    studentCode: z.string().min(1, 'กรุณากรอกรหัสนักเรียน'),
    titleTh: z.string().min(1, 'กรุณาเลือกคำนำหน้า'),
    firstNameTh: z.string().min(1, 'กรุณากรอกชื่อ'),
    lastNameTh: z.string().min(1, 'กรุณากรอกนามสกุล'),
    firstNameEn: z.string().optional(),
    lastNameEn: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']),
    birthDate: z.string().datetime(),
    bloodType: z.enum(['A', 'B', 'AB', 'O']).optional(),
    address: z.string().optional(),
    classroomId: z.string().cuid('กรุณาเลือกห้องเรียน'),
    studentNumber: z.number().int().positive('เลขที่ต้องเป็นจำนวนเต็มบวก'),
    email: z.string().email('อีเมลไม่ถูกต้อง'),
});

export const updateStudentSchema = createStudentSchema.partial().omit({
    nationalId: true, // National ID cannot be changed
});

// Teacher schemas
export const createTeacherSchema = z.object({
    nationalId: z.string()
        .length(13, 'เลขประจำตัวประชาชนต้องมี 13 หลัก')
        .refine(validateThaiId, 'เลขประจำตัวประชาชนไม่ถูกต้อง'),
    employeeCode: z.string().min(1, 'กรุณากรอกรหัสพนักงาน'),
    titleTh: z.string().min(1, 'กรุณาเลือกคำนำหน้า'),
    firstNameTh: z.string().min(1, 'กรุณากรอกชื่อ'),
    lastNameTh: z.string().min(1, 'กรุณากรอกนามสกุล'),
    position: z.string().optional(),
    department: z.string().optional(),
    email: z.string().email('อีเมลไม่ถูกต้อง'),
});

// Lesson schemas
export const createLessonSchema = z.object({
    subjectInstanceId: z.string().cuid(),
    title: z.string().min(1, 'กรุณากรอกชื่อบทเรียน').max(200),
    description: z.string().optional(),
    order: z.number().int().min(0).default(0),
});

export const lessonContentSchema = z.object({
    type: z.enum(['TEXT', 'VIDEO', 'PDF', 'AUDIO', 'SLIDE', 'LINK', 'QUIZ']),
    title: z.string().min(1, 'กรุณากรอกชื่อเนื้อหา'),
    content: z.string().optional(),
    fileUrl: z.string().url().optional(),
    order: z.number().int().min(0).default(0),
});

// Assignment schemas
export const createAssignmentSchema = z.object({
    subjectInstanceId: z.string().cuid(),
    title: z.string().min(1, 'กรุณากรอกชื่องาน').max(200),
    description: z.string().optional(),
    instructions: z.string().optional(),
    type: z.enum(['HOMEWORK', 'PROJECT', 'EXERCISE', 'REPORT', 'PRESENTATION']),
    maxScore: z.number().positive('คะแนนเต็มต้องมากกว่า 0'),
    dueDate: z.string().datetime(),
    allowLateSubmission: z.boolean().default(true),
    latePenaltyPercent: z.number().min(0).max(100).default(10),
});

// Exam schemas
export const createExamSchema = z.object({
    subjectInstanceId: z.string().cuid(),
    title: z.string().min(1, 'กรุณากรอกชื่อข้อสอบ').max(200),
    description: z.string().optional(),
    type: z.enum(['QUIZ', 'MIDTERM', 'FINAL', 'PRACTICE']),
    maxScore: z.number().positive(),
    passingScore: z.number().min(0).optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    duration: z.number().int().positive('ระยะเวลาต้องมากกว่า 0 นาที'),
    shuffleQuestions: z.boolean().default(false),
    shuffleOptions: z.boolean().default(false),
    showResult: z.boolean().default(true),
    maxAttempts: z.number().int().positive().default(1),
});

export const createQuestionSchema = z.object({
    questionBankId: z.string().cuid(),
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY', 'MATCHING', 'FILL_BLANK', 'SHORT_ANSWER']),
    content: z.string().min(1, 'กรุณากรอกคำถาม'),
    explanation: z.string().optional(),
    options: z.array(z.object({
        id: z.string(),
        text: z.string(),
        isCorrect: z.boolean(),
    })).optional(),
    correctAnswer: z.string().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
    points: z.number().positive().default(1),
});

// Grade schemas
export const updateGradeSchema = z.object({
    classworkScore: z.number().min(0).optional(),
    midtermScore: z.number().min(0).optional(),
    finalScore: z.number().min(0).optional(),
    behaviorScore: z.number().min(0).optional(),
    remarks: z.string().optional(),
});

// Announcement schemas
export const createAnnouncementSchema = z.object({
    title: z.string().min(1, 'กรุณากรอกหัวข้อประกาศ').max(200),
    content: z.string().min(1, 'กรุณากรอกเนื้อหาประกาศ'),
    type: z.enum(['GENERAL', 'ACADEMIC', 'ACTIVITY', 'URGENT']),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    targetRoles: z.array(z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'])),
    expiresAt: z.string().datetime().optional(),
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type CreateExamInput = z.infer<typeof createExamSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
