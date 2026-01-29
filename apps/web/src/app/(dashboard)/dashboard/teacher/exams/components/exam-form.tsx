// Exam Form Component - Create/Edit exam dialog

'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
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
import { useCreateExam, useUpdateExam } from '@/hooks/use-exams';
import { useTeacherSubjects } from '@/hooks/use-assignments';
import { Exam, CreateExamDto, UpdateExamDto, ExamType } from '@/lib/api/exams';
import { Loader2 } from 'lucide-react';

interface ExamFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exam?: Exam | null;
    onSuccess?: () => void;
}

const examTypes: { value: ExamType; label: string }[] = [
    { value: 'QUIZ', label: 'แบบทดสอบ' },
    { value: 'MIDTERM', label: 'สอบกลางภาค' },
    { value: 'FINAL', label: 'สอบปลายภาค' },
    { value: 'PRACTICE', label: 'ฝึกปฏิบัติ' },
];

export function ExamForm({ open, onOpenChange, exam, onSuccess }: ExamFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [subjectInstanceId, setSubjectInstanceId] = useState('');
    const [type, setType] = useState<ExamType>('QUIZ');
    const [maxScore, setMaxScore] = useState(100);
    const [passingScore, setPassingScore] = useState(50);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [duration, setDuration] = useState(60);
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [shuffleOptions, setShuffleOptions] = useState(false);
    const [maxAttempts, setMaxAttempts] = useState(1);

    const { data: subjects, isLoading: loadingSubjects } = useTeacherSubjects();
    const createMutation = useCreateExam();
    const updateMutation = useUpdateExam();

    const isEditing = !!exam;
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (open) {
            if (exam) {
                setTitle(exam.title);
                setDescription(exam.description || '');
                setInstructions(exam.instructions || '');
                setSubjectInstanceId(exam.subjectInstanceId);
                setType(exam.type);
                setMaxScore(exam.maxScore);
                setPassingScore(exam.passingScore || 50);
                setStartTime(format(new Date(exam.startTime), "yyyy-MM-dd'T'HH:mm"));
                setEndTime(format(new Date(exam.endTime), "yyyy-MM-dd'T'HH:mm"));
                setDuration(exam.duration);
                setShuffleQuestions(exam.shuffleQuestions);
                setShuffleOptions(exam.shuffleOptions);
                setMaxAttempts(exam.maxAttempts);
            } else {
                setTitle('');
                setDescription('');
                setInstructions('');
                setSubjectInstanceId('');
                setType('QUIZ');
                setMaxScore(100);
                setPassingScore(50);
                // Default start time: tomorrow at 09:00
                const defaultStart = new Date();
                defaultStart.setDate(defaultStart.getDate() + 1);
                defaultStart.setHours(9, 0, 0, 0);
                setStartTime(format(defaultStart, "yyyy-MM-dd'T'HH:mm"));
                // Default end time: same day at 17:00
                const defaultEnd = new Date(defaultStart);
                defaultEnd.setHours(17, 0, 0, 0);
                setEndTime(format(defaultEnd, "yyyy-MM-dd'T'HH:mm"));
                setDuration(60);
                setShuffleQuestions(false);
                setShuffleOptions(false);
                setMaxAttempts(1);
            }
        }
    }, [open, exam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditing) {
                const dto: UpdateExamDto = {
                    title,
                    description: description || undefined,
                    instructions: instructions || undefined,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date(endTime).toISOString(),
                    duration,
                };
                await updateMutation.mutateAsync({ id: exam.id, dto });
            } else {
                const dto: CreateExamDto = {
                    subjectInstanceId,
                    title,
                    description: description || undefined,
                    instructions: instructions || undefined,
                    type,
                    maxScore,
                    passingScore: passingScore || undefined,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date(endTime).toISOString(),
                    duration,
                    shuffleQuestions,
                    shuffleOptions,
                    maxAttempts,
                };
                await createMutation.mutateAsync(dto);
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save exam:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'แก้ไขข้อสอบ' : 'สร้างข้อสอบใหม่'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'แก้ไขรายละเอียดข้อสอบ'
                                : 'กรอกข้อมูลเพื่อสร้างข้อสอบใหม่'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Subject selector - only for new exams */}
                        {!isEditing && (
                            <div className="grid gap-2">
                                <Label htmlFor="subject">วิชา *</Label>
                                <Select
                                    value={subjectInstanceId}
                                    onValueChange={setSubjectInstanceId}
                                    disabled={loadingSubjects}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกวิชา" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects?.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id}>
                                                {subject.subject.nameTh} ({subject.semester.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">ชื่อข้อสอบ *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="เช่น แบบทดสอบบทที่ 1"
                                required
                            />
                        </div>

                        {/* Exam Type */}
                        {!isEditing && (
                            <div className="grid gap-2">
                                <Label htmlFor="type">ประเภทข้อสอบ *</Label>
                                <Select value={type} onValueChange={(v) => setType(v as ExamType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {examTypes.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">คำอธิบาย</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="คำอธิบายสั้นๆ เกี่ยวกับข้อสอบ"
                                rows={2}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        {/* Instructions */}
                        <div className="grid gap-2">
                            <Label htmlFor="instructions">คำสั่ง/คำแนะนำในการสอบ</Label>
                            <textarea
                                id="instructions"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="คำแนะนำหรือข้อกำหนดในการทำข้อสอบ..."
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        {/* Schedule */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="startTime">เริ่มสอบ *</Label>
                                <Input
                                    id="startTime"
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="endTime">สิ้นสุดการสอบ *</Label>
                                <Input
                                    id="endTime"
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Duration and Scores */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">เวลาในการสอบ (นาที) *</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    min={1}
                                    max={480}
                                    required
                                />
                            </div>
                            {!isEditing && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="maxScore">คะแนนเต็ม *</Label>
                                        <Input
                                            id="maxScore"
                                            type="number"
                                            value={maxScore}
                                            onChange={(e) => setMaxScore(Number(e.target.value))}
                                            min={1}
                                            max={1000}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="passingScore">คะแนนผ่าน</Label>
                                        <Input
                                            id="passingScore"
                                            type="number"
                                            value={passingScore}
                                            onChange={(e) => setPassingScore(Number(e.target.value))}
                                            min={0}
                                            max={maxScore}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Settings - only for new exams */}
                        {!isEditing && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="maxAttempts">จำนวนครั้งที่สอบได้</Label>
                                    <Input
                                        id="maxAttempts"
                                        type="number"
                                        value={maxAttempts}
                                        onChange={(e) => setMaxAttempts(Number(e.target.value))}
                                        min={1}
                                        max={10}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="shuffleQuestions">สลับลำดับข้อสอบ</Label>
                                        <Switch
                                            id="shuffleQuestions"
                                            checked={shuffleQuestions}
                                            onCheckedChange={setShuffleQuestions}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="shuffleOptions">สลับตัวเลือก (สำหรับข้อสอบปรนัย)</Label>
                                        <Switch
                                            id="shuffleOptions"
                                            checked={shuffleOptions}
                                            onCheckedChange={setShuffleOptions}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || (!isEditing && (!subjectInstanceId || !title)) || !startTime || !endTime}
                        >
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditing ? 'บันทึก' : 'สร้างข้อสอบ'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
