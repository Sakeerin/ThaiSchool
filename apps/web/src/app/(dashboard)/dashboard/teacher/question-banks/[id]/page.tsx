// Question Bank Detail Page - Manage questions in a bank

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
    ArrowLeft,
    Plus,
    Trash2,
    FileText,
    CheckCircle2,
    XCircle,
    Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useQuestions, useQuestionBanks } from '@/hooks/use-exams';
import { QuestionType, Difficulty, Question, QuestionOption } from '@/lib/api/exams';
import { QuestionForm } from './components/question-form';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const questionTypeLabels: Record<QuestionType, string> = {
    MULTIPLE_CHOICE: 'ปรนัย',
    TRUE_FALSE: 'ถูก/ผิด',
    FILL_BLANK: 'เติมคำ',
    SHORT_ANSWER: 'ตอบสั้น',
    ESSAY: 'เรียงความ',
    MATCHING: 'จับคู่',
};

const questionTypeColors: Record<QuestionType, string> = {
    MULTIPLE_CHOICE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    TRUE_FALSE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    FILL_BLANK: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    SHORT_ANSWER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    ESSAY: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    MATCHING: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
};

const difficultyLabels: Record<Difficulty, { label: string; color: string }> = {
    EASY: { label: 'ง่าย', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    MEDIUM: { label: 'ปานกลาง', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    HARD: { label: 'ยาก', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export default function QuestionBankDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bankId = params.id as string;

    const [formOpen, setFormOpen] = useState(false);

    const { data: questions, isLoading, refetch } = useQuestions(bankId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const renderQuestionContent = (question: Question) => {
        const options = question.options as QuestionOption[] | undefined;

        return (
            <div className="space-y-3">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {question.content}
                </p>

                {/* Multiple Choice Options */}
                {question.type === 'MULTIPLE_CHOICE' && options && (
                    <div className="space-y-2 ml-4">
                        {options.map((option, index) => (
                            <div
                                key={option.id}
                                className={`flex items-center gap-2 p-2 rounded-lg ${option.isCorrect
                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-800/50'
                                    }`}
                            >
                                {option.isCorrect ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                ) : (
                                    <span className="w-4 h-4 flex items-center justify-center text-xs text-gray-500">
                                        {String.fromCharCode(65 + index)}.
                                    </span>
                                )}
                                <span className="text-sm">{option.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* True/False */}
                {question.type === 'TRUE_FALSE' && options && (
                    <div className="flex gap-4 ml-4">
                        {options.map((option) => (
                            <div
                                key={option.id}
                                className={`flex items-center gap-2 p-2 px-4 rounded-lg ${option.isCorrect
                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-800/50'
                                    }`}
                            >
                                {option.isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                <span className="text-sm">{option.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Fill Blank / Short Answer */}
                {(question.type === 'FILL_BLANK' || question.type === 'SHORT_ANSWER') && (
                    <div className="ml-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">คำตอบ:</span>
                            <Badge variant="secondary">{question.correctAnswer}</Badge>
                        </div>
                        {question.acceptedAnswers && question.acceptedAnswers.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-500">ยอมรับคำตอบอื่น:</span>
                                {(question.acceptedAnswers as string[]).map((answer, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {answer}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">คำอธิบาย:</p>
                        <p className="text-sm text-blue-800 dark:text-blue-300">{question.explanation}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            คลังข้อสอบ
                        </h1>
                        <p className="text-sm text-gray-500">
                            {questions?.length || 0} คำถาม
                        </p>
                    </div>
                </div>
                <Button onClick={() => setFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มคำถาม
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(questionTypeLabels).map(([type, label]) => {
                    const count = questions?.filter((q) => q.type === type).length || 0;
                    return (
                        <Card key={type}>
                            <CardContent className="pt-4">
                                <div className="text-center">
                                    <span className={`text-xs px-2 py-1 rounded-full ${questionTypeColors[type as QuestionType]}`}>
                                        {label}
                                    </span>
                                    <p className="text-2xl font-bold mt-2">{count}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Questions List */}
            {questions && questions.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>รายการคำถาม</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="space-y-2">
                            {questions.map((question, index) => (
                                <AccordionItem
                                    key={question.id}
                                    value={question.id}
                                    className="border rounded-lg px-4"
                                >
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-3 text-left w-full pr-4">
                                            <span className="font-mono text-sm text-gray-500 w-6">
                                                {index + 1}.
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${questionTypeColors[question.type]}`}>
                                                    {questionTypeLabels[question.type]}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyLabels[question.difficulty].color}`}>
                                                    {difficultyLabels[question.difficulty].label}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {question.points} คะแนน
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-900 dark:text-white truncate flex-1 ml-2">
                                                {question.content.substring(0, 60)}
                                                {question.content.length > 60 ? '...' : ''}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 pb-4">
                                        {renderQuestionContent(question)}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">ยังไม่มีคำถามในคลังนี้</p>
                    <Button className="mt-4" onClick={() => setFormOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        สร้างคำถามแรก
                    </Button>
                </div>
            )}

            {/* Question Form */}
            <QuestionForm
                open={formOpen}
                onOpenChange={setFormOpen}
                questionBankId={bankId}
                onSuccess={refetch}
            />
        </div>
    );
}
