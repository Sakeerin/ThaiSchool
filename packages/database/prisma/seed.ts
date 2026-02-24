// Thai School LMS - Database Seed
// Initializes essential data: grade levels, subject areas, subjects
// and added dummy data for demo: users, profiles, classrooms

import { PrismaClient, EducationStage, UserRole, Gender, ParentRelationship } from '@prisma/client';

const prisma = new PrismaClient();

// Hashed 'password123' using bcrypt (cost factor 10)
const DEFAULT_PASSWORD_HASH = '$2b$10$HiRTJasNuSyKavU9jme8KutGySOU9dfxobAIDVNpd6bwdaU.cEE42';

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Grade Levels (ระดับชั้น)
    const gradeLevels = await seedGradeLevels();
    console.log(`✅ Created ${gradeLevels.length} grade levels`);

    // 2. Subject Areas (8 กลุ่มสาระการเรียนรู้)
    const subjectAreas = await seedSubjectAreas();
    console.log(`✅ Created ${subjectAreas.length} subject areas`);

    // 3. Core Subjects
    const subjects = await seedSubjects(subjectAreas, gradeLevels);
    console.log(`✅ Created ${subjects.length} subjects`);

    // 4. Initial Academic Year
    const academicYear = await seedAcademicYear();
    console.log(`✅ Created academic year ${academicYear.year}`);

    // DUMMY DATA FOR DEMO
    console.log('🏁 Seeding dummy data for demo...');

    // 5. Admin User
    await seedAdmin();
    console.log('✅ Created admin user');

    // 6. Teachers
    const teachers = await seedTeachers();
    console.log(`✅ Created ${teachers.length} teachers`);

    // 7. Classrooms
    const classrooms = await seedClassrooms(academicYear.id, gradeLevels, teachers);
    console.log(`✅ Created ${classrooms.length} classrooms`);

    // 8. Students
    const students = await seedStudents(classrooms);
    console.log(`✅ Created ${students.length} students`);

    // 9. Parents
    await seedParents(students);
    console.log('✅ Created parents and linked to students');

    console.log('🎉 Seeding completed!');
}

async function seedGradeLevels() {
    const levels = [
        // ประถมศึกษา (Primary)
        { code: 'P1', nameTh: 'ป.1', nameEn: 'Grade 1', level: 1, stage: EducationStage.PRIMARY, order: 1 },
        { code: 'P2', nameTh: 'ป.2', nameEn: 'Grade 2', level: 2, stage: EducationStage.PRIMARY, order: 2 },
        { code: 'P3', nameTh: 'ป.3', nameEn: 'Grade 3', level: 3, stage: EducationStage.PRIMARY, order: 3 },
        { code: 'P4', nameTh: 'ป.4', nameEn: 'Grade 4', level: 4, stage: EducationStage.PRIMARY, order: 4 },
        { code: 'P5', nameTh: 'ป.5', nameEn: 'Grade 5', level: 5, stage: EducationStage.PRIMARY, order: 5 },
        { code: 'P6', nameTh: 'ป.6', nameEn: 'Grade 6', level: 6, stage: EducationStage.PRIMARY, order: 6 },

        // มัธยมศึกษาตอนต้น (Lower Secondary)
        { code: 'M1', nameTh: 'ม.1', nameEn: 'Grade 7', level: 7, stage: EducationStage.LOWER_SECONDARY, order: 7 },
        { code: 'M2', nameTh: 'ม.2', nameEn: 'Grade 8', level: 8, stage: EducationStage.LOWER_SECONDARY, order: 8 },
        { code: 'M3', nameTh: 'ม.3', nameEn: 'Grade 9', level: 9, stage: EducationStage.LOWER_SECONDARY, order: 9 },

        // มัธยมศึกษาตอนปลาย (Upper Secondary)
        { code: 'M4', nameTh: 'ม.4', nameEn: 'Grade 10', level: 10, stage: EducationStage.UPPER_SECONDARY, order: 10 },
        { code: 'M5', nameTh: 'ม.5', nameEn: 'Grade 11', level: 11, stage: EducationStage.UPPER_SECONDARY, order: 11 },
        { code: 'M6', nameTh: 'ม.6', nameEn: 'Grade 12', level: 12, stage: EducationStage.UPPER_SECONDARY, order: 12 },
    ];

    const results = [];
    for (const level of levels) {
        const result = await prisma.gradeLevel.upsert({
            where: { code: level.code },
            update: level,
            create: level,
        });
        results.push(result);
    }
    return results;
}

