// Classroom Form Component

'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCreateClassroom, useUpdateClassroom } from '@/hooks/use-classrooms';
import { useGradeLevels } from '@/hooks/use-subjects-admin';
import { useAcademicYears } from '@/hooks/use-academic-years';
import { Classroom } from '@/lib/api/classrooms';

interface ClassroomFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classroom?: Classroom;
}

export function ClassroomForm({ open, onOpenChange, classroom }: ClassroomFormProps) {
    const isEdit = !!classroom;
    const [formData, setFormData] = useState({
        academicYearId: '',
        gradeLevelId: '',
        room: 1,
        name: '',
        capacity: 40,
        studyPlan: '',
    });

    const createMutation = useCreateClassroom();
    const updateMutation = useUpdateClassroom();
    const { data: gradeLevels } = useGradeLevels();
    const { data: academicYears } = useAcademicYears();

    useEffect(() => {
        if (classroom) {
            setFormData({
                academicYearId: classroom.academicYear?.id || '',
                gradeLevelId: classroom.gradeLevel?.id || '',
                room: classroom.room,
                name: classroom.name,
                capacity: classroom.capacity,
                studyPlan: classroom.studyPlan || '',
            });
        } else {
            setFormData({
                academicYearId: academicYears?.find((a) => a.isCurrent)?.id || '',
                gradeLevelId: '',
                room: 1,
                name: '',
                capacity: 40,
                studyPlan: '',
            });
        }
    }, [classroom, academicYears]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            updateMutation.mutate(
                { id: classroom.id, dto: { room: formData.room, name: formData.name, capacity: formData.capacity, studyPlan: formData.studyPlan || undefined } },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            createMutation.mutate(
                { ...formData, studyPlan: formData.studyPlan || undefined },
                { onSuccess: () => onOpenChange(false) }
            );
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'แก้ไขห้องเรียน' : 'เพิ่มห้องเรียน'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isEdit && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    ปีการศึกษา *
                                </label>
                                <select
                                    required
                                    value={formData.academicYearId}
                                    onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                >
                                    <option value="">เลือกปีการศึกษา</option>
                                    {academicYears?.map((ay) => (
                                        <option key={ay.id} value={ay.id}>{ay.name} {ay.isCurrent ? '(ปัจจุบัน)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    ระดับชั้น *
                                </label>
                                <select
                                    required
                                    value={formData.gradeLevelId}
                                    onChange={(e) => setFormData({ ...formData, gradeLevelId: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                >
                                    <option value="">เลือกระดับชั้น</option>
                                    {gradeLevels?.map((gl) => (
                                        <option key={gl.id} value={gl.id}>{gl.nameTh} ({gl.code})</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            ชื่อห้องเรียน *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="เช่น ม.1/1"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ห้องที่ *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: parseInt(e.target.value) })}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ความจุ</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">แผนการเรียน</label>
                        <input
                            type="text"
                            placeholder="เช่น วิทย์-คณิต, อังกฤษ-จีน"
                            value={formData.studyPlan}
                            onChange={(e) => setFormData({ ...formData, studyPlan: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
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
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {isPending ? 'กำลังบันทึก...' : isEdit ? 'บันทึก' : 'เพิ่ม'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
