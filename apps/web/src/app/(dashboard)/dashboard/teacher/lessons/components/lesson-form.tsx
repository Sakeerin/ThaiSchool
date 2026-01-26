// Lesson Form Component - Create/Edit lesson dialog

'use client';

import { useEffect, useState } from 'react';
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
import { useCreateLesson, useUpdateLesson, useTeacherSubjects } from '@/hooks/use-lessons';
import { Lesson, CreateLessonDto, UpdateLessonDto } from '@/lib/api/lessons';
import { Loader2 } from 'lucide-react';

interface LessonFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lesson?: Lesson | null;
    onSuccess?: () => void;
}

export function LessonForm({ open, onOpenChange, lesson, onSuccess }: LessonFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectInstanceId, setSubjectInstanceId] = useState('');

    const { data: subjects, isLoading: loadingSubjects } = useTeacherSubjects();
    const createMutation = useCreateLesson();
    const updateMutation = useUpdateLesson();

    const isEditing = !!lesson;
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (open) {
            if (lesson) {
                setTitle(lesson.title);
                setDescription(lesson.description || '');
                setSubjectInstanceId(lesson.subjectInstanceId);
            } else {
                setTitle('');
                setDescription('');
                setSubjectInstanceId('');
            }
        }
    }, [open, lesson]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditing) {
                const dto: UpdateLessonDto = {
                    title,
                    description: description || undefined,
                };
                await updateMutation.mutateAsync({ id: lesson.id, dto });
            } else {
                const dto: CreateLessonDto = {
                    subjectInstanceId,
                    title,
                    description: description || undefined,
                };
                await createMutation.mutateAsync(dto);
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save lesson:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'แก้ไขบทเรียน' : 'สร้างบทเรียนใหม่'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'แก้ไขข้อมูลบทเรียน'
                                : 'กรอกข้อมูลเพื่อสร้างบทเรียนใหม่'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
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

                        <div className="grid gap-2">
                            <Label htmlFor="title">ชื่อบทเรียน *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="เช่น บทที่ 1: บทนำ"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">รายละเอียด</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="คำอธิบายสั้นๆ เกี่ยวกับบทเรียน"
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
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
                            disabled={isPending || (!isEditing && !subjectInstanceId) || !title}
                        >
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditing ? 'บันทึก' : 'สร้างบทเรียน'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
