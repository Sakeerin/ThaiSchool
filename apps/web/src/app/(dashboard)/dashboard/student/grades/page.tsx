// Student Grades Overview Page

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, TrendingUp, Award, BookOpen, ChevronRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useStudentGrades, useStudentGPA, useStudentGPAX } from '@/hooks/use-grades';
import { academicApi, Semester } from '@/lib/api/subjects';

// Assume we get student ID from session - placeholder for now
const useCurrentStudent = () => {
    // In a real app, this would come from auth context
    const [studentId, setStudentId] = useState<string | null>(null);

    useEffect(() => {
        // Get from localStorage or auth state
        const stored = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null;
        setStudentId(stored);
    }, []);

    return studentId;
};

// Grade color mapping
const getGradeColor = (label: string) => {
    const colors: Record<string, string> = {
        'A': 'bg-green-500',
        'B+': 'bg-lime-500',
        'B': 'bg-yellow-500',
        'C+': 'bg-amber-500',
        'C': 'bg-orange-500',
        'D+': 'bg-red-400',
        'D': 'bg-red-500',
        'F': 'bg-gray-500',
    };
    return colors[label] || 'bg-gray-400';
};

// Subject area color mapping
const getSubjectAreaColor = (code?: string) => {
    const colors: Record<string, string> = {
        THA: 'bg-amber-100 text-amber-700 border-amber-200',
        MAT: 'bg-blue-100 text-blue-700 border-blue-200',
        SCI: 'bg-green-100 text-green-700 border-green-200',
        SOC: 'bg-purple-100 text-purple-700 border-purple-200',
        HEA: 'bg-pink-100 text-pink-700 border-pink-200',
        ART: 'bg-orange-100 text-orange-700 border-orange-200',
        OCC: 'bg-teal-100 text-teal-700 border-teal-200',
        FOR: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return colors[code || ''] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export default function StudentGradesPage() {
    const studentId = useCurrentStudent();
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string>('');

    // Fetch semesters
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const data = await academicApi.getSemesters();
                setSemesters(data);
                const current = data.find((s) => s.isCurrent);
                if (current) {
                    setSelectedSemester(current.id);
                } else if (data.length > 0) {
                    setSelectedSemester(data[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch semesters:', error);
            }
        };
        fetchSemesters();
    }, []);

    const { data: grades, isLoading: loadingGrades } = useStudentGrades(studentId || '', selectedSemester);
    const { data: gpaData, isLoading: loadingGPA } = useStudentGPA(studentId || '', selectedSemester);
    const { data: gpaxData, isLoading: loadingGPAX } = useStudentGPAX(studentId || '');

    // Group grades by subject area
    const gradesByArea = grades?.reduce((acc, grade) => {
        const areaCode = grade.subjectInstance?.subject?.subjectArea?.code || 'OTHER';
        const areaName = grade.subjectInstance?.subject?.subjectArea?.nameTh || 'อื่นๆ';

        if (!acc[areaCode]) {
            acc[areaCode] = { name: areaName, grades: [] };
        }
        acc[areaCode].grades.push(grade);
        return acc;
    }, {} as Record<string, { name: string; grades: typeof grades }>) ?? {};

    if (!studentId) {
        return (
            <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">กรุณาเข้าสู่ระบบเพื่อดูผลการเรียน</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        ผลการเรียน
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ดูเกรดและผลการเรียนในแต่ละภาคเรียน
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="เลือกภาคเรียน" />
                        </SelectTrigger>
                        <SelectContent>
                            {semesters.map((semester) => (
                                <SelectItem key={semester.id} value={semester.id}>
                                    {semester.academicYear?.name} / {semester.name}
                                    {semester.isCurrent && (
                                        <Badge variant="secondary" className="ml-2">ปัจจุบัน</Badge>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Link href="/dashboard/student/transcript">
                        <Button variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            ดูทรานสคริปต์
                        </Button>
                    </Link>
                </div>
            </div>

            {/* GPA Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">GPA ภาคเรียนนี้</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-200" />
                    </CardHeader>
                    <CardContent>
                        {loadingGPA ? (
                            <Skeleton className="h-10 w-20 bg-blue-400" />
                        ) : (
                            <>
                                <div className="text-3xl font-bold">{gpaData?.gpa?.toFixed(2) ?? '-'}</div>
                                <p className="text-xs text-blue-200">{gpaData?.totalCredits ?? 0} หน่วยกิต</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">GPAX สะสม</CardTitle>
                        <Award className="h-4 w-4 text-purple-200" />
                    </CardHeader>
                    <CardContent>
                        {loadingGPAX ? (
                            <Skeleton className="h-10 w-20 bg-purple-400" />
                        ) : (
                            <>
                                <div className="text-3xl font-bold">{gpaxData?.gpax?.toFixed(2) ?? '-'}</div>
                                <p className="text-xs text-purple-200">{gpaxData?.totalCredits ?? 0} หน่วยกิตสะสม</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">วิชาที่ลงทะเบียน</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{grades?.length ?? 0}</div>
                        <p className="text-xs text-muted-foreground">วิชาในภาคเรียนนี้</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ภาคเรียนที่ผ่านมา</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{gpaxData?.semesters?.length ?? 0}</div>
                        <p className="text-xs text-muted-foreground">ภาคเรียน</p>
                    </CardContent>
                </Card>
            </div>

            {/* Grades by Subject Area */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    ผลการเรียนรายวิชา
                </h2>

                {loadingGrades ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-40" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : Object.keys(gradesByArea).length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-4 text-gray-500">ยังไม่มีข้อมูลผลการเรียนในภาคเรียนนี้</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(gradesByArea).map(([areaCode, { name, grades: areaGrades }]) => (
                            <Card key={areaCode}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={getSubjectAreaColor(areaCode)}>
                                            {areaCode}
                                        </Badge>
                                        <CardTitle className="text-base">{name}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {areaGrades?.map((grade) => (
                                            <div
                                                key={grade.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {grade.subjectInstance?.subject?.nameTh}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                        <span>{grade.subjectInstance?.subject?.code}</span>
                                                        <span>{grade.subjectInstance?.subject?.credits} หน่วยกิต</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">คะแนน</p>
                                                        <p className="font-semibold">{grade.percentage?.toFixed(1) ?? '-'}%</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">เกรดพอยท์</p>
                                                        <p className="font-semibold">{grade.gradePoint?.toFixed(1) ?? '-'}</p>
                                                    </div>
                                                    <Badge className={`${getGradeColor(grade.gradeLabel || '')} text-white min-w-[40px] justify-center`}>
                                                        {grade.gradeLabel || '-'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* GPAX History */}
            {gpaxData?.semesters && gpaxData.semesters.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">ประวัติ GPA ย้อนหลัง</CardTitle>
                        <CardDescription>แสดงพัฒนาการผลการเรียนแต่ละภาคเรียน</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {gpaxData.semesters.map((sem, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-48 text-sm text-gray-600 dark:text-gray-400">
                                        {sem.semester.academicYear.name} / {sem.semester.name}
                                    </div>
                                    <div className="flex-1">
                                        <Progress value={sem.gpa * 25} className="h-3" />
                                    </div>
                                    <div className="w-20 text-right">
                                        <span className="font-semibold">{sem.gpa.toFixed(2)}</span>
                                        <span className="text-sm text-gray-500 ml-1">({sem.credits} นก.)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
