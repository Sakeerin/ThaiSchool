// Student Exam Taking Page

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
    ArrowLeft,
    ArrowRight,
    Clock,
    AlertTriangle,
    CheckCircle,
    Flag,
    Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Progress } from '@/components/ui/progress';
import {
    useExam,
    useStartExamAttempt,
    useSubmitAnswer,
    useSubmitExam,
    useExamAttempt,
} from '@/hooks/use-exams';
import { QuestionType, QuestionOption, ExamAttempt } from '@/lib/api/exams';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function StudentExamPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.id as string;

    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [examStarted, setExamStarted] = useState(false);

    const { data: exam, isLoading: loadingExam } = useExam(examId);
    const { data: attempt, isLoading: loadingAttempt } = useExamAttempt(attemptId || '');
    const startAttemptMutation = useStartExamAttempt();
    const submitAnswerMutation = useSubmitAnswer();
    const submitExamMutation = useSubmitExam();

    const questions = exam?.questions || [];
    const currentQ = questions[currentQuestion];

    // Initialize timer
    useEffect(() => {
        if (exam && examStarted && timeLeft === null) {
            setTimeLeft(exam.duration * 60); // Convert minutes to seconds
        }
    }, [exam, examStarted, timeLeft]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    // Auto-submit when time runs out
                    handleSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartExam = async () => {
        try {
            const result = await startAttemptMutation.mutateAsync(examId);
            setAttemptId(result.id);
            setExamStarted(true);
        } catch (error) {
            console.error('Failed to start exam:', error);
        }
    };

    const handleAnswer = async (questionId: string, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));

        if (attemptId) {
            try {
                await submitAnswerMutation.mutateAsync({
                    attemptId,
                    dto: { questionId, answer },
                });
            } catch (error) {
                console.error('Failed to save answer:', error);
            }
        }
    };

    const handleFlag = (questionId: string) => {
        setFlagged((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const handleSubmitExam = async () => {
        if (!attemptId) return;

        try {
            await submitExamMutation.mutateAsync(attemptId);
            router.push(`/dashboard/student/exams/${examId}/result?attempt=${attemptId}`);
        } catch (error) {
            console.error('Failed to submit exam:', error);
        }
    };

    const goToQuestion = (index: number) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestion(index);
        }
    };

    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    if (loadingExam) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">ไม่พบข้อสอบ</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    กลับ
                </Button>
            </div>
        );
    }

    // Pre-exam screen
    if (!examStarted) {
        return (
            <div className="max-w-2xl mx-auto py-8">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{exam.title}</CardTitle>
                        <p className="text-gray-500">{exam.subjectInstance?.subject?.nameTh}</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                <p className="text-sm text-gray-500">เวลาสอบ</p>
                                <p className="font-semibold">{exam.duration} นาที</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                <p className="text-sm text-gray-500">จำนวนข้อ</p>
                                <p className="font-semibold">{questions.length} ข้อ</p>
                            </div>
                        </div>

                        {exam.instructions && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                                    คำแนะนำในการสอบ
                                </h3>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">
                                    {exam.instructions}
                                </p>
                            </div>
                        )}

                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-700 dark:text-red-300">
                                    <p className="font-medium">ข้อควรระวัง:</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>เมื่อเริ่มสอบแล้วจะไม่สามารถหยุดพักได้</li>
                                        <li>เวลาจะนับถอยหลังอัตโนมัติ</li>
                                        <li>หากเวลาหมดระบบจะส่งข้อสอบให้อัตโนมัติ</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1" onClick={() => router.back()}>
                                ยกเลิก
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleStartExam}
                                disabled={startAttemptMutation.isPending}
                            >
                                เริ่มทำข้อสอบ
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Exam-taking screen
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header with timer */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-semibold text-gray-900 dark:text-white">{exam.title}</h1>
                            <p className="text-sm text-gray-500">ข้อที่ {currentQuestion + 1} จาก {questions.length}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg ${timeLeft && timeLeft < 300
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                <Clock className="w-5 h-5" />
                                {timeLeft ? formatTime(timeLeft) : '--:--'}
                            </div>
                            <Button onClick={() => setConfirmSubmit(true)}>
                                <Send className="w-4 h-4 mr-2" />
                                ส่งข้อสอบ
                            </Button>
                        </div>
                    </div>
                    <Progress value={progress} className="mt-2" />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Area */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <Badge variant="outline" className="mb-2">ข้อที่ {currentQuestion + 1}</Badge>
                                <p className="text-sm text-gray-500">{currentQ?.points} คะแนน</p>
                            </div>
                            <Button
                                variant={flagged.has(currentQ?.questionId) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleFlag(currentQ?.questionId)}
                            >
                                <Flag className="w-4 h-4 mr-1" />
                                {flagged.has(currentQ?.questionId) ? 'ปักธง' : 'ปักธงไว้ทบทวน'}
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Question Content */}
                            <div className="text-lg text-gray-900 dark:text-white whitespace-pre-wrap">
                                {currentQ?.question?.content}
                            </div>

                            {/* Answer Input based on question type */}
                            {currentQ?.question?.type === 'MULTIPLE_CHOICE' && (
                                <RadioGroup
                                    value={answers[currentQ.questionId] || ''}
                                    onValueChange={(value) => handleAnswer(currentQ.questionId, value)}
                                    className="space-y-3"
                                >
                                    {(currentQ.question.options as QuestionOption[])?.map((option, idx) => (
                                        <div
                                            key={option.id}
                                            className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${answers[currentQ.questionId] === option.id
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                            onClick={() => handleAnswer(currentQ.questionId, option.id)}
                                        >
                                            <RadioGroupItem value={option.id} id={option.id} />
                                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                                <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                                                {option.text}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}

                            {currentQ?.question?.type === 'TRUE_FALSE' && (
                                <div className="flex gap-4">
                                    {['true', 'false'].map((value) => (
                                        <Button
                                            key={value}
                                            variant={answers[currentQ.questionId] === value ? 'default' : 'outline'}
                                            className="flex-1 py-6 text-lg"
                                            onClick={() => handleAnswer(currentQ.questionId, value)}
                                        >
                                            {value === 'true' ? 'ถูก' : 'ผิด'}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {(currentQ?.question?.type === 'FILL_BLANK' || currentQ?.question?.type === 'SHORT_ANSWER') && (
                                <Input
                                    value={answers[currentQ.questionId] || ''}
                                    onChange={(e) => handleAnswer(currentQ.questionId, e.target.value)}
                                    placeholder="พิมพ์คำตอบ..."
                                    className="text-lg py-6"
                                />
                            )}

                            {currentQ?.question?.type === 'ESSAY' && (
                                <Textarea
                                    value={answers[currentQ.questionId] || ''}
                                    onChange={(e) => handleAnswer(currentQ.questionId, e.target.value)}
                                    placeholder="พิมพ์คำตอบ..."
                                    rows={8}
                                    className="text-base"
                                />
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => goToQuestion(currentQuestion - 1)}
                                    disabled={currentQuestion === 0}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    ข้อก่อนหน้า
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => goToQuestion(currentQuestion + 1)}
                                    disabled={currentQuestion === questions.length - 1}
                                >
                                    ข้อถัดไป
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Question Navigator */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-base">รายการข้อสอบ</CardTitle>
                            <p className="text-sm text-gray-500">
                                ตอบแล้ว {answeredCount}/{questions.length} ข้อ
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, idx) => {
                                    const isAnswered = !!answers[q.questionId];
                                    const isFlagged = flagged.has(q.questionId);
                                    const isCurrent = idx === currentQuestion;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => goToQuestion(idx)}
                                            className={`relative w-10 h-10 rounded-lg text-sm font-medium transition-colors ${isCurrent
                                                    ? 'bg-indigo-600 text-white'
                                                    : isAnswered
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                } hover:ring-2 ring-indigo-500`}
                                        >
                                            {idx + 1}
                                            {isFlagged && (
                                                <Flag className="absolute -top-1 -right-1 w-3 h-3 text-orange-500 fill-orange-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-4 pt-4 border-t space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30"></div>
                                    <span>ตอบแล้ว</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800"></div>
                                    <span>ยังไม่ตอบ</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Flag className="w-4 h-4 text-orange-500 fill-orange-500" />
                                    <span>ปักธงทบทวน</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Submit Confirmation */}
            <ConfirmDialog
                open={confirmSubmit}
                onOpenChange={setConfirmSubmit}
                title="ยืนยันส่งข้อสอบ"
                description={`คุณตอบคำถามไปแล้ว ${answeredCount} จาก ${questions.length} ข้อ ต้องการส่งข้อสอบหรือไม่?`}
                confirmText="ส่งข้อสอบ"
                onConfirm={handleSubmitExam}
                loading={submitExamMutation.isPending}
            />
        </div>
    );
}
