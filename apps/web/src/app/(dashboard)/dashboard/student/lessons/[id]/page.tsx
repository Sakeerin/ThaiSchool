// Lesson Viewer Page - Student view of lesson content

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    FileText,
    Loader2,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentRenderer } from '@/components/ui/content-renderer';
import { useLesson, useLessonsBySubjectInstance } from '@/hooks/use-lessons';
import { LessonContent } from '@/lib/api/lessons';
import { cn } from '@/lib/utils';

export default function LessonViewerPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.id as string;

    const [activeContentIndex, setActiveContentIndex] = useState(0);

    const { data: lesson, isLoading } = useLesson(lessonId);
    const { data: allLessons } = useLessonsBySubjectInstance(lesson?.subjectInstanceId || '');

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
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    กลับ
                </Button>
            </div>
        );
    }

    const contents = lesson.contents?.sort((a, b) => a.order - b.order) || [];
    const activeContent = contents[activeContentIndex];

    // Find current lesson index in all lessons
    const currentLessonIndex = allLessons?.findIndex((l) => l.id === lessonId) ?? -1;
    const prevLesson = currentLessonIndex > 0 ? allLessons?.[currentLessonIndex - 1] : null;
    const nextLesson = currentLessonIndex < (allLessons?.length || 0) - 1 ? allLessons?.[currentLessonIndex + 1] : null;

    const goToPrevContent = () => {
        if (activeContentIndex > 0) {
            setActiveContentIndex(activeContentIndex - 1);
        }
    };

    const goToNextContent = () => {
        if (activeContentIndex < contents.length - 1) {
            setActiveContentIndex(activeContentIndex + 1);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Link
                        href={`/dashboard/student/subjects/${lesson.subjectInstanceId}/lessons`}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {lesson.subjectInstance?.subject?.nameTh}
                        </p>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {lesson.title}
                        </h1>
                        {lesson.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {lesson.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Content Sidebar */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 sticky top-20">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                เนื้อหา ({contents.length})
                            </h3>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {contents.map((content, index) => (
                                <button
                                    key={content.id}
                                    onClick={() => setActiveContentIndex(index)}
                                    className={cn(
                                        'w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-2',
                                        index === activeContentIndex
                                            ? 'border-l-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-l-transparent'
                                    )}
                                >
                                    <span className={cn(
                                        'w-6 h-6 rounded-full text-xs flex items-center justify-center flex-shrink-0',
                                        index === activeContentIndex
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                    )}>
                                        {index + 1}
                                    </span>
                                    <span className={cn(
                                        'text-sm truncate',
                                        index === activeContentIndex
                                            ? 'font-medium text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300'
                                    )}>
                                        {content.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                    {contents.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">บทเรียนนี้ยังไม่มีเนื้อหา</p>
                        </div>
                    ) : activeContent ? (
                        <div className="space-y-4">
                            {/* Content Header */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        {activeContent.title}
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        {activeContentIndex + 1} / {contents.length}
                                    </span>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <ContentRenderer content={activeContent} />
                            </div>

                            {/* Content Navigation */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    onClick={goToPrevContent}
                                    disabled={activeContentIndex === 0}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    ก่อนหน้า
                                </Button>
                                <Button
                                    onClick={goToNextContent}
                                    disabled={activeContentIndex === contents.length - 1}
                                >
                                    ถัดไป
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {/* Lesson Navigation */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            {prevLesson ? (
                                <Link
                                    href={`/dashboard/student/lessons/${prevLesson.id}`}
                                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="text-sm">บทก่อนหน้า: {prevLesson.title}</span>
                                </Link>
                            ) : (
                                <div />
                            )}
                            {nextLesson ? (
                                <Link
                                    href={`/dashboard/student/lessons/${nextLesson.id}`}
                                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <span className="text-sm">บทถัดไป: {nextLesson.title}</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <div />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
