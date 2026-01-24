// Thai School LMS - Shared Constants

// Grade scale mapping (Thai system)
export const GRADE_SCALE = {
    4.0: { label: '4', description: 'ดีเยี่ยม', minPercent: 80 },
    3.5: { label: '3.5', description: 'ดีมาก', minPercent: 75 },
    3.0: { label: '3', description: 'ดี', minPercent: 70 },
    2.5: { label: '2.5', description: 'ค่อนข้างดี', minPercent: 65 },
    2.0: { label: '2', description: 'ปานกลาง', minPercent: 60 },
    1.5: { label: '1.5', description: 'พอใช้', minPercent: 55 },
    1.0: { label: '1', description: 'ผ่านเกณฑ์ขั้นต่ำ', minPercent: 50 },
    0: { label: '0', description: 'ไม่ผ่าน', minPercent: 0 },
} as const;

// Thai titles
export const STUDENT_TITLES = {
    ชาย: ['เด็กชาย', 'นาย'],
    หญิง: ['เด็กหญิง', 'นางสาว'],
} as const;

export const TEACHER_TITLES = ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ผศ.', 'รศ.', 'ศ.'] as const;

// Academic periods
export const ACADEMIC_PERIODS = {
    SEMESTER_1: { name: 'ภาคเรียนที่ 1', months: [5, 6, 7, 8, 9, 10] },
    SEMESTER_2: { name: 'ภาคเรียนที่ 2', months: [11, 12, 1, 2, 3] },
} as const;

// 8 Learning Areas (กลุ่มสาระการเรียนรู้)
export const SUBJECT_AREAS = [
    { code: 'THA', nameTh: 'ภาษาไทย', nameEn: 'Thai Language' },
    { code: 'MAT', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics' },
    { code: 'SCI', nameTh: 'วิทยาศาสตร์และเทคโนโลยี', nameEn: 'Science and Technology' },
    { code: 'SOC', nameTh: 'สังคมศึกษา ศาสนาและวัฒนธรรม', nameEn: 'Social Studies, Religion and Culture' },
    { code: 'HPE', nameTh: 'สุขศึกษาและพลศึกษา', nameEn: 'Health and Physical Education' },
    { code: 'ART', nameTh: 'ศิลปะ', nameEn: 'Arts' },
    { code: 'VOC', nameTh: 'การงานอาชีพ', nameEn: 'Occupations and Technology' },
    { code: 'ENG', nameTh: 'ภาษาต่างประเทศ', nameEn: 'Foreign Languages' },
] as const;

// Grade levels
export const GRADE_LEVELS = {
    PRIMARY: [
        { code: 'P1', nameTh: 'ป.1', nameEn: 'Grade 1', level: 1 },
        { code: 'P2', nameTh: 'ป.2', nameEn: 'Grade 2', level: 2 },
        { code: 'P3', nameTh: 'ป.3', nameEn: 'Grade 3', level: 3 },
        { code: 'P4', nameTh: 'ป.4', nameEn: 'Grade 4', level: 4 },
        { code: 'P5', nameTh: 'ป.5', nameEn: 'Grade 5', level: 5 },
        { code: 'P6', nameTh: 'ป.6', nameEn: 'Grade 6', level: 6 },
    ],
    LOWER_SECONDARY: [
        { code: 'M1', nameTh: 'ม.1', nameEn: 'Grade 7', level: 7 },
        { code: 'M2', nameTh: 'ม.2', nameEn: 'Grade 8', level: 8 },
        { code: 'M3', nameTh: 'ม.3', nameEn: 'Grade 9', level: 9 },
    ],
    UPPER_SECONDARY: [
        { code: 'M4', nameTh: 'ม.4', nameEn: 'Grade 10', level: 10 },
        { code: 'M5', nameTh: 'ม.5', nameEn: 'Grade 11', level: 11 },
        { code: 'M6', nameTh: 'ม.6', nameEn: 'Grade 12', level: 12 },
    ],
} as const;

// Days of week (Thai)
export const DAYS_OF_WEEK = [
    { value: 1, nameTh: 'วันจันทร์', nameEn: 'Monday' },
    { value: 2, nameTh: 'วันอังคาร', nameEn: 'Tuesday' },
    { value: 3, nameTh: 'วันพุธ', nameEn: 'Wednesday' },
    { value: 4, nameTh: 'วันพฤหัสบดี', nameEn: 'Thursday' },
    { value: 5, nameTh: 'วันศุกร์', nameEn: 'Friday' },
    { value: 6, nameTh: 'วันเสาร์', nameEn: 'Saturday' },
    { value: 7, nameTh: 'วันอาทิตย์', nameEn: 'Sunday' },
] as const;

// Class periods (typical Thai school)
export const CLASS_PERIODS = [
    { period: 1, startTime: '08:30', endTime: '09:20' },
    { period: 2, startTime: '09:20', endTime: '10:10' },
    { period: 3, startTime: '10:20', endTime: '11:10' },
    { period: 4, startTime: '11:10', endTime: '12:00' },
    { period: 5, startTime: '13:00', endTime: '13:50' },
    { period: 6, startTime: '13:50', endTime: '14:40' },
    { period: 7, startTime: '14:50', endTime: '15:40' },
    { period: 8, startTime: '15:40', endTime: '16:30' },
] as const;

// File upload limits
export const FILE_LIMITS = {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
    ALLOWED_DOCUMENT_TYPES: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
    ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    ALLOWED_VIDEO_TYPES: ['mp4', 'webm', 'mov'],
    ALLOWED_AUDIO_TYPES: ['mp3', 'wav', 'ogg'],
} as const;
