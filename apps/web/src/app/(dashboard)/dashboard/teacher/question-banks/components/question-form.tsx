// Question Form Component - Create question dialog

'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateQuestion } from '@/hooks/use-exams';
import { QuestionType, Difficulty, QuestionOption } from '@/lib/api/exams';
import { Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuestionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionBankId: string;
    onSuccess?: () => void;
}

const questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'MULTIPLE_CHOICE', label: 'ปรนัย (เลือกตอบ)' },
    { value: 'TRUE_FALSE', label: 'ถูก/ผิด' },
    { value: 'FILL_BLANK', label: 'เติมคำ' },
    { value: 'SHORT_ANSWER', label: 'ตอบสั้น' },
    { value: 'ESSAY', label: 'เรียงความ' },
];

const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'EASY', label: 'ง่าย' },
    { value: 'MEDIUM', label: 'ปานกลาง' },
    { value: 'HARD', label: 'ยาก' },
];

export function QuestionForm({ open, onOpenChange, questionBankId, onSuccess }: QuestionFormProps) {
    const [type, setType] = useState<QuestionType>('MULTIPLE_CHOICE');
    const [content, setContent] = useState('');
    const [explanation, setExplanation] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
    const [points, setPoints] = useState(1);

    // For multiple choice
    const [options, setOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>([
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false },
    ]);

    // For fill blank / short answer
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [acceptedAnswers, setAcceptedAnswers] = useState<string[]>([]);
    const [newAcceptedAnswer, setNewAcceptedAnswer] = useState('');

    const createMutation = useCreateQuestion();

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setType('MULTIPLE_CHOICE');
            setContent('');
            setExplanation('');
            setDifficulty('MEDIUM');
            setPoints(1);
            setOptions([
                { id: '1', text: '', isCorrect: true },
                { id: '2', text: '', isCorrect: false },
                { id: '3', text: '', isCorrect: false },
                { id: '4', text: '', isCorrect: false },
            ]);
            setCorrectAnswer('');
            setAcceptedAnswers([]);
            setNewAcceptedAnswer('');
        }
    }, [open]);

    const handleAddOption = () => {
        const newId = String(options.length + 1);
        setOptions([...options, { id: newId, text: '', isCorrect: false }]);
    };

    const handleRemoveOption = (id: string) => {
        if (options.length <= 2) return; // Minimum 2 options
        const newOptions = options.filter((o) => o.id !== id);
        // Ensure at least one option is correct
        if (!newOptions.some((o) => o.isCorrect) && newOptions.length > 0) {
            newOptions[0].isCorrect = true;
        }
        setOptions(newOptions);
    };

    const handleOptionTextChange = (id: string, text: string) => {
        setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
    };

    const handleSetCorrectOption = (id: string) => {
        setOptions(options.map((o) => ({ ...o, isCorrect: o.id === id })));
    };

    const handleAddAcceptedAnswer = () => {
        if (newAcceptedAnswer.trim() && !acceptedAnswers.includes(newAcceptedAnswer.trim())) {
            setAcceptedAnswers([...acceptedAnswers, newAcceptedAnswer.trim()]);
            setNewAcceptedAnswer('');
        }
    };

    const handleRemoveAcceptedAnswer = (answer: string) => {
        setAcceptedAnswers(acceptedAnswers.filter((a) => a !== answer));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const dto: any = {
                questionBankId,
                type,
                content,
                explanation: explanation || undefined,
                difficulty,
                points,
            };

            if (type === 'MULTIPLE_CHOICE') {
                dto.options = options.filter((o) => o.text.trim());
            } else if (type === 'TRUE_FALSE') {
                dto.options = [
                    { id: 'true', text: 'ถูก', isCorrect: correctAnswer === 'true' },
                    { id: 'false', text: 'ผิด', isCorrect: correctAnswer === 'false' },
                ];
            } else if (type === 'FILL_BLANK' || type === 'SHORT_ANSWER') {
                dto.correctAnswer = correctAnswer;
                dto.acceptedAnswers = acceptedAnswers.length > 0 ? acceptedAnswers : undefined;
            }

            await createMutation.mutateAsync(dto);

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to create question:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>สร้างคำถามใหม่</DialogTitle>
                        <DialogDescription>
                            กรอกข้อมูลเพื่อสร้างคำถามในคลังข้อสอบ
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Question Type & Difficulty */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>ประเภทคำถาม *</Label>
                                <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {questionTypes.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>ความยาก</Label>
                                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {difficulties.map((d) => (
                                            <SelectItem key={d.value} value={d.value}>
                                                {d.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>คะแนน</Label>
                                <Input
                                    type="number"
                                    value={points}
                                    onChange={(e) => setPoints(Number(e.target.value))}
                                    min={0.5}
                                    max={100}
                                    step={0.5}
                                />
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="grid gap-2">
                            <Label>คำถาม *</Label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="พิมพ์คำถาม..."
                                rows={3}
                                required
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        {/* Multiple Choice Options */}
                        {type === 'MULTIPLE_CHOICE' && (
                            <div className="grid gap-3">
                                <Label>ตัวเลือก (คลิกเพื่อเลือกคำตอบที่ถูก)</Label>
                                {options.map((option, index) => (
                                    <div key={option.id} className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant={option.isCorrect ? 'default' : 'outline'}
                                            size="icon"
                                            className="flex-shrink-0"
                                            onClick={() => handleSetCorrectOption(option.id)}
                                        >
                                            {option.isCorrect ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : (
                                                <span className="text-sm">{index + 1}</span>
                                            )}
                                        </Button>
                                        <Input
                                            value={option.text}
                                            onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                                            placeholder={`ตัวเลือกที่ ${index + 1}`}
                                            className="flex-1"
                                        />
                                        {options.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveOption(option.id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {options.length < 6 && (
                                    <Button type="button" variant="outline" onClick={handleAddOption}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        เพิ่มตัวเลือก
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* True/False */}
                        {type === 'TRUE_FALSE' && (
                            <div className="grid gap-2">
                                <Label>คำตอบที่ถูกต้อง *</Label>
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant={correctAnswer === 'true' ? 'default' : 'outline'}
                                        onClick={() => setCorrectAnswer('true')}
                                        className="flex-1"
                                    >
                                        ถูก
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={correctAnswer === 'false' ? 'default' : 'outline'}
                                        onClick={() => setCorrectAnswer('false')}
                                        className="flex-1"
                                    >
                                        ผิด
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Fill Blank / Short Answer */}
                        {(type === 'FILL_BLANK' || type === 'SHORT_ANSWER') && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>คำตอบที่ถูกต้อง *</Label>
                                    <Input
                                        value={correctAnswer}
                                        onChange={(e) => setCorrectAnswer(e.target.value)}
                                        placeholder="พิมพ์คำตอบที่ถูกต้อง"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>คำตอบอื่นที่ยอมรับ (ถ้ามี)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newAcceptedAnswer}
                                            onChange={(e) => setNewAcceptedAnswer(e.target.value)}
                                            placeholder="คำตอบทางเลือกอื่น"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAcceptedAnswer())}
                                        />
                                        <Button type="button" variant="outline" onClick={handleAddAcceptedAnswer}>
                                            เพิ่ม
                                        </Button>
                                    </div>
                                    {acceptedAnswers.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {acceptedAnswers.map((answer) => (
                                                <Badge key={answer} variant="secondary" className="flex items-center gap-1">
                                                    {answer}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAcceptedAnswer(answer)}
                                                        className="ml-1 hover:text-red-500"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Essay - no answer needed */}
                        {type === 'ESSAY' && (
                            <p className="text-sm text-gray-500">
                                ข้อสอบแบบเรียงความต้องให้ครูตรวจให้คะแนนเอง
                            </p>
                        )}

                        {/* Explanation */}
                        <div className="grid gap-2">
                            <Label>คำอธิบายเฉลย (แสดงหลังสอบ)</Label>
                            <textarea
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                placeholder="อธิบายว่าทำไมคำตอบนี้ถูก..."
                                rows={2}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={createMutation.isPending}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || !content}
                        >
                            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            สร้างคำถาม
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
