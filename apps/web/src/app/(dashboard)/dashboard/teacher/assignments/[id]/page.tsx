// Teacher Assignment Detail Page - View submissions and grade

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, isPast } from 'date-fns';
import { th } from 'date-fns/locale';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    RotateCcw,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column } from '@/components/ui/data-table';
import { useAssignment, usePublishAssignment, useUnpublishAssignment } from '@/hooks/use-assignments';
import { Submission } from '@/lib/api/assignments';
import { GradeForm } from './components/grade-form';
import { AssignmentForm } from '../components/assignment-form';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' }> = {
    PENDING: { label: 'รอส่งงาน', variant: 'secondary' },
    SUBMITTED: { label: 'ส่งแล้ว', variant: 'default' },
    GRADED: { label: 'ให้คะแนนแล้ว', variant: 'success' },
    RETURNED: { label: 'ส่งคืน', variant: 'warning' },
};

const assignmentTypeLabels: Record<string, string> = {
    HOMEWORK: 'การบ้าน',
    PROJECT: 'โปรเจกต์',
    REPORT: 'รายงาน',
    PRESENTATION: 'นำเสนอ',
    EXERCISE: 'แบบฝึกหัด',
    OTHER: 'อื่นๆ',
};

export default function TeacherAssignmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const assignmentId = params.id as string;

    const [editOpen, setEditOpen] = useState(false);
    const [gradeOpen, setGradeOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const { data: assignment, isLoading, refetch } = useAssignment(assignmentId);
    const publishMutation = usePublishAssignment();
    const unpublishMutation = useUnpublishAssignment();

    const handleGrade = (submission: Submission) => {
        setSelectedSubmission(submission);
        setGradeOpen(true);
    };

    const submissionColumns: Column<Submission>[] = [
        {
            key: 'student',
            header: 'นักเรียน',
            cell: (submission) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-sm font-medium">
                            {submission.student?.studentNumber || '-'}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium">
                            {submission.student?.titleTh} {submission.student?.firstNameTh} {submission.student?.lastNameTh}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'submittedAt',
            header: 'เวลาส่ง',
            cell: (submission) => (
                <div className="flex flex-col">
                    {submission.submittedAt ? (
                        <>
                            <span className="text-sm">
                                {format(new Date(submission.submittedAt), 'd MMM yyyy HH:mm', { locale: th })}
                            </span>
                            {submission.isLate && (
                                <Badge variant="destructive" className="w-fit mt-1">ส่งช้า</Badge>
                            )}
                        </>
                    ) : (
                        <span className="text-gray-400">ยังไม่ส่ง</span>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'สถานะ',
            cell: (submission) => {
                const status = statusLabels[submission.status] || statusLabels.PENDING;
                return <Badge variant={status.variant}>{status.label}</Badge>;
            },
        },
        {
            key: 'score',
            header: 'คะแนน',
            cell: (submission) => (
                <div className="flex items-center gap-2">
                    {submission.status === 'GRADED' ? (
                        <span className="font-medium text-green-600">
                            {submission.score}/{assignment?.maxScore}
                        </span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            ),
        },
        {
            key: 'files',
            header: 'ไฟล์',
            cell: (submission) => {
                const files = submission.files || [];
                return files.length > 0 ? (
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>{files.length} ไฟล์</span>
                    </div>
                ) : (
                    <span className="text-gray-400">-</span>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">ไม่พบงาน</p>
                <Button variant="link" onClick={() => router.back()}>
                    กลับ
                </Button>
            </div>
        );
    }

    const isOverdue = isPast(new Date(assignment.dueDate));
    const submittedCount = assignment.submissions?.filter(s => s.status !== 'PENDING').length || 0;
    const gradedCount = assignment.submissions?.filter(s => s.status === 'GRADED').length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {assignment.title}
                        </h1>
                        <Badge variant={assignment.isPublished ? 'success' : 'secondary'}>
                            {assignment.isPublished ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        {assignment.subjectInstance?.subject?.nameTh} • {assignmentTypeLabels[assignment.type]}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setEditOpen(true)}>
                        แก้ไข
                    </Button>
                    {assignment.isPublished ? (
                        <Button
                            variant="outline"
                            onClick={() => unpublishMutation.mutateAsync(assignment.id).then(() => refetch())}
                            disabled={unpublishMutation.isPending}
                        >
                            ยกเลิกเผยแพร่
                        </Button>
                    ) : (
                        <Button
                            onClick={() => publishMutation.mutateAsync(assignment.id).then(() => refetch())}
                            disabled={publishMutation.isPending}
                        >
                            เผยแพร่
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">กำหนดส่ง</p>
                                <p className="font-semibold">
                                    {format(new Date(assignment.dueDate), 'd MMM yyyy HH:mm', { locale: th })}
                                </p>
                                {isOverdue && assignment.isPublished && (
                                    <Badge variant="destructive" className="mt-1">เลยกำหนด</Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">คะแนนเต็ม</p>
                                <p className="font-semibold">{assignment.maxScore} คะแนน</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ส่งงานแล้ว</p>
                                <p className="font-semibold">{submittedCount} คน</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                                <CheckCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ให้คะแนนแล้ว</p>
                                <p className="font-semibold">{gradedCount} / {submittedCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Instructions */}
            {assignment.instructions && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">คำสั่ง/รายละเอียด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: assignment.instructions }}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Submissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">การส่งงาน</CardTitle>
                    <CardDescription>
                        รายการนักเรียนที่ส่งงานและสถานะการให้คะแนน
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={submissionColumns}
                        data={assignment.submissions || []}
                        searchPlaceholder="ค้นหานักเรียน..."
                        emptyMessage="ยังไม่มีการส่งงาน"
                        actions={(submission) =>
                            submission.status === 'SUBMITTED' || submission.status === 'GRADED' ? (
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant={submission.status === 'GRADED' ? 'outline' : 'default'}
                                        onClick={() => handleGrade(submission)}
                                    >
                                        {submission.status === 'GRADED' ? 'ดูคะแนน' : 'ให้คะแนน'}
                                    </Button>
                                </div>
                            ) : null
                        }
                    />
                </CardContent>
            </Card>

            {/* Edit Form */}
            <AssignmentForm
                open={editOpen}
                onOpenChange={setEditOpen}
                assignment={assignment}
                onSuccess={refetch}
            />

            {/* Grade Form */}
            <GradeForm
                open={gradeOpen}
                onOpenChange={setGradeOpen}
                submission={selectedSubmission}
                assignment={assignment}
                onSuccess={refetch}
            />
        </div>
    );
}
