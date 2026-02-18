// Subject Form Component

'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCreateSubject, useUpdateSubject, useSubjectAreas } from '@/hooks/use-subjects-admin';
import { Subject } from '@/lib/api/subjects';

interface SubjectFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject?: Subject;
}

export function SubjectForm({ open, onOpenChange, subject }: SubjectFormProps) {
    const isEdit = !!subject;
    const [formData, setFormData] = useState({
        code: '',
        nameTh: '',
        nameEn: '',
        description: '',
        subjectAreaId: '',
        credits: 1,
        hoursPerWeek: 1,
    });

    const createMutation = useCreateSubject();
    const updateMutation = useUpdateSubject();
    const { data: subjectAreas } = useSubjectAreas();

    useEffect(() => {
        if (subject) {
            setFormData({
                code: subject.code,
                nameTh: subject.nameTh,
                nameEn: subject.nameEn || '',
                description: subject.description || '',
                subjectAreaId: subject.subjectAreaId,
                credits: subject.credits,
                hoursPerWeek: subject.hoursPerWeek,
            });
        } else {
            setFormData({
                code: '',
                nameTh: '',
                nameEn: '',
                description: '',
                subjectAreaId: '',
                credits: 1,
                hoursPerWeek: 1,
            });
        }
    }, [subject]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dto = {
            ...formData,
            nameEn: formData.nameEn || undefined,
            description: formData.description || undefined,
        };

        if (isEdit) {
            updateMutation.mutate(
                { id: subject.id, dto },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            createMutation.mutate(dto, {
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชา'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            รหัสวิชา *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="เช่น ท11101"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            ชื่อวิชา (ไทย) *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="เช่น ภาษาไทย"
                            value={formData.nameTh}
                            onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            ชื่อวิชา (English)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Thai Language"
                            value={formData.nameEn}
                            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            กลุ่มสาระ *
                        </label>
                        <select
                            required
                            value={formData.subjectAreaId}
                            onChange={(e) => setFormData({ ...formData, subjectAreaId: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                        >
                            <option value="">เลือกกลุ่มสาระ</option>
                            {subjectAreas?.map((area: any) => (
                                <option key={area.id} value={area.id}>{area.nameTh}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">หน่วยกิต</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={formData.credits}
                                onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) })}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชม./สัปดาห์</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.hoursPerWeek}
                                onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">คำอธิบาย</label>
                        <textarea
                            rows={3}
                            placeholder="คำอธิบายรายวิชา"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                        >
                            {isPending ? 'กำลังบันทึก...' : isEdit ? 'บันทึก' : 'เพิ่ม'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
