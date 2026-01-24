// Thai School LMS - Shared Types

// User roles
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

// Education stages
export type EducationStage = 'PRIMARY' | 'LOWER_SECONDARY' | 'UPPER_SECONDARY';

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

// Pagination
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    items: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// User DTOs
export interface UserBase {
    id: string;
    email: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
}

export interface StudentProfile {
    id: string;
    nationalId: string;
    studentCode: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    titleEn?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    gender: 'MALE' | 'FEMALE';
    birthDate: string;
    classroom: {
        id: string;
        name: string;
        gradeLevel: string;
    };
    photoUrl?: string;
}

export interface TeacherProfile {
    id: string;
    employeeCode: string;
    titleTh: string;
    firstNameTh: string;
    lastNameTh: string;
    position?: string;
    department?: string;
    photoUrl?: string;
}

// Lesson types
export interface LessonSummary {
    id: string;
    title: string;
    description?: string;
    order: number;
    isPublished: boolean;
    contentCount: number;
}

export interface LessonContent {
    id: string;
    type: 'TEXT' | 'VIDEO' | 'PDF' | 'AUDIO' | 'SLIDE' | 'LINK' | 'QUIZ';
    title: string;
    content?: string;
    fileUrl?: string;
    duration?: number;
    order: number;
}

// Assignment types
export interface AssignmentSummary {
    id: string;
    title: string;
    type: 'HOMEWORK' | 'PROJECT' | 'EXERCISE' | 'REPORT' | 'PRESENTATION';
    maxScore: number;
    dueDate: string;
    submissionCount: number;
    isPublished: boolean;
}

export interface SubmissionStatus {
    status: 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED' | 'RETURNED';
    submittedAt?: string;
    score?: number;
    feedback?: string;
}

// Exam types
export interface ExamSummary {
    id: string;
    title: string;
    type: 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PRACTICE';
    maxScore: number;
    startTime: string;
    endTime: string;
    duration: number;
    questionCount: number;
    isPublished: boolean;
}

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}

export interface Question {
    id: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY' | 'MATCHING' | 'FILL_BLANK' | 'SHORT_ANSWER';
    content: string;
    options?: QuestionOption[];
    matchingPairs?: { left: string; right: string }[];
    points: number;
}

// Grade types
export interface GradeSummary {
    subjectName: string;
    subjectCode: string;
    classworkScore?: number;
    midtermScore?: number;
    finalScore?: number;
    totalScore?: number;
    gradePoint?: number;
    gradeLabel?: string;
}

export interface StudentGradeReport {
    student: {
        id: string;
        name: string;
        studentCode: string;
        classroom: string;
    };
    academicYear: number;
    semester: number;
    grades: GradeSummary[];
    gpa?: number;
    gpax?: number;
    behaviorScore?: number;
    attendanceRate?: number;
}

// Notification types
export interface Notification {
    id: string;
    type: string;
    title: string;
    content: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

// Dashboard stats
export interface AdminDashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    totalSubjects: number;
    totalClassrooms: number;
    attendanceToday: {
        present: number;
        absent: number;
        late: number;
    };
}

export interface TeacherDashboardStats {
    totalStudents: number;
    totalSubjects: number;
    pendingSubmissions: number;
    upcomingExams: number;
    recentGrades: number;
}

export interface StudentDashboardStats {
    pendingAssignments: number;
    upcomingExams: number;
    currentGPA: number;
    attendanceRate: number;
    unreadNotifications: number;
}

export interface ParentDashboardStats {
    children: {
        id: string;
        name: string;
        classroom: string;
        gpa: number;
        attendanceRate: number;
        pendingAssignments: number;
    }[];
    unreadNotifications: number;
}
