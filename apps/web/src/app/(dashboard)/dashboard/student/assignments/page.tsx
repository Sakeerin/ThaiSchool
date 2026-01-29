// Student Assignments Page - View pending and submitted assignments

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, isPast, differenceInDays, differenceInHours } from 'date-fns';
import { th } from 'date-fns/locale';
import { ClipboardList, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useStudentAssignments } from '@/hooks/use-assignments';
import { Assignment } from '@/lib/api/assignments';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning'; icon: typeof CheckCircle }> = {
    PENDING: { label: 'รอส่งงาน', variant: 'secondary', icon: Clock },
    SUBMITTED: { label: 'ส่งแล้ว', variant: 'default', icon: CheckCircle },
    GRADED: { label: 'ให้คะแนนแล้ว', variant: 'success', icon: CheckCircle },
    RETURNED: { label: 'ส่งคืน', variant: 'warning', icon: AlertCircle },
};

const assignmentTypeLabels: Record<string, string> = {
    HOMEWORK: 'การบ้าน',
    PROJECT: 'โปรเจกต์',
    REPORT: 'รายงาน',
    PRESENTATION: 'นำเสนอ',
    EXERCISE: 'แบบฝึกหัด',
    OTHER: 'อื่นๆ',
};

export default function StudentAssignmentsPage() {
    const [filter, setFilter] = useState<string>('all');
    const { data: assignments, isLoading } = useStudentAssignments();

    const getUrgencyInfo = (dueDate: string, status: string) => {
        if (status !== 'PENDING') return null;

        const date = new Date(dueDate);
        const now = new Date();

        if (isPast(date)) {
            return { text: 'เลยกำหนด', variant: 'destructive' as const };
        }

        const hoursUntil = differenceInHours(date, now);
        const daysUntil = differenceInDays(date, now);

        if (hoursUntil <= 24) {
            return { text: `เหลือ ${hoursUntil} ชั่วโมง`, variant: 'destructive' as const };
        } else if (daysUntil <= 3) {
            return { text: `เหลือ ${daysUntil} วัน`, variant: 'warning' as const };
        } else if (daysUntil <= 7) {
            return { text: `เหลือ ${daysUntil} วัน`, variant: 'secondary' as const };
        }
        return null;
    };

    // Filter assignments
    const filteredAssignments = assignments?.filter((assignment: Assignment) => {
        const status = assignment.mySubmission?.status || 'PENDING';
        if (filter === 'all') return true;
        if (filter === 'pending') return status === 'PENDING' || status === 'RETURNED';
        if (filter === 'submitted') return status === 'SUBMITTED';
        if (filter === 'graded') return status === 'GRADED';
        return true;
    }) || [];

    // Get unique subjects for filter
    const subjects = Array.from(
        new Set(assignments?.map(a => a.subjectInstance?.subject?.nameTh).filter(Boolean) || [])
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">งานที่ได้รับมอบหมาย</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        รายการงาน การบ้าน และโปรเจกต์ที่ต้องส่ง
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="กรองสถานะ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            <SelectItem value="pending">รอส่ง</SelectItem>
                            <SelectItem value="submitted">ส่งแล้ว</SelectItem>
                            <SelectItem value="graded">ให้คะแนนแล้ว</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {assignments?.filter((a: Assignment) => !a.mySubmission || a.mySubmission.status === 'PENDING').length || 0}
                            </p>
                            <p className="text-sm text-gray-500">รอส่ง</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">
                                {assignments?.filter((a: Assignment) => a.mySubmission?.status === 'SUBMITTED').length || 0}
                            </p>
                            <p className="text-sm text-gray-500">ส่งแล้ว</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">
                                {assignments?.filter((a: Assignment) => a.mySubmission?.status === 'GRADED').length || 0}
                            </p>
                            <p className="text-sm text-gray-500">ให้คะแนนแล้ว</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-orange-600">
                                {assignments?.filter((a: Assignment) => a.mySubmission?.status === 'RETURNED').length || 0}
                            </p>
                            <p className="text-sm text-gray-500">ส่งคืน</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Assignment List */}
            {filteredAssignments.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">ไม่มีงานในหมวดนี้</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredAssignments.map((assignment: Assignment) => {
                        const status = assignment.mySubmission?.status || 'PENDING';
                        const statusInfo = statusConfig[status] || statusConfig.PENDING;
                        const StatusIcon = statusInfo.icon;
                        const urgency = getUrgencyInfo(assignment.dueDate, status);
                        const isOverdue = status === 'PENDING' && isPast(new Date(assignment.dueDate));

                        return (
                            <Link
                                key={assignment.id}
                                href={`/dashboard/student/assignments/${assignment.id}`}
                            >
                                <Card className={`hover:border-primary/50 transition-colors cursor-pointer ${isOverdue ? 'border-red-300 dark:border-red-700' : ''}`}>
                                    <CardContent className="py-4">
                                        <div className="flex items-center gap-4">
                                            {/* Icon */}
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isOverdue
                                                    ? 'bg-red-100 dark:bg-red-900/30'
                                                    : 'bg-purple-100 dark:bg-purple-900/30'
                                                }`}>
                                                <ClipboardList className={`w-6 h-6 ${isOverdue
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-purple-600 dark:text-purple-400'
                                                    }`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                        {assignment.title}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs flex-shrink-0">
                                                        {assignmentTypeLabels[assignment.type]}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {assignment.subjectInstance?.subject?.nameTh}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-gray-500">
                                                        กำหนดส่ง: {format(new Date(assignment.dueDate), 'd MMM yyyy HH:mm', { locale: th })}
                                                    </span>
                                                    {urgency && (
                                                        <Badge variant={urgency.variant}>{urgency.text}</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status & Score */}
                                            <div className="text-right flex-shrink-0">
                                                <Badge variant={statusInfo.variant} className="mb-2">
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                                {status === 'GRADED' && (
                                                    <p className="text-lg font-semibold text-green-600">
                                                        {assignment.mySubmission?.score}/{assignment.maxScore}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Arrow */}
                                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
