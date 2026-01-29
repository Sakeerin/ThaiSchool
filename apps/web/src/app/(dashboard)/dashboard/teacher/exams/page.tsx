// Teacher Exams Management Page

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, isPast, isFuture } from 'date-fns';
import { th } from 'date-fns/locale';
import { Plus, Pencil, Trash2, MoreHorizontal, Eye, EyeOff, FileText, Users, Clock } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ExamForm } from './components/exam-form';
import { useExams, useDeleteExam, usePublishExam, useUnpublishExam } from '@/hooks/use-exams';
import { Exam, ExamType } from '@/lib/api/exams';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export default function TeacherExamsPage() {
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    const { data: examsData, isLoading, refetch } = useExams();
    const deleteMutation = useDeleteExam();
    const publishMutation = usePublishExam();
    const unpublishMutation = useUnpublishExam();

    const exams = examsData?.items || [];

    const handleEdit = (exam: Exam) => {
        setSelectedExam(exam);
        setFormOpen(true);
    };

    const handleDelete = (exam: Exam) => {
        setSelectedExam(exam);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedExam) {
            await deleteMutation.mutateAsync(selectedExam.id);
            setDeleteOpen(false);
            setSelectedExam(null);
        }
    };

    const handlePublish = async (exam: Exam) => {
        await publishMutation.mutateAsync(exam.id);
    };

    const handleUnpublish = async (exam: Exam) => {
        await unpublishMutation.mutateAsync(exam.id);
    };

    const getExamStatus = (exam: Exam) => {
        const now = new Date();
        const start = new Date(exam.startTime);
        const end = new Date(exam.endTime);

        if (!exam.isPublished) {
            return { label: 'ฉบับร่าง', variant: 'secondary' as const };
        }
        if (isFuture(start)) {
            return { label: 'กำหนดแล้ว', variant: 'outline' as const };
        }
        if (isPast(end)) {
            return { label: 'สิ้นสุดแล้ว', variant: 'destructive' as const };
        }
        return { label: 'กำลังสอบ', variant: 'success' as const };
    };

    const columns: Column<Exam>[] = [
        {
            key: 'title',
            header: 'ข้อสอบ',
            cell: (exam) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                        <Link
                            href={`/dashboard/teacher/exams/${exam.id}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 block truncate"
                        >
                            {exam.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${examTypeColors[exam.type]}`}>
                                {examTypeLabels[exam.type]}
                            </span>
                            {exam.description && (
                                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {exam.description}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'subject',
            header: 'วิชา',
            cell: (exam) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {exam.subjectInstance?.subject?.nameTh || '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                        {exam.subjectInstance?.semester?.academicYear?.name} / {exam.subjectInstance?.semester?.name}
                    </p>
                </div>
            ),
        },
        {
            key: 'schedule',
            header: 'กำหนดการ',
            cell: (exam) => (
                <div className="flex flex-col gap-0.5 text-sm">
                    <span>
                        {format(new Date(exam.startTime), 'd MMM yyyy HH:mm', { locale: th })}
                    </span>
                    <span className="text-gray-500 text-xs">
                        ถึง {format(new Date(exam.endTime), 'd MMM yyyy HH:mm', { locale: th })}
                    </span>
                </div>
            ),
        },
        {
            key: 'duration',
            header: 'เวลา',
            cell: (exam) => (
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{exam.duration} นาที</span>
                </div>
            ),
        },
        {
            key: 'questions',
            header: 'ข้อสอบ',
            cell: (exam) => (
                <span className="text-sm">{exam._count?.questions || 0} ข้อ</span>
            ),
        },
        {
            key: 'attempts',
            header: 'ทำข้อสอบ',
            cell: (exam) => (
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{exam._count?.attempts || 0} ครั้ง</span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'สถานะ',
            cell: (exam) => {
                const status = getExamStatus(exam);
                return <Badge variant={status.variant}>{status.label}</Badge>;
            },
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ข้อสอบ</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        จัดการข้อสอบ แบบทดสอบ และการสอบสำหรับวิชาที่สอน
                    </p>
                </div>
                <Button onClick={() => { setSelectedExam(null); setFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างข้อสอบ
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={exams}
                loading={isLoading}
                searchPlaceholder="ค้นหาข้อสอบ..."
                emptyMessage="ยังไม่มีข้อสอบ"
                actions={(exam) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/teacher/exams/${exam.id}`}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    ดู/แก้ไข
                                </Link>
                            </DropdownMenuItem>
                            {exam.isPublished ? (
                                <DropdownMenuItem
                                    onClick={() => handleUnpublish(exam)}
                                    disabled={unpublishMutation.isPending}
                                >
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    ยกเลิกเผยแพร่
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    onClick={() => handlePublish(exam)}
                                    disabled={publishMutation.isPending}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    เผยแพร่
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(exam)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                ลบ
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            />

            {/* Create/Edit Modal */}
            <ExamForm
                open={formOpen}
                onOpenChange={setFormOpen}
                exam={selectedExam}
                onSuccess={refetch}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="ยืนยันการลบ"
                description={`คุณต้องการลบข้อสอบ "${selectedExam?.title}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
                confirmText="ลบ"
                onConfirm={confirmDelete}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
