// Student Exam Result Page

'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Award,
    BarChart3,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useExamAttempt, useExam } from '@/hooks/use-exams';
import { QuestionType, QuestionOption } from '@/lib/api/exams';

const questionTypeLabels: Record<QuestionType, string> = {
    MULTIPLE_CHOICE: 'ปรนัย',
    TRUE_FALSE: 'ถูก/ผิด',
    FILL_BLANK: 'เติมคำ',
    SHORT_ANSWER: 'ตอบสั้น',
    ESSAY: 'เรียงความ',
    MATCHING: 'จับคู่',
};

export default function ExamResultPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const examId = params.id as string;
    const attemptId = searchParams.get('attempt') || '';

    const { data: attempt, isLoading: loadingAttempt } = useExamAttempt(attemptId);
    const { data: exam, isLoading: loadingExam } = useExam(examId);

    if (loadingAttempt || loadingExam) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!attempt || !exam) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">ไม่พบผลสอบ</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    กลับ
                </Button>
            </div>
        );
    }

    const maxScore = exam.maxScore;
    const score = attempt.score || 0;
    const percentage = (score / maxScore) * 100;
    const passed = exam.passingScore ? score >= exam.passingScore : percentage >= 50;

    // Convert answers array to lookup record
    type AnswerMap = Record<string, { answer: string; isCorrect?: boolean; points?: number }>;
    const answersArray = attempt.answers || [];
    const answers: AnswerMap = Array.isArray(answersArray)
        ? answersArray.reduce((acc: AnswerMap, item: { questionId: string; answer: string; isCorrect?: boolean; points?: number }) => {
            acc[item.questionId] = item;
            return acc;
        }, {})
        : {};

    // Count correct/incorrect
    let correctCount = 0;
    let incorrectCount = 0;
    let pendingCount = 0;

    exam.questions?.forEach((q) => {
        const answer = answers[q.questionId];
        if (!answer) {
            pendingCount++;
        } else if (answer.isCorrect === true) {
            correctCount++;
        } else if (answer.isCorrect === false) {
            incorrectCount++;
        } else {
            pendingCount++; // Essay questions pending grading
        }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/student/exams')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ผลการสอบ</h1>
                    <p className="text-sm text-gray-500">{exam.title}</p>
                </div>
            </div>

            {/* Score Card */}
            <Card className={passed ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${passed
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                            {passed ? (
                                <Award className="w-12 h-12 text-green-600 dark:text-green-400" />
                            ) : (
                                <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                            )}
                        </div>
                        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                            {score.toFixed(1)} <span className="text-2xl text-gray-500">/ {maxScore}</span>
                        </div>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                            {percentage.toFixed(1)}%
                        </p>
                        <Badge
                            variant={passed ? 'success' : 'destructive'}
                            className="text-base px-4 py-1"
                        >
                            {passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ถูก</p>
                                <p className="text-xl font-bold text-green-600">{correctCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ผิด</p>
                                <p className="text-xl font-bold text-red-600">{incorrectCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">รอตรวจ</p>
                                <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ทั้งหมด</p>
                                <p className="text-xl font-bold">{exam.questions?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Exam Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        รายละเอียดการสอบ
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">วันที่สอบ</p>
                            <p className="font-medium">
                                {format(new Date(attempt.startedAt), 'd MMM yyyy HH:mm', { locale: th })}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">ส่งเมื่อ</p>
                            <p className="font-medium">
                                {attempt.submittedAt
                                    ? format(new Date(attempt.submittedAt), 'd MMM yyyy HH:mm', { locale: th })
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">เวลาที่ใช้</p>
                            <p className="font-medium">
                                {attempt.submittedAt
                                    ? `${Math.round(
                                        (new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) /
                                        60000
                                    )} นาที`
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">สถานะ</p>
                            <Badge variant={attempt.status === 'GRADED' ? 'success' : 'secondary'}>
                                {attempt.status === 'GRADED' ? 'ตรวจแล้ว' : 'รอตรวจ'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question Review (if allowed) */}
            {/* This can be expanded to show each question with answers if the teacher allows review */}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => router.push('/dashboard/student/exams')}>
                    กลับหน้าข้อสอบ
                </Button>
            </div>
        </div>
    );
}
