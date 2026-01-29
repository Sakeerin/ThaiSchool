// Question Banks List Page

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Plus, FileText, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useQuestionBanks, useCreateQuestionBank } from '@/hooks/use-exams';
import { useTeacherSubjects } from '@/hooks/use-assignments';
import { QuestionBank } from '@/lib/api/exams';
import { QuestionBankForm } from './components/question-bank-form';

export default function QuestionBanksPage() {
    const [formOpen, setFormOpen] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

    const { data: subjects, isLoading: loadingSubjects } = useTeacherSubjects();
    const { data: questionBanks, isLoading: loadingBanks, refetch } = useQuestionBanks(selectedSubjectId);

    // Get unique subjects from teaching assignments
    const uniqueSubjects = subjects?.reduce((acc, subjectInstance) => {
        const subjectId = subjectInstance.subject.id;
        if (!acc.find((s) => s.id === subjectId)) {
            acc.push({
                id: subjectId,
                code: subjectInstance.subject.code,
                nameTh: subjectInstance.subject.nameTh,
            });
        }
        return acc;
    }, [] as { id: string; code: string; nameTh: string }[]) || [];

    // Set first subject as default when loaded
    if (subjects && subjects.length > 0 && !selectedSubjectId) {
        const firstSubjectId = subjects[0].subject.id;
        setSelectedSubjectId(firstSubjectId);
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">คลังข้อสอบ</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        จัดการคลังข้อสอบและคำถามสำหรับวิชาที่สอน
                    </p>
                </div>
                <Button onClick={() => setFormOpen(true)} disabled={!selectedSubjectId}>
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างคลังข้อสอบ
                </Button>
            </div>

            {/* Subject Selector */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">เลือกวิชา:</span>
                <Select
                    value={selectedSubjectId}
                    onValueChange={setSelectedSubjectId}
                    disabled={loadingSubjects}
                >
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="เลือกวิชา" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                                {subject.nameTh} ({subject.code})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Question Banks Grid */}
            {loadingBanks ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : questionBanks && questionBanks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {questionBanks.map((bank) => (
                        <Link key={bank.id} href={`/dashboard/teacher/question-banks/${bank.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{bank.name}</CardTitle>
                                                <CardDescription className="mt-0.5">
                                                    {bank._count?.questions || 0} ข้อ
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {bank.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {bank.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        สร้างเมื่อ {format(new Date(bank.createdAt), 'd MMM yyyy', { locale: th })}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : selectedSubjectId ? (
                <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">ยังไม่มีคลังข้อสอบสำหรับวิชานี้</p>
                    <Button className="mt-4" onClick={() => setFormOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        สร้างคลังข้อสอบแรก
                    </Button>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">กรุณาเลือกวิชา</p>
                </div>
            )}

            {/* Create Question Bank Form */}
            <QuestionBankForm
                open={formOpen}
                onOpenChange={setFormOpen}
                subjectId={selectedSubjectId}
                onSuccess={refetch}
            />
        </div>
    );
}
