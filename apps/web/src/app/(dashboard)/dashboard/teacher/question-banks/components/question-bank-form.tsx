// Question Bank Form Component

'use client';

import { useState } from 'react';
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
import { useCreateQuestionBank } from '@/hooks/use-exams';
import { Loader2 } from 'lucide-react';

interface QuestionBankFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subjectId: string;
    onSuccess?: () => void;
}

export function QuestionBankForm({ open, onOpenChange, subjectId, onSuccess }: QuestionBankFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const createMutation = useCreateQuestionBank();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createMutation.mutateAsync({
                subjectId,
                name,
                description: description || undefined,
            });

            onOpenChange(false);
            setName('');
            setDescription('');
            onSuccess?.();
        } catch (error) {
            console.error('Failed to create question bank:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>สร้างคลังข้อสอบใหม่</DialogTitle>
                        <DialogDescription>
                            กรอกข้อมูลเพื่อสร้างคลังข้อสอบ
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">ชื่อคลังข้อสอบ *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="เช่น บทที่ 1 - พีชคณิต"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">คำอธิบาย</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="คำอธิบายเกี่ยวกับคลังข้อสอบนี้..."
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
                            disabled={createMutation.isPending}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || !name}
                        >
                            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            สร้างคลังข้อสอบ
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
