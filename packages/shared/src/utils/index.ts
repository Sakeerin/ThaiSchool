// Thai School LMS - Utility Functions

import { GRADE_SCALE } from '../constants';

/**
 * Calculate grade point from percentage score (Thai system)
 */
export function calculateGradePoint(percentage: number): number {
    if (percentage >= 80) return 4.0;
    if (percentage >= 75) return 3.5;
    if (percentage >= 70) return 3.0;
    if (percentage >= 65) return 2.5;
    if (percentage >= 60) return 2.0;
    if (percentage >= 55) return 1.5;
    if (percentage >= 50) return 1.0;
    return 0;
}

/**
 * Get grade label from grade point
 */
export function getGradeLabel(gradePoint: number): string {
    if (gradePoint === 4.0) return '4';
    if (gradePoint === 3.5) return '3.5';
    if (gradePoint === 3.0) return '3';
    if (gradePoint === 2.5) return '2.5';
    if (gradePoint === 2.0) return '2';
    if (gradePoint === 1.5) return '1.5';
    if (gradePoint === 1.0) return '1';
    return '0';
}

/**
 * Calculate GPA from grades
 */
export function calculateGPA(
    grades: { gradePoint: number; credits: number }[]
): number {
    if (grades.length === 0) return 0;

    const totalPoints = grades.reduce(
        (sum, g) => sum + g.gradePoint * g.credits,
        0
    );
    const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);

    if (totalCredits === 0) return 0;
    return Math.round((totalPoints / totalCredits) * 100) / 100;
}

/**
 * Validate Thai National ID (เลขประจำตัวประชาชน 13 หลัก)
 */
export function validateThaiNationalId(id: string): boolean {
    if (!/^\d{13}$/.test(id)) return false;

    const digits = id.split('').map(Number);
    let sum = 0;

    for (let i = 0; i < 12; i++) {
        sum += digits[i] * (13 - i);
    }

    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === digits[12];
}

/**
 * Format Thai date (พ.ศ.)
 */
export function formatThaiDate(
    date: Date | string,
    options: { includeTime?: boolean; short?: boolean } = {}
): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const thaiYear = d.getFullYear() + 543;

    const thaiMonths = options.short
        ? ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
        : ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    const day = d.getDate();
    const month = thaiMonths[d.getMonth()];

    let result = `${day} ${month} ${thaiYear}`;

    if (options.includeTime) {
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        result += ` ${hours}:${minutes} น.`;
    }

    return result;
}

/**
 * Convert Christian year to Buddhist year (พ.ศ.)
 */
export function toBuddhistYear(year: number): number {
    return year + 543;
}

/**
 * Convert Buddhist year to Christian year
 */
export function toChristianYear(buddhistYear: number): number {
    return buddhistYear - 543;
}

/**
 * Generate student code
 * Format: YYRRNNNN (YY=year, RR=room, NNNN=number)
 */
export function generateStudentCode(
    academicYear: number,
    gradeLevel: number,
    room: number,
    number: number
): string {
    const year = (academicYear % 100).toString().padStart(2, '0');
    const level = gradeLevel.toString().padStart(2, '0');
    const roomStr = room.toString().padStart(2, '0');
    const numStr = number.toString().padStart(4, '0');

    return `${year}${level}${roomStr}${numStr}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string): number {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Generate random password
 */
export function generatePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';

    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
}

/**
 * Slugify text for URLs
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}
