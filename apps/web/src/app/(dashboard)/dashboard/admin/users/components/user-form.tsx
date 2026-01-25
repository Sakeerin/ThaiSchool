// User Form Component - Create/Edit user modal

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
import { User } from '@/lib/api/users';
import { useCreateUser, useUpdateUser } from '@/hooks/use-users';

interface UserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
    onSuccess?: () => void;
}

const roles = [
    { value: 'ADMIN', label: 'ผู้ดูแลระบบ' },
    { value: 'TEACHER', label: 'ครู' },
    { value: 'STUDENT', label: 'นักเรียน' },
    { value: 'PARENT', label: 'ผู้ปกครอง' },
];

export function UserForm({ open, onOpenChange, user, onSuccess }: UserFormProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: '',
        role: 'STUDENT',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createMutation = useCreateUser();
    const updateMutation = useUpdateUser();

    const isEdit = !!user;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                password: '',
                phone: user.phone || '',
                role: user.role || 'STUDENT',
            });
        } else {
            setFormData({
                email: '',
                password: '',
                phone: '',
                role: 'STUDENT',
            });
        }
        setErrors({});
    }, [user, open]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'กรุณากรอกอีเมล';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }

        if (!isEdit && !formData.password) {
            newErrors.password = 'กรุณากรอกรหัสผ่าน';
        } else if (!isEdit && formData.password.length < 6) {
            newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        }

        if (!formData.role) {
            newErrors.role = 'กรุณาเลือกบทบาท';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (isEdit && user) {
                await updateMutation.mutateAsync({
                    id: user.id,
                    dto: {
                        email: formData.email,
                        phone: formData.phone || undefined,
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone || undefined,
                    role: formData.role,
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">อีเมล *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                        />
                    </div>

                    {!isEdit && (
                        <div className="space-y-2">
                            <Label htmlFor="password">รหัสผ่าน *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="อย่างน้อย 6 ตัวอักษร"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={errors.password}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="08x-xxx-xxxx"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    {!isEdit && (
                        <div className="space-y-2">
                            <Label htmlFor="role">บทบาท *</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกบทบาท" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                        </div>
                    )}

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

export default UserForm;
