// Lesson Editor Page - Edit lesson and manage contents

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    Eye,
    EyeOff,
    Loader2,
    BookOpen,
    Type,
    Video,
    FileText,
    Music,
    ExternalLink,
    MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useLesson, usePublishLesson, useUnpublishLesson, useDeleteContent, useReorderContents } from '@/hooks/use-lessons';
import { ContentForm } from './components/content-form';
import { LessonContent, ContentType } from '@/lib/api/lessons';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const contentTypeIcons: Record<ContentType, React.ComponentType<{ className?: string }>> = {
    TEXT: Type,
    VIDEO: Video,
    PDF: FileText,
    AUDIO: Music,
    LINK: ExternalLink,
    SLIDE: FileText,
    QUIZ: FileText,
};

const contentTypeLabels: Record<ContentType, string> = {
    TEXT: 'ข้อความ',
    VIDEO: 'วิดีโอ',
    PDF: 'PDF',
    AUDIO: 'เสียง',
    LINK: 'ลิงก์',
    SLIDE: 'สไลด์',
    QUIZ: 'แบบทดสอบ',
};

export default function LessonEditorPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.id as string;

    const [contentFormOpen, setContentFormOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState<LessonContent | null>(null);
    const [deleteContentOpen, setDeleteContentOpen] = useState(false);

    const { data: lesson, isLoading, refetch } = useLesson(lessonId);
    const publishMutation = usePublishLesson();
    const unpublishMutation = useUnpublishLesson();
    const deleteContentMutation = useDeleteContent();
    const reorderMutation = useReorderContents();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">ไม่พบบทเรียน</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/teacher/lessons')}>
                    กลับไปหน้ารายการ
                </Button>
            </div>
        );
    }

    const handleAddContent = () => {
        setSelectedContent(null);
        setContentFormOpen(true);
    };

    const handleEditContent = (content: LessonContent) => {
        setSelectedContent(content);
        setContentFormOpen(true);
    };

    const handleDeleteContent = (content: LessonContent) => {
        setSelectedContent(content);
        setDeleteContentOpen(true);
    };

    const confirmDeleteContent = async () => {
        if (selectedContent) {
            await deleteContentMutation.mutateAsync({
                contentId: selectedContent.id,
                lessonId: lesson.id,
            });
            setDeleteContentOpen(false);
            setSelectedContent(null);
        }
    };

    const handlePublish = async () => {
        await publishMutation.mutateAsync(lesson.id);
        refetch();
    };

    const handleUnpublish = async () => {
        await unpublishMutation.mutateAsync(lesson.id);
        refetch();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <Link
                        href="/dashboard/teacher/lessons"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {lesson.title}
                            </h1>
                            <Badge variant={lesson.isPublished ? 'success' : 'secondary'}>
                                {lesson.isPublished ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                            {lesson.subjectInstance?.subject?.nameTh} • {lesson.subjectInstance?.semester?.name}
                        </p>
                        {lesson.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{lesson.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {lesson.isPublished ? (
                        <Button
                            variant="outline"
                            onClick={handleUnpublish}
                            disabled={unpublishMutation.isPending}
                        >
                            {unpublishMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <EyeOff className="w-4 h-4 mr-2" />
                            )}
                            ยกเลิกเผยแพร่
                        </Button>
                    ) : (
                        <Button
                            onClick={handlePublish}
                            disabled={publishMutation.isPending || !lesson.contents?.length}
                        >
                            {publishMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Eye className="w-4 h-4 mr-2" />
                            )}
                            เผยแพร่
                        </Button>
                    )}
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                        เนื้อหา ({lesson.contents?.length || 0} รายการ)
                    </h2>
                    <Button onClick={handleAddContent}>
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มเนื้อหา
                    </Button>
                </div>

                {lesson.contents?.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 mb-4">ยังไม่มีเนื้อหา</p>
                        <Button onClick={handleAddContent}>
                            <Plus className="w-4 h-4 mr-2" />
                            เพิ่มเนื้อหาแรก
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {lesson.contents
                            ?.sort((a, b) => a.order - b.order)
                            .map((content, index) => {
                                const Icon = contentTypeIcons[content.type] || FileText;

                                return (
                                    <div
                                        key={content.id}
                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="cursor-grab text-gray-400 hover:text-gray-600">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {content.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {contentTypeLabels[content.type]}
                                            </p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditContent(content)}>
                                                    <Pencil className="w-4 h-4 mr-2" />
                                                    แก้ไข
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteContent(content)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    ลบ
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Content Form Modal */}
            <ContentForm
                open={contentFormOpen}
                onOpenChange={setContentFormOpen}
                lessonId={lesson.id}
                content={selectedContent}
                onSuccess={refetch}
            />

            {/* Delete Content Confirmation */}
            <ConfirmDialog
                open={deleteContentOpen}
                onOpenChange={setDeleteContentOpen}
                title="ยืนยันการลบ"
                description={`คุณต้องการลบเนื้อหา "${selectedContent?.title}" หรือไม่?`}
                confirmText="ลบ"
                onConfirm={confirmDeleteContent}
                loading={deleteContentMutation.isPending}
            />
        </div>
    );
}
