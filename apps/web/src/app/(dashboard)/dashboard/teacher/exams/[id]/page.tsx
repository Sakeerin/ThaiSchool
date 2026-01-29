// Exam Detail Page - View exam details and manage questions

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Clock,
    Users,
    Calendar,
    FileText,
    Settings,
    Eye,
    EyeOff,
    GripVertical,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    useExam,
    usePublishExam,
    useUnpublishExam,
    useRemoveExamQuestion,
    useQuestionBanks,
    useQuestions,
    useAddExamQuestion,
} from '@/hooks/use-exams';
import { ExamType, QuestionType, Difficulty, Question } from '@/lib/api/exams';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const examTypeLabels: Record<ExamType, string> = {
    QUIZ: 'แบบทดสอบ',
    MIDTERM: 'สอบกลางภาค',
    FINAL: 'สอบปลายภาค',
    PRACTICE: 'ฝึกปฏิบัติ',
};

const questionTypeLabels: Record<QuestionType, string> = {
    MULTIPLE_CHOICE: 'ปรนัย',
    TRUE_FALSE: 'ถูก/ผิด',
    FILL_BLANK: 'เติมคำ',
    SHORT_ANSWER: 'ตอบสั้น',
    ESSAY: 'เรียงความ',
    MATCHING: 'จับคู่',
};

