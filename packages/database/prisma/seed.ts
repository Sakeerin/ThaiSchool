// Thai School LMS - Database Seed
// Initializes essential data: grade levels, subject areas, subjects

import { PrismaClient, EducationStage } from '@prisma/client';

const prisma = new PrismaClient();

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
                        gradingPeriods: {
                            create: [
                                {
                                    name: 'คะแนนเก็บภาคเรียนที่ 1',
                                    type: 'CLASSWORK',
                                    weight: 0.3,
                                    startDate: new Date(`${currentYear - 543}-05-16`),
                                    endDate: new Date(`${currentYear - 543}-10-10`),
                                },
                                {
                                    name: 'สอบกลางภาค ภาคเรียนที่ 1',
                                    type: 'MIDTERM',
                                    weight: 0.2,
                                    startDate: new Date(`${currentYear - 543}-07-15`),
                                    endDate: new Date(`${currentYear - 543}-07-25`),
                                },
                                {
                                    name: 'สอบปลายภาค ภาคเรียนที่ 1',
                                    type: 'FINAL',
                                    weight: 0.5,
                                    startDate: new Date(`${currentYear - 543}-09-25`),
                                    endDate: new Date(`${currentYear - 543}-10-05`),
                                },
                            ],
                        },
                    },
                    {
                        number: 2,
                        name: 'ภาคเรียนที่ 2',
                        startDate: new Date(`${currentYear - 543}-11-01`),
                        endDate: new Date(`${currentYear - 542}-03-31`),
                        isCurrent: false,
                        gradingPeriods: {
                            create: [
                                {
                                    name: 'คะแนนเก็บภาคเรียนที่ 2',
                                    type: 'CLASSWORK',
                                    weight: 0.3,
                                    startDate: new Date(`${currentYear - 543}-11-01`),
                                    endDate: new Date(`${currentYear - 542}-03-31`),
                                },
                                {
                                    name: 'สอบกลางภาค ภาคเรียนที่ 2',
                                    type: 'MIDTERM',
                                    weight: 0.2,
                                    startDate: new Date(`${currentYear - 543}-01-10`),
                                    endDate: new Date(`${currentYear - 543}-01-20`),
                                },
                                {
                                    name: 'สอบปลายภาค ภาคเรียนที่ 2',
                                    type: 'FINAL',
                                    weight: 0.5,
                                    startDate: new Date(`${currentYear - 542}-03-01`),
                                    endDate: new Date(`${currentYear - 542}-03-15`),
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    return academicYear;
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
