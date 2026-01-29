// Student Assignment Detail & Submission Page

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, isPast } from 'date-fns';
import { th } from 'date-fns/locale';
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    CheckCircle,
    AlertTriangle,
    Upload,
    X,
    Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useAssignment, useSubmitAssignment } from '@/hooks/use-assignments';
import { uploadApi } from '@/lib/api/upload';

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

export default function StudentAssignmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const assignmentId = params.id as string;

    const [content, setContent] = useState('');
    const [files, setFiles] = useState<{ url: string; name: string; size: number }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { data: assignment, isLoading, refetch } = useAssignment(assignmentId);
    const submitMutation = useSubmitAssignment();

    const mySubmission = assignment?.submissions?.[0];
    const status = mySubmission?.status || 'PENDING';
    const statusInfo = statusLabels[status];
    const isOverdue = isPast(new Date(assignment?.dueDate || ''));
    const canSubmit = status === 'PENDING' || status === 'RETURNED';

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles?.length) return;

        setUploading(true);
        try {
            for (const file of Array.from(selectedFiles)) {
                const uploaded = await uploadApi.uploadFile(file, 'assignments');
                setFiles(prev => [...prev, {
                    url: uploaded.url,
                    name: file.name,
                    size: file.size,
                }]);
            }
        } catch (error) {
            console.error('Failed to upload file:', error);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            await submitMutation.mutateAsync({
                assignmentId,
                dto: {
                    content: content || undefined,
                    files: files.length > 0 ? files : undefined,
                },
            });
            setConfirmOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to submit:', error);
        }
    };

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
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        {assignment.subjectInstance?.subject?.nameTh} • {assignmentTypeLabels[assignment.type]}
                    </p>
                </div>
            </div>

            {/* Overdue Warning */}
            {isOverdue && canSubmit && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                        <p className="font-medium">เลยกำหนดส่งแล้ว</p>
                        {assignment.allowLateSubmission ? (
                            <p className="text-sm">
                                คุณยังสามารถส่งงานได้ แต่จะถูกหักคะแนน {assignment.latePenaltyPercent}% ต่อวันที่ช้า
                            </p>
                        ) : (
                            <p className="text-sm">งานนี้ไม่อนุญาตให้ส่งหลังกำหนด</p>
                        )}
                    </div>
                </div>
            )}

            {/* Assignment Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Instructions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">คำสั่ง/รายละเอียด</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignment.instructions ? (
                                <div
                                    className="prose dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: assignment.instructions }}
                                />
                            ) : (
                                <p className="text-gray-500">{assignment.description || 'ไม่มีคำอธิบาย'}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submission Form (if can submit) */}
                    {canSubmit && (assignment.allowLateSubmission || !isOverdue) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">ส่งงาน</CardTitle>
                                <CardDescription>
                                    กรอกเนื้อหาหรือแนบไฟล์เพื่อส่งงาน
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Rich Text Editor */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">เนื้อหา</label>
                                    <RichTextEditor
                                        content={content}
                                        onChange={setContent}
                                        placeholder="พิมพ์คำตอบหรือเนื้อหาที่ต้องการส่ง..."
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ไฟล์แนบ</label>
                                    <div className="flex items-center gap-2">
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                            <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                {uploading ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                ) : (
                                                    <Upload className="w-4 h-4" />
                                                )}
                                                <span className="text-sm">เลือกไฟล์</span>
                                            </div>
                                        </label>
                                    </div>

                                    {/* File List */}
                                    {files.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            {files.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                                                >
                                                    <Paperclip className="w-4 h-4 text-gray-400" />
                                                    <span className="flex-1 text-sm truncate">{file.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => removeFile(index)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={() => setConfirmOpen(true)}
                                        disabled={(!content && files.length === 0) || submitMutation.isPending}
                                    >
                                        ส่งงาน
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submitted Content (if submitted) */}
                    {mySubmission && status !== 'PENDING' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">งานที่ส่ง</CardTitle>
                                <CardDescription>
                                    ส่งเมื่อ {mySubmission.submittedAt
                                        ? format(new Date(mySubmission.submittedAt), 'd MMM yyyy HH:mm', { locale: th })
                                        : '-'}
                                    {mySubmission.isLate && (
                                        <Badge variant="destructive" className="ml-2">ส่งช้า</Badge>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Content */}
                                {mySubmission.content && (
                                    <div
                                        className="prose dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: mySubmission.content }}
                                    />
                                )}

                                {/* Files */}
                                {mySubmission.files && mySubmission.files.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">ไฟล์แนบ</p>
                                        {mySubmission.files.map((file: { url: string; name: string }, index: number) => (
                                            <a
                                                key={index}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="flex-1 text-sm truncate">{file.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Grade & Feedback (if graded) */}
                    {status === 'GRADED' && mySubmission && (
                        <Card className="border-green-200 dark:border-green-800">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    ผลคะแนน
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center py-4">
                                    <p className="text-5xl font-bold text-green-600">
                                        {mySubmission.score}
                                    </p>
                                    <p className="text-gray-500">จาก {assignment.maxScore} คะแนน</p>
                                </div>
                                {mySubmission.feedback && (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <p className="text-sm font-medium mb-2">ความคิดเห็นจากครู</p>
                                        <p className="text-gray-700 dark:text-gray-300">{mySubmission.feedback}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Returned Feedback */}
                    {status === 'RETURNED' && mySubmission?.feedback && (
                        <Card className="border-orange-200 dark:border-orange-800">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                                    <AlertTriangle className="w-5 h-5" />
                                    ข้อเสนอแนะจากครู
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300">{mySubmission.feedback}</p>
                                <p className="text-sm text-gray-500 mt-2">กรุณาแก้ไขและส่งใหม่</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">กำหนดส่ง</p>
                                    <p className="font-medium">
                                        {format(new Date(assignment.dueDate), 'd MMM yyyy HH:mm', { locale: th })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">คะแนนเต็ม</p>
                                    <p className="font-medium">{assignment.maxScore} คะแนน</p>
                                </div>
                            </div>

                            {assignment.allowLateSubmission && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">ส่งช้า</p>
                                        <p className="font-medium">หัก {assignment.latePenaltyPercent}%/วัน</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Teacher Info */}
                    {assignment.createdBy && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-gray-500">ผู้มอบหมาย</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">
                                    {assignment.createdBy.titleTh} {assignment.createdBy.firstNameTh} {assignment.createdBy.lastNameTh}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Submit Confirmation */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="ยืนยันการส่งงาน"
                description={isOverdue
                    ? `งานนี้เลยกำหนดส่งแล้ว คุณจะถูกหักคะแนน ${assignment.latePenaltyPercent}%/วัน ต้องการส่งหรือไม่?`
                    : 'คุณต้องการส่งงานนี้หรือไม่?'
                }
                confirmText="ส่งงาน"
                onConfirm={handleSubmit}
                loading={submitMutation.isPending}
            />
        </div>
    );
}
