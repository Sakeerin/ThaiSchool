// Teacher Assignments Management Page

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, isPast, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { Plus, Pencil, Trash2, MoreHorizontal, Eye, EyeOff, ClipboardList, Users } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AssignmentForm } from './components/assignment-form';
import { useTeacherAssignments, useDeleteAssignment, usePublishAssignment, useUnpublishAssignment } from '@/hooks/use-assignments';
import { Assignment } from '@/lib/api/assignments';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const assignmentTypeLabels: Record<string, string> = {
    HOMEWORK: 'การบ้าน',
    PROJECT: 'โปรเจกต์',
    REPORT: 'รายงาน',
    PRESENTATION: 'นำเสนอ',
    EXERCISE: 'แบบฝึกหัด',
    OTHER: 'อื่นๆ',
};

export default function TeacherAssignmentsPage() {
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

    const { data: assignments, isLoading, refetch } = useTeacherAssignments();
    const deleteMutation = useDeleteAssignment();
    const publishMutation = usePublishAssignment();
    const unpublishMutation = useUnpublishAssignment();

    const handleEdit = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setFormOpen(true);
    };

    const handleDelete = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedAssignment) {
            await deleteMutation.mutateAsync(selectedAssignment.id);
            setDeleteOpen(false);
            setSelectedAssignment(null);
        }
    };

    const handlePublish = async (assignment: Assignment) => {
        await publishMutation.mutateAsync(assignment.id);
    };

    const handleUnpublish = async (assignment: Assignment) => {
        await unpublishMutation.mutateAsync(assignment.id);
    };

    const getDueDateBadge = (dueDate: string, isPublished: boolean) => {
        if (!isPublished) return null;

        const date = new Date(dueDate);
        const daysUntil = differenceInDays(date, new Date());

        if (isPast(date)) {
            return <Badge variant="destructive">เลยกำหนด</Badge>;
        } else if (daysUntil <= 1) {
            return <Badge variant="warning">ใกล้ถึงกำหนด</Badge>;
        } else if (daysUntil <= 3) {
            return <Badge variant="secondary">อีก {daysUntil} วัน</Badge>;
        }
        return null;
    };

    const columns: Column<Assignment>[] = [
        {
            key: 'title',
            header: 'งาน',
            cell: (assignment) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0">
                        <Link
                            href={`/dashboard/teacher/assignments/${assignment.id}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 block truncate"
                        >
                            {assignment.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs">
                                {assignmentTypeLabels[assignment.type] || assignment.type}
                            </Badge>
                            {assignment.description && (
                                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {assignment.description}
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
            cell: (assignment) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                        {assignment.subjectInstance?.subject?.nameTh || '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                        {assignment.subjectInstance?.semester?.academicYear?.name} / {assignment.subjectInstance?.semester?.name}
                    </p>
                </div>
            ),
        },
        {
            key: 'dueDate',
            header: 'กำหนดส่ง',
            cell: (assignment) => (
                <div className="flex flex-col gap-1">
                    <span className="text-sm">
                        {format(new Date(assignment.dueDate), 'd MMM yyyy', { locale: th })}
                    </span>
                    {getDueDateBadge(assignment.dueDate, assignment.isPublished)}
                </div>
            ),
        },
        {
            key: 'submissions',
            header: 'การส่งงาน',
            cell: (assignment) => (
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{assignment._count?.submissions || 0} คน</span>
                </div>
            ),
        },
        {
            key: 'score',
            header: 'คะแนน',
            cell: (assignment) => (
                <span className="text-sm font-medium">{assignment.maxScore} คะแนน</span>
            ),
        },
        {
            key: 'status',
            header: 'สถานะ',
            cell: (assignment) => (
                <Badge variant={assignment.isPublished ? 'success' : 'secondary'}>
                    {assignment.isPublished ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                </Badge>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">งานที่มอบหมาย</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        จัดการงาน การบ้าน และโปรเจกต์สำหรับวิชาที่สอน
                    </p>
                </div>
                <Button onClick={() => { setSelectedAssignment(null); setFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างงาน
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={assignments || []}
                loading={isLoading}
                searchPlaceholder="ค้นหางาน..."
                emptyMessage="ยังไม่มีงาน"
                actions={(assignment) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/teacher/assignments/${assignment.id}`}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    ดู/แก้ไข
                                </Link>
                            </DropdownMenuItem>
                            {assignment.isPublished ? (
                                <DropdownMenuItem
                                    onClick={() => handleUnpublish(assignment)}
                                    disabled={unpublishMutation.isPending}
                                >
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    ยกเลิกเผยแพร่
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    onClick={() => handlePublish(assignment)}
                                    disabled={publishMutation.isPending}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    เผยแพร่
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(assignment)}
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
            <AssignmentForm
                open={formOpen}
                onOpenChange={setFormOpen}
                assignment={selectedAssignment}
                onSuccess={refetch}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="ยืนยันการลบ"
                description={`คุณต้องการลบงาน "${selectedAssignment?.title}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
                confirmText="ลบ"
                onConfirm={confirmDelete}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
