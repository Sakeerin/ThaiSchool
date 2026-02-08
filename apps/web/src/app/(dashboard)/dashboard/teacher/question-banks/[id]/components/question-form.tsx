// Question Form Component - Create/Edit questions in a question bank

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateQuestion } from '@/hooks/use-exams';
import { QuestionType, Difficulty } from '@/lib/api/exams';

interface QuestionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionBankId: string;
    onSuccess?: () => void;
}

const questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'MULTIPLE_CHOICE', label: 'ปรนัย' },
    { value: 'TRUE_FALSE', label: 'ถูก/ผิด' },
    { value: 'FILL_BLANK', label: 'เติมคำ' },
    { value: 'SHORT_ANSWER', label: 'ตอบสั้น' },
    { value: 'ESSAY', label: 'เรียงความ' },
];

const difficultyLevels: { value: Difficulty; label: string }[] = [
    { value: 'EASY', label: 'ง่าย' },
    { value: 'MEDIUM', label: 'ปานกลาง' },
    { value: 'HARD', label: 'ยาก' },
];

export function QuestionForm({ open, onOpenChange, questionBankId, onSuccess }: QuestionFormProps) {
    const [content, setContent] = useState('');
    const [type, setType] = useState<QuestionType>('MULTIPLE_CHOICE');
    const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
    const [points, setPoints] = useState(1);
    const [explanation, setExplanation] = useState('');
    const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ]);
    const [correctAnswer, setCorrectAnswer] = useState('');

    const createMutation = useCreateQuestion();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createMutation.mutateAsync({
                questionBankId,
                type,
                content,
                difficulty,
                points,
                explanation: explanation || undefined,
                options: type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE'
                    ? options.map((opt, i) => ({
                        id: `temp-${i}`,
                        text: type === 'TRUE_FALSE' ? (i === 0 ? 'ถูก' : 'ผิด') : opt.text,
                        isCorrect: opt.isCorrect
                    }))
                    : undefined,
                correctAnswer: type === 'FILL_BLANK' || type === 'SHORT_ANSWER' ? correctAnswer : undefined,
            });

            // Reset form
            setContent('');
            setType('MULTIPLE_CHOICE');
             ('MEDIUM');
            setPoints(1);
            setExplanation('');
            setOptions([
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ]);
            setCorrectAnswer('');

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to create question:', error);
        }
    };

    const handleOptionChange = (index: number, text: string) => {
        const updated = [...options];
        updated[index] = { ...updated[index], text };
        setOptions(updated);
    };

    const handleCorrectChange = (index: number) => {
        const updated = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index,
        }));
        setOptions(updated);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>เพิ่มคำถามใหม่</DialogTitle>
                    <DialogDescription>สร้างคำถามใหม่ในคลังข้อสอบ</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>ประเภทคำถาม</Label>
                            <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {questionTypes.map((qt) => (
                                        <SelectItem key={qt.value} value={qt.value}>
                                            {qt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>ระดับความยาก</Label>
                            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {difficultyLevels.map((dl) => (
                                        <SelectItem key={dl.value} value={dl.value}>
                                            {dl.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>คะแนน</Label>
                            <Input
                                type="number"
                                min={1}
                                value={points}
                                onChange={(e) => setPoints(Number(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>คำถาม</Label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="พิมพ์คำถามที่นี่..."
                            className="mt-1 min-h-[100px]"
                            required
                        />
                    </div>

                    {/* Multiple Choice Options */}
                    {(type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE') && (
                        <div className="space-y-3">
                            <Label>ตัวเลือก</Label>
                            {options.slice(0, type === 'TRUE_FALSE' ? 2 : 4).map((opt, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={opt.isCorrect}
                                        onChange={() => handleCorrectChange(index)}
                                        className="w-4 h-4"
                                    />
                                    <Input
                                        value={type === 'TRUE_FALSE' ? (index === 0 ? 'ถูก' : 'ผิด') : opt.text}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`ตัวเลือก ${String.fromCharCode(65 + index)}`}
                                        disabled={type === 'TRUE_FALSE'}
                                        className="flex-1"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Fill Blank / Short Answer */}
                    {(type === 'FILL_BLANK' || type === 'SHORT_ANSWER') && (
                        <div>
                            <Label>คำตอบที่ถูกต้อง</Label>
                            <Input
                                value={correctAnswer}
                                onChange={(e) => setCorrectAnswer(e.target.value)}
                                placeholder="พิมพ์คำตอบที่ถูกต้อง..."
                                className="mt-1"
                            />
                        </div>
                    )}

                    <div>
                        <Label>คำอธิบายเฉลย (ไม่บังคับ)</Label>
                        <Textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="อธิบายเหตุผลของคำตอบ..."
                            className="mt-1"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