const difficultyLabels: Record<Difficulty, { label: string; color: string }> = {
    EASY: { label: 'ง่าย', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    MEDIUM: { label: 'ปานกลาง', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    HARD: { label: 'ยาก', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export default function ExamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.id as string;

    const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
    const [addQuestionOpen, setAddQuestionOpen] = useState(false);
    const [selectedBankId, setSelectedBankId] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

    const { data: exam, isLoading, refetch } = useExam(examId);
    const publishMutation = usePublishExam();
    const unpublishMutation = useUnpublishExam();
    const removeQuestionMutation = useRemoveExamQuestion();
    const addQuestionMutation = useAddExamQuestion();

    // Get question banks for the exam's subject
    const subjectId = exam?.subjectInstance?.subject?.id || '';
    const { data: questionBanks } = useQuestionBanks(subjectId);
    const { data: bankQuestions } = useQuestions(selectedBankId);

    // Filter out questions already in the exam
    const existingQuestionIds = exam?.questions?.map((eq) => eq.questionId) || [];
    const availableQuestions = bankQuestions?.filter(
        (q) => !existingQuestionIds.includes(q.id)
    ) || [];

    const handlePublish = async () => {
        if (exam) {
            await publishMutation.mutateAsync(exam.id);
            refetch();
        }
    };

    const handleUnpublish = async () => {
        if (exam) {
            await unpublishMutation.mutateAsync(exam.id);
            refetch();
        }
    };

    const handleRemoveQuestion = async () => {
        if (deleteQuestionId && exam) {
            await removeQuestionMutation.mutateAsync({
                examId: exam.id,
                questionId: deleteQuestionId,
            });
            setDeleteQuestionId(null);
            refetch();
        }
    };

    const handleAddQuestions = async () => {
        if (selectedQuestions.length === 0 || !exam) return;

        for (const questionId of selectedQuestions) {
            await addQuestionMutation.mutateAsync({
                examId: exam.id,
                dto: { questionId },
            });
        }

        setSelectedQuestions([]);
        setAddQuestionOpen(false);
        refetch();
    };

    const toggleQuestionSelection = (questionId: string) => {
        setSelectedQuestions((prev) =>
            prev.includes(questionId)
                ? prev.filter((id) => id !== questionId)
                : [...prev, questionId]
        );
    };

    if (isLoading) {
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
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    กลับ
                </Button>
            </div>
        );
    }

    const totalPoints = exam.questions?.reduce((sum, eq) => sum + eq.points, 0) || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {exam.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{examTypeLabels[exam.type]}</Badge>
                            <span className="text-sm text-gray-500">
                                {exam.subjectInstance?.subject?.nameTh}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {exam.isPublished ? (
                        <Button
                            variant="outline"
                            onClick={handleUnpublish}
                            disabled={unpublishMutation.isPending}
                        >
                            <EyeOff className="w-4 h-4 mr-2" />
                            ยกเลิกเผยแพร่
                        </Button>
                    ) : (
                        <Button
                            onClick={handlePublish}
                            disabled={publishMutation.isPending || (exam.questions?.length || 0) === 0}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            เผยแพร่
                        </Button>
                    )}
                </div>
            </div>

            {/* Exam Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">เริ่มสอบ</p>
                                <p className="font-medium">
                                    {format(new Date(exam.startTime), 'd MMM yyyy HH:mm', { locale: th })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">เวลาสอบ</p>
                                <p className="font-medium">{exam.duration} นาที</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">จำนวนข้อ</p>
                                <p className="font-medium">{exam.questions?.length || 0} ข้อ ({totalPoints} คะแนน)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ทำข้อสอบแล้ว</p>
                                <p className="font-medium">{exam._count?.attempts || 0} ครั้ง</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Settings Summary */}
            {exam.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">คำอธิบาย</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">{exam.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Questions Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>ข้อสอบ</CardTitle>
                        <CardDescription>
                            จัดการคำถามในข้อสอบ
                        </CardDescription>
                    </div>
                    <Button onClick={() => setAddQuestionOpen(true)} disabled={!subjectId}>
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มข้อสอบ
                    </Button>
                </CardHeader>
                <CardContent>
                    {exam.questions && exam.questions.length > 0 ? (
                        <div className="space-y-3">
                            {exam.questions.map((eq, index) => (
                                <div
                                    key={eq.id}
                                    className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <GripVertical className="w-5 h-5 cursor-grab" />
                                        <span className="font-mono text-sm w-6">{index + 1}.</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-xs">
                                                {questionTypeLabels[eq.question?.type || 'MULTIPLE_CHOICE']}
                                            </Badge>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyLabels[eq.question?.difficulty || 'MEDIUM'].color}`}>
                                                {difficultyLabels[eq.question?.difficulty || 'MEDIUM'].label}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {eq.points} คะแนน
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                            {eq.question?.content}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => setDeleteQuestionId(eq.questionId)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>ยังไม่มีข้อสอบ</p>
                            <p className="text-sm">เพิ่มข้อสอบจากคลังข้อสอบ</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Question Dialog */}
            <Dialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>เพิ่มข้อสอบ</DialogTitle>
                        <DialogDescription>
                            เลือกข้อสอบจากคลังข้อสอบ
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>เลือกคลังข้อสอบ</Label>
                            <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกคลังข้อสอบ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {questionBanks?.map((bank) => (
                                        <SelectItem key={bank.id} value={bank.id}>
                                            {bank.name} ({bank._count?.questions || 0} ข้อ)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedBankId && (
                            <div className="space-y-2">
                                <Label>เลือกข้อสอบ ({selectedQuestions.length} ข้อที่เลือก)</Label>
                                {availableQuestions.length > 0 ? (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-2">
                                        {availableQuestions.map((question) => (
                                            <div
                                                key={question.id}
                                                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedQuestions.includes(question.id)
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                                                        : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }`}
                                                onClick={() => toggleQuestionSelection(question.id)}
                                            >
                                                <Checkbox
                                                    checked={selectedQuestions.includes(question.id)}
                                                    onCheckedChange={() => toggleQuestionSelection(question.id)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {questionTypeLabels[question.type]}
                                                        </Badge>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyLabels[question.difficulty].color}`}>
                                                            {difficultyLabels[question.difficulty].label}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {question.points} คะแนน
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                                        {question.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        ไม่มีข้อสอบในคลังนี้หรือถูกเพิ่มแล้วทั้งหมด
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setAddQuestionOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleAddQuestions}
                            disabled={selectedQuestions.length === 0 || addQuestionMutation.isPending}
                        >
                            เพิ่ม {selectedQuestions.length} ข้อ
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Question Confirmation */}
            <ConfirmDialog
                open={!!deleteQuestionId}
                onOpenChange={(open) => !open && setDeleteQuestionId(null)}
                title="ยืนยันการลบ"
                description="คุณต้องการลบข้อสอบนี้ออกจากชุดข้อสอบหรือไม่?"
                confirmText="ลบ"
                onConfirm={handleRemoveQuestion}
                loading={removeQuestionMutation.isPending}
            />
        </div>
    );
}