async function seedSubjectAreas() {
    // 8 กลุ่มสาระการเรียนรู้ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน
    const areas = [
        { code: 'THA', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', color: '#E91E63', icon: 'book', order: 1 },
        { code: 'MAT', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', color: '#2196F3', icon: 'calculator', order: 2 },
        { code: 'SCI', nameTh: 'วิทยาศาสตร์และเทคโนโลยี', nameEn: 'Science and Technology', color: '#4CAF50', icon: 'flask', order: 3 },
        { code: 'SOC', nameTh: 'สังคมศึกษา ศาสนาและวัฒนธรรม', nameEn: 'Social Studies, Religion and Culture', color: '#FF9800', icon: 'globe', order: 4 },
        { code: 'HPE', nameTh: 'สุขศึกษาและพลศึกษา', nameEn: 'Health and Physical Education', color: '#F44336', icon: 'heart', order: 5 },
        { code: 'ART', nameTh: 'ศิลปะ', nameEn: 'Arts', color: '#9C27B0', icon: 'palette', order: 6 },
        { code: 'VOC', nameTh: 'การงานอาชีพ', nameEn: 'Occupations and Technology', color: '#795548', icon: 'wrench', order: 7 },
        { code: 'ENG', nameTh: 'ภาษาต่างประเทศ', nameEn: 'Foreign Languages', color: '#00BCD4', icon: 'languages', order: 8 },
    ];

    const results = [];
    for (const area of areas) {
        const result = await prisma.subjectArea.upsert({
            where: { code: area.code },
            update: area,
            create: area,
        });
        results.push(result);
    }
    return results;
}

async function seedSubjects(
    subjectAreas: { id: string; code: string }[],
    gradeLevels: { id: string; code: string }[]
) {
    const getAreaId = (code: string) => subjectAreas.find(a => a.code === code)?.id;
    const getLevelIds = (codes: string[]) =>
        gradeLevels.filter(l => codes.includes(l.code)).map(l => l.id);

    // Sample subjects - extending to cover all levels
    const subjects = [
        // ภาษาไทย
        { code: 'ท11101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.5, levels: ['P1'] },
        { code: 'ท12101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.5, levels: ['P2'] },
        { code: 'ท13101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.5, levels: ['P3'] },
        { code: 'ท14101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.5, levels: ['P4'] },
        { code: 'ท15101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.5, levels: ['P5'] },
        { code: 'ท16101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.5, levels: ['P6'] },
        { code: 'ท21101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.5, levels: ['M1'] },
        { code: 'ท22101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.5, levels: ['M2'] },
        { code: 'ท23101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.5, levels: ['M3'] },
        { code: 'ท31101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.0, levels: ['M4'] },
        { code: 'ท32101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.0, levels: ['M5'] },
        { code: 'ท33101', nameTh: 'ภาษาไทย', nameEn: 'Thai Language', subjectAreaCode: 'THA', credits: 1.0, levels: ['M6'] },

        // คณิตศาสตร์
        { code: 'ค11101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.5, levels: ['P1'] },
        { code: 'ค12101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.5, levels: ['P2'] },
        { code: 'ค13101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.5, levels: ['P3'] },
        { code: 'ค14101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.5, levels: ['P4'] },
        { code: 'ค15101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.5, levels: ['P5'] },
        { code: 'ค16101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.5, levels: ['P6'] },
        { code: 'ค21101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.5, levels: ['M1'] },
        { code: 'ค22101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.5, levels: ['M2'] },
        { code: 'ค23101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.5, levels: ['M3'] },
        { code: 'ค31101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.0, levels: ['M4'] },
        { code: 'ค32101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.0, levels: ['M5'] },
        { code: 'ค33101', nameTh: 'คณิตศาสตร์', nameEn: 'Mathematics', subjectAreaCode: 'MAT', credits: 1.0, levels: ['M6'] },

        // วิทยาศาสตร์
        { code: 'ว11101', nameTh: 'วิทยาศาสตร์และเทคโนโลยี', nameEn: 'Science and Technology', subjectAreaCode: 'SCI', credits: 1.0, levels: ['P1'] },
        { code: 'ว12101', nameTh: 'วิทยาศาสตร์และเทคโนโลยี', nameEn: 'Science and Technology', subjectAreaCode: 'SCI', credits: 1.0, levels: ['P2'] },
        { code: 'ว13101', nameTh: 'วิทยาศาสตร์และเทคโนโลยี', nameEn: 'Science and Technology', subjectAreaCode: 'SCI', credits: 1.0, levels: ['P3'] },
        { code: 'ว14101', nameTh: 'วิทยาศาสตร์และเทคโนโลยี', nameEn: 'Science and Technology', subjectAreaCode: 'SCI', credits: 1.0, levels: ['P4'] },
        { code: 'ว15101', nameTh: 'วิทยาศาสตร์และเทคโนโลยี', nameEn: 'Science and Technology', subjectAreaCode: 'SCI', credits: 1.0, levels: ['P5'] },
        { code: 'ว16101', nameTh: 'วิทยาศาสตร์และเทคโนโลยี', nameEn: 'Science and Technology', subjectAreaCode: 'SCI', credits: 1.0, levels: ['P6'] },
        { code: 'ว21101', nameTh: 'วิทยาศาสตร์', nameEn: 'Science', subjectAreaCode: 'SCI', credits: 1.5, levels: ['M1'] },
        { code: 'ว22101', nameTh: 'วิทยาศาสตร์', nameEn: 'Science', subjectAreaCode: 'SCI', credits: 1.5, levels: ['M2'] },
        { code: 'ว23101', nameTh: 'วิทยาศาสตร์', nameEn: 'Science', subjectAreaCode: 'SCI', credits: 1.5, levels: ['M3'] },
        { code: 'ว31101', nameTh: 'ฟิสิกส์', nameEn: 'Physics', subjectAreaCode: 'SCI', credits: 1.5, levels: ['M4'] },
        { code: 'ว31102', nameTh: 'เคมี', nameEn: 'Chemistry', subjectAreaCode: 'SCI', credits: 1.5, levels: ['M4'] },
        { code: 'ว31103', nameTh: 'ชีววิทยา', nameEn: 'Biology', subjectAreaCode: 'SCI', credits: 1.5, levels: ['M4'] },

        // ภาษาอังกฤษ
        { code: 'อ11101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.0, levels: ['P1'] },
        { code: 'อ12101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.0, levels: ['P2'] },
        { code: 'อ13101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.0, levels: ['P3'] },
        { code: 'อ14101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.0, levels: ['P4'] },
        { code: 'อ15101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.0, levels: ['P5'] },
        { code: 'อ16101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.0, levels: ['P6'] },
        { code: 'อ21101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.5, levels: ['M1'] },
        { code: 'อ22101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.5, levels: ['M2'] },
        { code: 'อ23101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.5, levels: ['M3'] },
        { code: 'อ31101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.0, levels: ['M4'] },
        { code: 'อ32101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.0, levels: ['M5'] },
        { code: 'อ33101', nameTh: 'ภาษาอังกฤษ', nameEn: 'English', subjectAreaCode: 'ENG', credits: 1.0, levels: ['M6'] },

        // สังคมศึกษา
        { code: 'ส11101', nameTh: 'สังคมศึกษา ศาสนาและวัฒนธรรม', nameEn: 'Social Studies', subjectAreaCode: 'SOC', credits: 1.0, levels: ['P1'] },
        { code: 'ส12101', nameTh: 'สังคมศึกษา ศาสนาและวัฒนธรรม', nameEn: 'Social Studies', subjectAreaCode: 'SOC', credits: 1.0, levels: ['P2'] },
        { code: 'ส13101', nameTh: 'สังคมศึกษา ศาสนาและวัฒนธรรม', nameEn: 'Social Studies', subjectAreaCode: 'SOC', credits: 1.0, levels: ['P3'] },
        { code: 'ส21101', nameTh: 'สังคมศึกษา ศาสนาและวัฒนธรรม', nameEn: 'Social Studies', subjectAreaCode: 'SOC', credits: 1.5, levels: ['M1'] },
        { code: 'ส22101', nameTh: 'สังคมศึกษา ศาสนาและวัฒนธรรม', nameEn: 'Social Studies', subjectAreaCode: 'SOC', credits: 1.5, levels: ['M2'] },
        { code: 'ส23101', nameTh: 'สังคมศึกษา ศาสนาและวัฒนธรรม', nameEn: 'Social Studies', subjectAreaCode: 'SOC', credits: 1.5, levels: ['M3'] },

        // สุขศึกษาและพลศึกษา
        { code: 'พ11101', nameTh: 'สุขศึกษาและพลศึกษา', nameEn: 'Health and Physical Education', subjectAreaCode: 'HPE', credits: 0.5, levels: ['P1'] },
        { code: 'พ12101', nameTh: 'สุขศึกษาและพลศึกษา', nameEn: 'Health and Physical Education', subjectAreaCode: 'HPE', credits: 0.5, levels: ['P2'] },
        { code: 'พ21101', nameTh: 'สุขศึกษาและพลศึกษา', nameEn: 'Health and Physical Education', subjectAreaCode: 'HPE', credits: 0.5, levels: ['M1'] },
        { code: 'พ22101', nameTh: 'สุขศึกษาและพลศึกษา', nameEn: 'Health and Physical Education', subjectAreaCode: 'HPE', credits: 0.5, levels: ['M2'] },

        // ศิลปะ
        { code: 'ศ11101', nameTh: 'ศิลปะ', nameEn: 'Arts', subjectAreaCode: 'ART', credits: 0.5, levels: ['P1'] },
        { code: 'ศ12101', nameTh: 'ศิลปะ', nameEn: 'Arts', subjectAreaCode: 'ART', credits: 0.5, levels: ['P2'] },
        { code: 'ศ21101', nameTh: 'ศิลปะ', nameEn: 'Arts', subjectAreaCode: 'ART', credits: 0.5, levels: ['M1'] },
        { code: 'ศ22101', nameTh: 'ศิลปะ', nameEn: 'Arts', subjectAreaCode: 'ART', credits: 0.5, levels: ['M2'] },

        // การงานอาชีพ
        { code: 'ง11101', nameTh: 'การงานอาชีพ', nameEn: 'Occupations', subjectAreaCode: 'VOC', credits: 0.5, levels: ['P1'] },
        { code: 'ง12101', nameTh: 'การงานอาชีพ', nameEn: 'Occupations', subjectAreaCode: 'VOC', credits: 0.5, levels: ['P2'] },
        { code: 'ง21101', nameTh: 'การงานอาชีพ', nameEn: 'Occupations', subjectAreaCode: 'VOC', credits: 0.5, levels: ['M1'] },
        { code: 'ง22101', nameTh: 'การงานอาชีพ', nameEn: 'Occupations', subjectAreaCode: 'VOC', credits: 0.5, levels: ['M2'] },
    ];

    const results = [];
    for (const subject of subjects) {
        const subjectAreaId = getAreaId(subject.subjectAreaCode);
        if (!subjectAreaId) continue;

        const levelIds = getLevelIds(subject.levels);

        const result = await prisma.subject.upsert({
            where: { code: subject.code },
            update: {
                nameTh: subject.nameTh,
                nameEn: subject.nameEn,
                credits: subject.credits,
                subjectAreaId,
                gradeLevels: {
                    set: levelIds.map(id => ({ id })),
                },
            },
            create: {
                code: subject.code,
                nameTh: subject.nameTh,
                nameEn: subject.nameEn,
                credits: subject.credits,
                subjectAreaId,
                gradeLevels: {
                    connect: levelIds.map(id => ({ id })),
                },
            },
        });
        results.push(result);
    }
    return results;
}

async function seedAcademicYear() {
    const currentYear = new Date().getFullYear() + 543; // พ.ศ.

    const academicYear = await prisma.academicYear.upsert({
        where: { year: currentYear },
        update: {},
        create: {
            year: currentYear,
            name: `ปีการศึกษา ${currentYear}`,
            startDate: new Date(`${currentYear - 543}-05-16`),
            endDate: new Date(`${currentYear - 542}-03-31`),
            isCurrent: true,
            semesters: {
                create: [
                    {
                        number: 1,
                        name: 'ภาคเรียนที่ 1',
                        startDate: new Date(`${currentYear - 543}-05-16`),
                        endDate: new Date(`${currentYear - 543}-10-10`),
                        isCurrent: true,
                    },
                    {
                        number: 2,
                        name: 'ภาคเรียนที่ 2',
                        startDate: new Date(`${currentYear - 543}-11-01`),
                        endDate: new Date(`${currentYear - 542}-03-31`),
                        isCurrent: false,
                    },
                ],
            },
        },
    });

    return academicYear;
}

// =====================
// DUMMY DATA SEEDING
// =====================

async function seedAdmin() {
    return prisma.user.upsert({
        where: { email: 'admin@school.com' },
        update: {},
        create: {
            email: 'admin@school.com',
            passwordHash: DEFAULT_PASSWORD_HASH,
            role: UserRole.SUPER_ADMIN,
            admin: {
                create: {
                    titleTh: 'นาย',
                    firstNameTh: 'สมศักดิ์',
                    lastNameTh: 'ใจดี',
                    position: 'ผู้อำนวยการ',
                }
            }
        }
    });
}

async function seedTeachers() {
    const teachersData = [
        { email: 'teacher1@school.com', titleTh: 'นาย', firstNameTh: 'สมชาย', lastNameTh: 'สายเสมอ', position: 'ครูชำนาญการ', department: 'คณิตศาสตร์', code: 'T001', id: '1100100000001' },
        { email: 'teacher2@school.com', titleTh: 'นางสาว', firstNameTh: 'สมศรี', lastNameTh: 'ดีเยี่ยม', position: 'ครู', department: 'ภาษาไทย', code: 'T002', id: '1100100000002' },
        { email: 'teacher3@school.com', titleTh: 'นาย', firstNameTh: 'วิชัย', lastNameTh: 'ก้าวย่าง', position: 'ครูผู้ช่วย', department: 'วิทยาศาสตร์และเทคโนโลยี', code: 'T003', id: '1100100000003' },
        { email: 'teacher4@school.com', titleTh: 'นาง', firstNameTh: 'ใจรัตน์', lastNameTh: 'พึ่งพิง', position: 'ครูชำนาญการพิเศษ', department: 'ภาษาต่างประเทศ', code: 'T004', id: '1100100000004' },
        { email: 'teacher5@school.com', titleTh: 'นาย', firstNameTh: 'กอบศักดิ์', lastNameTh: 'สร้างสรรค์', position: 'ครู', department: 'ศิลปะ', code: 'T005', id: '1100100000005' },
    ];

    const teachers = [];
    for (const data of teachersData) {
        const teacher = await prisma.user.upsert({
            where: { email: data.email },
            update: { passwordHash: DEFAULT_PASSWORD_HASH },
            create: {
                email: data.email,
                passwordHash: DEFAULT_PASSWORD_HASH,
                role: UserRole.TEACHER,
                teacher: {
                    create: {
                        nationalId: data.id,
                        employeeCode: data.code,
                        titleTh: data.titleTh,
                        firstNameTh: data.firstNameTh,
                        lastNameTh: data.lastNameTh,
                        position: data.position,
                        department: data.department,
                    }
                }
            },
            include: { teacher: true }
        });
        teachers.push(teacher.teacher!);
    }
    return teachers;
}

async function seedClassrooms(academicYearId: string, gradeLevels: any[], teachers: any[]) {
    const classroomDefinitions = [
        { gradeCode: 'P1', room: 1, name: 'ป.1/1', advisorIdx: 0 },
        { gradeCode: 'P1', room: 2, name: 'ป.1/2', advisorIdx: 1 },
        { gradeCode: 'M1', room: 1, name: 'ม.1/1', advisorIdx: 2 },
        { gradeCode: 'M4', room: 1, name: 'ม.4/1', advisorIdx: 3 },
    ];

    const classrooms = [];
    for (const def of classroomDefinitions) {
        const gradeLevel = gradeLevels.find(gl => gl.code === def.gradeCode);
        if (!gradeLevel) continue;

        const classroom = await prisma.classroom.upsert({
            where: {
                academicYearId_gradeLevelId_room: {
                    academicYearId,
                    gradeLevelId: gradeLevel.id,
                    room: def.room,
                }
            },
            update: {},
            create: {
                academicYearId,
                gradeLevelId: gradeLevel.id,
                room: def.room,
                name: def.name,
                capacity: 40,
                advisorId: teachers[def.advisorIdx]?.id,
            }
        });
        classrooms.push(classroom);
    }
    return classrooms;
}

async function seedStudents(classrooms: any[]) {
    const studentsData = [
        { email: 'student1@school.com', titleTh: 'เด็กชาย', firstNameTh: 'ใจบุญ', lastNameTh: 'ยอดรัก', id: '1100200000001', code: 'S001', classroomIdx: 0, gender: Gender.MALE },
        { email: 'student2@school.com', titleTh: 'เด็กหญิง', firstNameTh: 'แก้วตา', lastNameTh: 'ดวงใจ', id: '1100200000002', code: 'S002', classroomIdx: 0, gender: Gender.FEMALE },
        { email: 'student3@school.com', titleTh: 'เด็กชาย', firstNameTh: 'ประสิทธิ์', lastNameTh: 'รุ่งเรือง', id: '1100200000003', code: 'S003', classroomIdx: 1, gender: Gender.MALE },
        { email: 'student4@school.com', titleTh: 'นาย', firstNameTh: 'วีระ', lastNameTh: 'หาญกล้า', id: '1100200000004', code: 'S004', classroomIdx: 2, gender: Gender.MALE },
        { email: 'student5@school.com', titleTh: 'นางสาว', firstNameTh: 'พรทิพย์', lastNameTh: 'มาลี', id: '1100200000005', code: 'S005', classroomIdx: 3, gender: Gender.FEMALE },
    ];

    const students = [];
    for (const [idx, data] of studentsData.entries()) {
        const student = await prisma.user.upsert({
            where: { email: data.email },
            update: { passwordHash: DEFAULT_PASSWORD_HASH },
            create: {
                email: data.email,
                passwordHash: DEFAULT_PASSWORD_HASH,
                role: UserRole.STUDENT,
                student: {
                    create: {
                        nationalId: data.id,
                        studentCode: data.code,
                        titleTh: data.titleTh,
                        firstNameTh: data.firstNameTh,
                        lastNameTh: data.lastNameTh,
                        gender: data.gender,
                        birthDate: new Date('2015-01-01'),
                        classroomId: classrooms[data.classroomIdx].id,
                        studentNumber: idx + 1,
                        enrollmentDate: new Date(),
                    }
                }
            },
            include: { student: true }
        });
        students.push(student.student!);
    }
    return students;
}

async function seedParents(students: any[]) {
    const parentsData = [
        { email: 'parent1@school.com', titleTh: 'นาย', firstNameTh: 'บุญมี', lastNameTh: 'ใจรัก', phone: '0812345678', relationship: ParentRelationship.FATHER, studentIdx: 0 },
        { email: 'parent2@school.com', titleTh: 'นาง', firstNameTh: 'สมพร', lastNameTh: 'ใจรัก', phone: '0812345679', relationship: ParentRelationship.MOTHER, studentIdx: 1 },
    ];

    for (const data of parentsData) {
        await prisma.user.upsert({
            where: { email: data.email },
            update: { passwordHash: DEFAULT_PASSWORD_HASH },
            create: {
                email: data.email,
                phone: data.phone,
                passwordHash: DEFAULT_PASSWORD_HASH,
                role: UserRole.PARENT,
                parent: {
                    create: {
                        titleTh: data.titleTh,
                        firstNameTh: data.firstNameTh,
                        lastNameTh: data.lastNameTh,
                        relationship: data.relationship,
                        phone: data.phone,
                        children: {
                            create: {
                                studentId: students[data.studentIdx].id,
                                isPrimary: true,
                            }
                        }
                    }
                }
            }
        });
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
