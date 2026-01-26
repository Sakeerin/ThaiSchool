// Subject Lessons List - Student view of lessons for a subject

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, Clock, CheckCircle, Play } from 'lucide-react';
import { useLessonsBySubjectInstance } from '@/hooks/use-lessons';
import { Lesson } from '@/lib/api/lessons';

export default function SubjectLessonsPage() {
    const params = useParams();
    const subjectInstanceId = params.id as string;

    const { data: lessons, isLoading } = useLessonsBySubjectInstance(subjectInstanceId);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-8 w-64" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />
                    ))}
                </div>
            </div>
        );
    }

    const firstLesson = lessons?.[0];
    const subjectName = firstLesson?.subjectInstance?.subject?.nameTh || 'วิชา';
    const semesterName = firstLesson?.subjectInstance?.semester?.name || '';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Link
                    href="/dashboard/student/subjects"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {subjectName}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {semesterName} • {lessons?.length || 0} บทเรียน
                    </p>
                </div>
            </div>

            {/* Lessons List */}
            {!lessons?.length ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">ยังไม่มีบทเรียน</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {lessons.map((lesson, index) => (
                        <LessonCard key={lesson.id} lesson={lesson} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
}

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
    // TODO: Add progress tracking
    const isCompleted = false;
    const isInProgress = false;

    return (
        <Link
            href={`/dashboard/student/lessons/${lesson.id}`}
            className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all"
        >
            <div className="flex items-center gap-4 p-4">
                {/* Order Number */}
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold text-lg
                    ${isCompleted
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                        : isInProgress
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }
                `}>
                    {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                    ) : (
                        index + 1
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {lesson.title}
                    </h3>
                    {lesson.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                            {lesson.description}
                        </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {lesson._count?.contents || 0} เนื้อหา
                        </span>
                    </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isCompleted
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }
                    `}>
                        {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                            <Play className="w-5 h-5 text-blue-600" />
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
