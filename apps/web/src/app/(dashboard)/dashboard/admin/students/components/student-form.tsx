// Student Form Component - Create/Edit student modal

'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { Student } from '@/lib/api/students';
import { useCreateStudent, useUpdateStudent } from '@/hooks/use-students';

interface StudentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student?: Student | null;
    onSuccess?: () => void;
}

const titles = [
    { value: 'เด็กชาย', label: 'เด็กชาย' },
    { value: 'เด็กหญิง', label: 'เด็กหญิง' },
    { value: 'นาย', label: 'นาย' },
    { value: 'นางสาว', label: 'นางสาว' },
];

const genders = [
    { value: 'MALE', label: 'ชาย' },
    { value: 'FEMALE', label: 'หญิง' },
];

export function StudentForm({ open, onOpenChange, student, onSuccess }: StudentFormProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nationalId: '',
        titleTh: 'เด็กชาย',
        firstNameTh: '',
        lastNameTh: '',
        firstNameEn: '',
        lastNameEn: '',
        nickname: '',
        gender: 'MALE',
        dateOfBirth: '',
        classroomId: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createMutation = useCreateStudent();
    const updateMutation = useUpdateStudent();

    const isEdit = !!student;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (student) {
            setFormData({
                email: student.user?.email || '',
                password: '',
                nationalId: student.nationalId || '',
                titleTh: student.titleTh || 'เด็กชาย',
                firstNameTh: student.firstNameTh || '',
                lastNameTh: student.lastNameTh || '',
                firstNameEn: student.firstNameEn || '',
                lastNameEn: student.lastNameEn || '',
                nickname: student.nickname || '',
                gender: student.gender || 'MALE',
                dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
                classroomId: student.classroomId || '',
            });
        } else {
            setFormData({
                email: '',
                password: '',
                nationalId: '',
                titleTh: 'เด็กชาย',
                firstNameTh: '',
                lastNameTh: '',
                firstNameEn: '',
                lastNameEn: '',
                nickname: '',
                gender: 'MALE',
                dateOfBirth: '',
                classroomId: '',
            });
        }
        setErrors({});
    }, [student, open]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!isEdit) {
            if (!formData.email) newErrors.email = 'กรุณากรอกอีเมล';
            if (!formData.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
            else if (formData.password.length < 6) newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        }

        if (!formData.nationalId) {
            newErrors.nationalId = 'กรุณากรอกเลขประจำตัวประชาชน';
        } else if (formData.nationalId.length !== 13) {
            newErrors.nationalId = 'เลขประจำตัวประชาชนต้องมี 13 หลัก';
        }

        if (!formData.firstNameTh) newErrors.firstNameTh = 'กรุณากรอกชื่อ';
        if (!formData.lastNameTh) newErrors.lastNameTh = 'กรุณากรอกนามสกุล';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            if (isEdit && student) {
                await updateMutation.mutateAsync({
                    id: student.id,
                    dto: {
                        titleTh: formData.titleTh,
                        firstNameTh: formData.firstNameTh,
                        lastNameTh: formData.lastNameTh,
                        firstNameEn: formData.firstNameEn || undefined,
                        lastNameEn: formData.lastNameEn || undefined,
                        nickname: formData.nickname || undefined,
                        gender: formData.gender,
                        dateOfBirth: formData.dateOfBirth || undefined,
                        classroomId: formData.classroomId || undefined,
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    email: formData.email,
                    password: formData.password,
                    nationalId: formData.nationalId,
                    titleTh: formData.titleTh,
                    firstNameTh: formData.firstNameTh,
                    lastNameTh: formData.lastNameTh,
                    firstNameEn: formData.firstNameEn || undefined,
                    lastNameEn: formData.lastNameEn || undefined,
                    nickname: formData.nickname || undefined,
                    gender: formData.gender,
                    dateOfBirth: formData.dateOfBirth || undefined,
                    classroomId: formData.classroomId || undefined,
                });
            }
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            setErrors({ submit: error.response?.data?.message || 'เกิดข้อผิดพลาด' });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isEdit && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>อีเมล *</Label>
                                    <Input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        error={errors.email}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>รหัสผ่าน *</Label>
                                    <Input
                                        type="password"
                                        placeholder="อย่างน้อย 6 ตัวอักษร"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        error={errors.password}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label>เลขประจำตัวประชาชน *</Label>
                        <Input
                            placeholder="เลข 13 หลัก"
                            value={formData.nationalId}
                            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value.replace(/\D/g, '').slice(0, 13) })}
                            error={errors.nationalId}
                            disabled={isEdit}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>คำนำหน้า</Label>
                            <Select value={formData.titleTh} onValueChange={(v) => setFormData({ ...formData, titleTh: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {titles.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>ชื่อ (ไทย) *</Label>
                            <Input
                                value={formData.firstNameTh}
                                onChange={(e) => setFormData({ ...formData, firstNameTh: e.target.value })}
                                error={errors.firstNameTh}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>นามสกุล (ไทย) *</Label>
                            <Input
                                value={formData.lastNameTh}
                                onChange={(e) => setFormData({ ...formData, lastNameTh: e.target.value })}
                                error={errors.lastNameTh}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>ชื่อ (English)</Label>
                            <Input
                                value={formData.firstNameEn}
                                onChange={(e) => setFormData({ ...formData, firstNameEn: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>นามสกุล (English)</Label>
                            <Input
                                value={formData.lastNameEn}
                                onChange={(e) => setFormData({ ...formData, lastNameEn: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>ชื่อเล่น</Label>
                            <Input
                                value={formData.nickname}
                                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>เพศ</Label>
                            <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {genders.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>วันเกิด</Label>
                            <Input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm dark:bg-red-900/20 dark:text-red-400">
                            {errors.submit}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" loading={isLoading}>
                            {isEdit ? 'บันทึก' : 'สร้าง'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default StudentForm;
