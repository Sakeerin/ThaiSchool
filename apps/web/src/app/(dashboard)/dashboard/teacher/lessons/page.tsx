// Teacher Lessons Management Page

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, MoreHorizontal, Eye, EyeOff, BookOpen, FileText } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LessonForm } from './components/lesson-form';
import { useTeacherLessons, useDeleteLesson, usePublishLesson, useUnpublishLesson } from '@/hooks/use-lessons';
import { Lesson } from '@/lib/api/lessons';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TeacherLessonsPage() {
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    const { data: lessons, isLoading, refetch } = useTeacherLessons();
    const deleteMutation = useDeleteLesson();
    const publishMutation = usePublishLesson();
    const unpublishMutation = useUnpublishLesson();

    const handleEdit = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setFormOpen(true);
    };

    const handleDelete = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedLesson) {
            await deleteMutation.mutateAsync(selectedLesson.id);
            setDeleteOpen(false);
            setSelectedLesson(null);
        }
    };

    const handlePublish = async (lesson: Lesson) => {
        await publishMutation.mutateAsync(lesson.id);
    };

    const handleUnpublish = async (lesson: Lesson) => {
        await unpublishMutation.mutateAsync(lesson.id);
    };

    const columns: Column<Lesson>[] = [
        {
            key: 'title',
            header: 'บทเรียน',
            cell: (lesson) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                        <Link
                            href={`/dashboard/teacher/lessons/${lesson.id}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block truncate"
                        >
                            {lesson.title}
                        </Link>
                        {lesson.description && (
                            <p className="text-xs text-gray-500 truncate">{lesson.description}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'subject',
            header: 'วิชา',
            cell: (lesson) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {lesson.subjectInstance?.subject?.nameTh || '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                        {lesson.subjectInstance?.semester?.academicYear?.name} / {lesson.subjectInstance?.semester?.name}
                    </p>
                </div>
            ),
        },
        {
            key: 'contents',
            header: 'เนื้อหา',
            cell: (lesson) => (
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>{lesson._count?.contents || 0} รายการ</span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'สถานะ',
            cell: (lesson) => (
                <Badge variant={lesson.isPublished ? 'success' : 'secondary'}>
                    {lesson.isPublished ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                </Badge>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">บทเรียนของฉัน</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        จัดการบทเรียนและเนื้อหาสำหรับวิชาที่สอน
                    </p>
                </div>
                <Button onClick={() => { setSelectedLesson(null); setFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างบทเรียน
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={lessons || []}
                loading={isLoading}
                searchPlaceholder="ค้นหาบทเรียน..."
                emptyMessage="ยังไม่มีบทเรียน"
                actions={(lesson) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/teacher/lessons/${lesson.id}`}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    แก้ไข
                                </Link>
                            </DropdownMenuItem>
                            {lesson.isPublished ? (
                                <DropdownMenuItem
                                    onClick={() => handleUnpublish(lesson)}
                                    disabled={unpublishMutation.isPending}
                                >
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    ยกเลิกเผยแพร่
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    onClick={() => handlePublish(lesson)}
                                    disabled={publishMutation.isPending}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    เผยแพร่
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(lesson)}
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
            <LessonForm
                open={formOpen}
                onOpenChange={setFormOpen}
                lesson={selectedLesson}
                onSuccess={refetch}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="ยืนยันการลบ"
                description={`คุณต้องการลบบทเรียน "${selectedLesson?.title}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
                confirmText="ลบ"
                onConfirm={confirmDelete}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
