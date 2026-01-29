// Student Exams List Page

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import { th } from 'date-fns/locale';
import { Clock, FileText, Calendar, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExams, useStudentAttempts } from '@/hooks/use-exams';
import { useAuth } from '@/components/providers/auth-provider';
import { Exam, ExamType, ExamAttempt } from '@/lib/api/exams';

const examTypeLabels: Record<ExamType, string> = {
    QUIZ: 'แบบทดสอบ',
    MIDTERM: 'สอบกลางภาค',
    FINAL: 'สอบปลายภาค',
    PRACTICE: 'ฝึกปฏิบัติ',
};

const examTypeColors: Record<ExamType, string> = {
    QUIZ: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    MIDTERM: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    FINAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    PRACTICE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export default function StudentExamsPage() {
    const { user } = useAuth();
    const { data: examsData, isLoading } = useExams({ isPublished: true });
    const { data: attempts } = useStudentAttempts(user?.id || '');

    const exams = examsData?.items || [];

    const getExamStatus = (exam: Exam) => {
        const now = new Date();
        const start = new Date(exam.startTime);
        const end = new Date(exam.endTime);

        if (isFuture(start)) {
            return { status: 'upcoming', label: 'เร็วๆ นี้', variant: 'outline' as const };
        }
        if (isPast(end)) {
            return { status: 'ended', label: 'สิ้นสุดแล้ว', variant: 'secondary' as const };
        }
        return { status: 'active', label: 'กำลังเปิดสอบ', variant: 'success' as const };
    };

    const getStudentAttemptForExam = (examId: string) => {
        return attempts?.find((a) => a.examId === examId);
    };

    const canTakeExam = (exam: Exam) => {
        const status = getExamStatus(exam);
        if (status.status !== 'active') return false;

        const attempt = getStudentAttemptForExam(exam.id);
        if (!attempt) return true; // No attempts yet

        const completedAttempts = attempts?.filter(
            (a) => a.examId === exam.id && (a.status === 'SUBMITTED' || a.status === 'GRADED')
        ).length || 0;

        return completedAttempts < exam.maxAttempts;
    };

    const hasOngoingAttempt = (examId: string) => {
        return attempts?.some((a) => a.examId === examId && a.status === 'IN_PROGRESS');
    };

    // Group exams by status
    const activeExams = exams.filter((e) => getExamStatus(e).status === 'active');
    const upcomingExams = exams.filter((e) => getExamStatus(e).status === 'upcoming');
    const completedExams = exams.filter((e) => {
        const status = getExamStatus(e).status;
        return status === 'ended' || getStudentAttemptForExam(e.id);
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ข้อสอบ</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    ดูและทำข้อสอบสำหรับวิชาที่ลงทะเบียน
                </p>
            </div>

            {/* Active Exams */}
            {activeExams.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        กำลังเปิดสอบ
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeExams.map((exam) => {
                            const ongoingAttempt = hasOngoingAttempt(exam.id);
                            const canTake = canTakeExam(exam);
                            const studentAttempt = getStudentAttemptForExam(exam.id);

                            return (
                                <Card key={exam.id} className="border-green-200 dark:border-green-800">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                                                    <CardDescription>
                                                        {exam.subjectInstance?.subject?.nameTh}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${examTypeColors[exam.type]}`}>
                                                {examTypeLabels[exam.type]}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {exam.duration} นาที
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-4 h-4" />
                                                    {exam._count?.questions || 0} ข้อ
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                สิ้นสุด: {format(new Date(exam.endTime), 'd MMM yyyy HH:mm', { locale: th })}
                                            </div>

                                            {ongoingAttempt ? (
                                                <Link href={`/dashboard/student/exams/${exam.id}`}>
                                                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                                                        <Play className="w-4 h-4 mr-2" />
                                                        ทำต่อ
                                                    </Button>
                                                </Link>
                                            ) : canTake ? (
                                                <Link href={`/dashboard/student/exams/${exam.id}`}>
                                                    <Button className="w-full">
                                                        <Play className="w-4 h-4 mr-2" />
                                                        เริ่มทำข้อสอบ
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button disabled className="w-full">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    สอบครบแล้ว
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Upcoming Exams */}
            {upcomingExams.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        กำหนดการสอบ
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingExams.map((exam) => (
                            <Card key={exam.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base">{exam.title}</CardTitle>
                                            <CardDescription>
                                                {exam.subjectInstance?.subject?.nameTh}
                                            </CardDescription>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${examTypeColors[exam.type]}`}>
                                            {examTypeLabels[exam.type]}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(exam.startTime), 'd MMM yyyy HH:mm', { locale: th })}
                                        </p>
                                        <p className="flex items-center gap-2 mt-1">
                                            <Clock className="w-4 h-4" />
                                            {exam.duration} นาที
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* No Exams */}
            {exams.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">ไม่มีข้อสอบในขณะนี้</p>
                </div>
            )}
        </div>
    );
}
