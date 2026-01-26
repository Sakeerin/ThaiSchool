// Student Subjects Page - List enrolled subjects with lessons

'use client';

import Link from 'next/link';
import { BookOpen, FileText, ChevronRight, GraduationCap } from 'lucide-react';
import { useStudentLessons } from '@/hooks/use-lessons';
import { Lesson } from '@/lib/api/lessons';

export default function StudentSubjectsPage() {
    const { data: lessons, isLoading } = useStudentLessons();

    // Group lessons by subject instance
    const subjectGroups = lessons?.reduce((acc, lesson) => {
        const subjectId = lesson.subjectInstanceId;
        if (!acc[subjectId]) {
            acc[subjectId] = {
                subjectInstance: lesson.subjectInstance,
                lessons: [],
            };
        }
        acc[subjectId].lessons.push(lesson);
        return acc;
    }, {} as Record<string, { subjectInstance: Lesson['subjectInstance']; lessons: Lesson[] }>) || {};

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">วิชาเรียน</h1>
                    <p className="text-sm text-gray-500">กำลังโหลด...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-48" />
                    ))}
                </div>
            </div>
        );
    }

    const subjects = Object.values(subjectGroups);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">วิชาเรียน</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    รายวิชาที่ลงทะเบียนเรียนและบทเรียนทั้งหมด
                </p>
            </div>

            {subjects.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                    <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">ยังไม่มีวิชาที่ลงทะเบียน</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map(({ subjectInstance, lessons }) => {
                        const subject = subjectInstance?.subject;
                        const color = subject?.subjectArea?.color || '#3B82F6';

                        return (
                            <Link
                                key={subjectInstance?.id}
                                href={`/dashboard/student/subjects/${subjectInstance?.id}/lessons`}
                                className="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1"
                            >
                                {/* Color Banner */}
                                <div
                                    className="h-2"
                                    style={{ backgroundColor: color }}
                                />

                                <div className="p-6">
                                    {/* Subject Info */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: `${color}20` }}
                                        >
                                            <BookOpen
                                                className="w-6 h-6"
                                                style={{ color }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {subject?.nameTh}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {subject?.code}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Semester Info */}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {subjectInstance?.semester?.academicYear?.name} • {subjectInstance?.semester?.name}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <FileText className="w-4 h-4" />
                                            <span className="text-sm">{lessons.length} บทเรียน</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
