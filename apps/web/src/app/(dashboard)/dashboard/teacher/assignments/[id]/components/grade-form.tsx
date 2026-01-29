// Grade Submission Form Component

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
import { Badge } from '@/components/ui/badge';
import { useGradeSubmission, useReturnSubmission } from '@/hooks/use-assignments';
import { Submission, Assignment } from '@/lib/api/assignments';
import { Loader2, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface GradeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    submission: Submission | null;
    assignment: Assignment;
    onSuccess?: () => void;
}

export function GradeForm({ open, onOpenChange, submission, assignment, onSuccess }: GradeFormProps) {
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('');

    const gradeMutation = useGradeSubmission();
    const returnMutation = useReturnSubmission();

    const isPending = gradeMutation.isPending || returnMutation.isPending;

    useEffect(() => {
        if (open && submission) {
            setScore(submission.score || 0);
            setFeedback(submission.feedback || '');
        }
    }, [open, submission]);

    const handleGrade = async () => {
        if (!submission) return;

        try {
            await gradeMutation.mutateAsync({
                submissionId: submission.id,
                dto: { score, feedback: feedback || undefined },
                assignmentId: assignment.id,
            });
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to grade submission:', error);
        }
    };

    const handleReturn = async () => {
        if (!submission) return;

        try {
            await returnMutation.mutateAsync({
                submissionId: submission.id,
                feedback: feedback || 'กรุณาแก้ไขและส่งใหม่',
                assignmentId: assignment.id,
            });
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to return submission:', error);
        }
    };

    if (!submission) return null;

    const files = submission.files || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>ให้คะแนน</DialogTitle>
                    <DialogDescription>
                        {submission.student?.titleTh} {submission.student?.firstNameTh} {submission.student?.lastNameTh}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Submission Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                            ส่งเมื่อ: {submission.submittedAt
                                ? format(new Date(submission.submittedAt), 'd MMM yyyy HH:mm', { locale: th })
                                : '-'}
                        </span>
                        {submission.isLate && (
                            <Badge variant="destructive">ส่งช้า</Badge>
                        )}
                    </div>

                    {/* Late Penalty Warning */}
                    {submission.isLate && assignment.latePenaltyPercent > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-800 dark:text-yellow-200">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm">
                                หักคะแนน {assignment.latePenaltyPercent}% เนื่องจากส่งงานช้า
                            </span>
                        </div>
                    )}

                    {/* Submitted Content */}
                    {submission.content && (
                        <div className="space-y-2">
                            <Label>เนื้อหาที่ส่ง</Label>
                            <div
                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg prose dark:prose-invert max-w-none text-sm"
                                dangerouslySetInnerHTML={{ __html: submission.content }}
                            />
                        </div>
                    )}

                    {/* Submitted Files */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            <Label>ไฟล์ที่ส่ง</Label>
                            <div className="space-y-2">
                                {files.map((file, index) => (
                                    <a
                                        key={index}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        <span className="flex-1 text-sm truncate">{file.name}</span>
                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Score Input */}
                    <div className="space-y-2">
                        <Label htmlFor="score">คะแนน *</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="score"
                                type="number"
                                value={score}
                                onChange={(e) => setScore(Number(e.target.value))}
                                min={0}
                                max={assignment.maxScore}
                                className="w-24"
                            />
                            <span className="text-gray-500">/ {assignment.maxScore}</span>
                        </div>
                        {submission.isLate && assignment.latePenaltyPercent > 0 && (
                            <p className="text-xs text-gray-500">
                                คะแนนสุทธิหลังหักค่าปรับ: {Math.max(0, score - (score * assignment.latePenaltyPercent / 100)).toFixed(1)}
                            </p>
                        )}
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                        <Label htmlFor="feedback">ความคิดเห็น</Label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="ความคิดเห็นหรือคำแนะนำ..."
                            rows={3}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleReturn}
                        disabled={isPending}
                    >
                        {returnMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        ส่งคืนแก้ไข
                    </Button>
                    <Button
                        type="button"
                        onClick={handleGrade}
                        disabled={isPending || score < 0 || score > assignment.maxScore}
                    >
                        {gradeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        บันทึกคะแนน
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
