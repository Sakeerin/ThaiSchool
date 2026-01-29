// Assignment Form Component - Create/Edit assignment dialog

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
import { useCreateAssignment, useUpdateAssignment, useTeacherSubjects } from '@/hooks/use-assignments';
import { Assignment, CreateAssignmentDto, UpdateAssignmentDto, AssignmentType } from '@/lib/api/assignments';
import { Loader2 } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface AssignmentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assignment?: Assignment | null;
    onSuccess?: () => void;
}

const assignmentTypes: { value: AssignmentType; label: string }[] = [
    { value: 'HOMEWORK', label: 'การบ้าน' },
    { value: 'PROJECT', label: 'โปรเจกต์' },
    { value: 'REPORT', label: 'รายงาน' },
    { value: 'PRESENTATION', label: 'นำเสนอ' },
    { value: 'EXERCISE', label: 'แบบฝึกหัด' },
    { value: 'OTHER', label: 'อื่นๆ' },
];

export function AssignmentForm({ open, onOpenChange, assignment, onSuccess }: AssignmentFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [subjectInstanceId, setSubjectInstanceId] = useState('');
    const [type, setType] = useState<AssignmentType>('HOMEWORK');
    const [maxScore, setMaxScore] = useState(100);
    const [dueDate, setDueDate] = useState('');
    const [allowLateSubmission, setAllowLateSubmission] = useState(true);
    const [latePenaltyPercent, setLatePenaltyPercent] = useState(10);

    const { data: subjects, isLoading: loadingSubjects } = useTeacherSubjects();
    const createMutation = useCreateAssignment();
    const updateMutation = useUpdateAssignment();

    const isEditing = !!assignment;
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (open) {
            if (assignment) {
                setTitle(assignment.title);
                setDescription(assignment.description || '');
                setInstructions(assignment.instructions || '');
                setSubjectInstanceId(assignment.subjectInstanceId);
                setType(assignment.type);
                setMaxScore(assignment.maxScore);
                setDueDate(format(new Date(assignment.dueDate), "yyyy-MM-dd'T'HH:mm"));
                setAllowLateSubmission(assignment.allowLateSubmission);
                setLatePenaltyPercent(assignment.latePenaltyPercent);
            } else {
                setTitle('');
                setDescription('');
                setInstructions('');
                setSubjectInstanceId('');
                setType('HOMEWORK');
                setMaxScore(100);
                // Default due date: 1 week from now at 23:59
                const defaultDue = new Date();
                defaultDue.setDate(defaultDue.getDate() + 7);
                defaultDue.setHours(23, 59, 0, 0);
                setDueDate(format(defaultDue, "yyyy-MM-dd'T'HH:mm"));
                setAllowLateSubmission(true);
                setLatePenaltyPercent(10);
            }
        }
    }, [open, assignment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditing) {
                const dto: UpdateAssignmentDto = {
                    title,
                    description: description || undefined,
                    instructions: instructions || undefined,
                    maxScore,
                    dueDate: new Date(dueDate).toISOString(),
                    allowLateSubmission,
                    latePenaltyPercent: allowLateSubmission ? latePenaltyPercent : 0,
                };
                await updateMutation.mutateAsync({ id: assignment.id, dto });
            } else {
                const dto: CreateAssignmentDto = {
                    subjectInstanceId,
                    title,
                    description: description || undefined,
                    instructions: instructions || undefined,
                    type,
                    maxScore,
                    dueDate: new Date(dueDate).toISOString(),
                    allowLateSubmission,
                    latePenaltyPercent: allowLateSubmission ? latePenaltyPercent : 0,
                };
                await createMutation.mutateAsync(dto);
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save assignment:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'แก้ไขงาน' : 'สร้างงานใหม่'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'แก้ไขรายละเอียดงาน'
                                : 'กรอกข้อมูลเพื่อสร้างงานใหม่'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Subject selector - only for new assignments */}
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
                            <Label htmlFor="title">ชื่องาน *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="เช่น การบ้านบทที่ 1"
                                required
                            />
                        </div>

                        {/* Assignment Type */}
                        {!isEditing && (
                            <div className="grid gap-2">
                                <Label htmlFor="type">ประเภทงาน *</Label>
                                <Select value={type} onValueChange={(v) => setType(v as AssignmentType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignmentTypes.map((t) => (
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
                                placeholder="คำอธิบายสั้นๆ เกี่ยวกับงาน"
                                rows={2}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        {/* Instructions */}
                        <div className="grid gap-2">
                            <Label htmlFor="instructions">คำสั่ง/รายละเอียด</Label>
                            <RichTextEditor
                                content={instructions}
                                onChange={setInstructions}
                                placeholder="คำแนะนำหรือข้อกำหนดของงาน..."
                            />
                        </div>

                        {/* Due Date and Max Score */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="dueDate">กำหนดส่ง *</Label>
                                <Input
                                    id="dueDate"
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                />
                            </div>
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
                        </div>

                        {/* Late Submission */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="allowLate">อนุญาตให้ส่งงานหลังกำหนด</Label>
                                <Switch
                                    id="allowLate"
                                    checked={allowLateSubmission}
                                    onCheckedChange={setAllowLateSubmission}
                                />
                            </div>
                            {allowLateSubmission && (
                                <div className="grid gap-2">
                                    <Label htmlFor="penalty">หักคะแนนเมื่อส่งช้า (%)</Label>
                                    <Input
                                        id="penalty"
                                        type="number"
                                        value={latePenaltyPercent}
                                        onChange={(e) => setLatePenaltyPercent(Number(e.target.value))}
                                        min={0}
                                        max={100}
                                    />
                                    <p className="text-xs text-gray-500">
                                        หักคะแนน {latePenaltyPercent}% ต่อวันที่ส่งช้า
                                    </p>
                                </div>
                            )}
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
                            disabled={isPending || (!isEditing && (!subjectInstanceId || !title)) || !dueDate}
                        >
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditing ? 'บันทึก' : 'สร้างงาน'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
