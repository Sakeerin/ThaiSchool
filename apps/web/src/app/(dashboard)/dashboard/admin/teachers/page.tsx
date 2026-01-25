// Teachers Management Page - Admin dashboard

'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal, BookOpen } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTeachers, useDeleteTeacher, useCreateTeacher, useUpdateTeacher } from '@/hooks/use-teachers';
import { Teacher } from '@/lib/api/teachers';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const titles = [
    { value: 'นาย', label: 'นาย' },
    { value: 'นาง', label: 'นาง' },
    { value: 'นางสาว', label: 'นางสาว' },
];

export default function TeachersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        employeeCode: '',
        titleTh: 'นาย',
        firstNameTh: '',
        lastNameTh: '',
        position: '',
        department: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data, isLoading, refetch } = useTeachers({ page, limit: 20, search });
    const deleteMutation = useDeleteTeacher();
    const createMutation = useCreateTeacher();
    const updateMutation = useUpdateTeacher();

    const isMutating = createMutation.isPending || updateMutation.isPending;

    const handleEdit = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setFormData({
            email: teacher.user?.email || '',
            password: '',
            employeeCode: teacher.employeeCode,
            titleTh: teacher.titleTh,
            firstNameTh: teacher.firstNameTh,
            lastNameTh: teacher.lastNameTh,
            position: teacher.position || '',
            department: teacher.department || '',
        });
        setFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedTeacher(null);
        setFormData({
            email: '',
            password: '',
            employeeCode: '',
            titleTh: 'นาย',
            firstNameTh: '',
            lastNameTh: '',
            position: '',
            department: '',
        });
        setErrors({});
        setFormOpen(true);
    };

    const handleDelete = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedTeacher) {
            await deleteMutation.mutateAsync(selectedTeacher.id);
            setDeleteOpen(false);
            setSelectedTeacher(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!selectedTeacher) {
            if (!formData.email) newErrors.email = 'กรุณากรอกอีเมล';
            if (!formData.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
            if (!formData.employeeCode) newErrors.employeeCode = 'กรุณากรอกรหัสพนักงาน';
        }
        if (!formData.firstNameTh) newErrors.firstNameTh = 'กรุณากรอกชื่อ';
        if (!formData.lastNameTh) newErrors.lastNameTh = 'กรุณากรอกนามสกุล';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (selectedTeacher) {
                await updateMutation.mutateAsync({
                    id: selectedTeacher.id,
                    dto: {
                        titleTh: formData.titleTh,
                        firstNameTh: formData.firstNameTh,
                        lastNameTh: formData.lastNameTh,
                        position: formData.position || undefined,
                        department: formData.department || undefined,
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    email: formData.email,
                    password: formData.password,
                    employeeCode: formData.employeeCode,
                    titleTh: formData.titleTh,
                    firstNameTh: formData.firstNameTh,
                    lastNameTh: formData.lastNameTh,
                    position: formData.position || undefined,
                    department: formData.department || undefined,
                });
            }
            setFormOpen(false);
            refetch();
        } catch (err: any) {
            setErrors({ submit: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
        }
    };

    const getFullName = (teacher: Teacher) => `${teacher.titleTh}${teacher.firstNameTh} ${teacher.lastNameTh}`;

    const columns: Column<Teacher>[] = [
        {
            key: 'employeeCode',
            header: 'รหัสพนักงาน',
            cell: (t) => <span className="font-mono text-sm">{t.employeeCode}</span>,
        },
        {
            key: 'name',
            header: 'ชื่อ-นามสกุล',
            cell: (t) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white">{getFullName(t)}</div>
                    {t.position && <div className="text-xs text-gray-500">{t.position}</div>}
                </div>
            ),
        },
        {
            key: 'department',
            header: 'กลุ่มสาระ',
            cell: (t) => t.department ? <Badge variant="secondary">{t.department}</Badge> : '-',
        },
        {
            key: 'email',
            header: 'อีเมล',
            cell: (t) => t.user?.email || '-',
        },
        {
            key: 'status',
            header: 'สถานะ',
            cell: (t) => <StatusBadge status={t.status} />,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการครู</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">จัดการข้อมูลครูทั้งหมดในระบบ</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มครู
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={data?.items || []}
                loading={isLoading}
                searchPlaceholder="ค้นหาชื่อหรือรหัสพนักงาน..."
                onSearch={setSearch}
                pagination={data?.meta}
                onPageChange={setPage}
                emptyMessage="ไม่พบครู"
                actions={(teacher) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                                <Pencil className="w-4 h-4 mr-2" />แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(teacher)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />ลบ
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            />

            {/* Teacher Form Modal */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{selectedTeacher ? 'แก้ไขข้อมูลครู' : 'เพิ่มครูใหม่'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!selectedTeacher && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>อีเมล *</Label>
                                        <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={errors.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>รหัสผ่าน *</Label>
                                        <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} error={errors.password} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>รหัสพนักงาน *</Label>
                                    <Input value={formData.employeeCode} onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })} error={errors.employeeCode} />
                                </div>
                            </>
                        )}
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
                                <Label>ชื่อ *</Label>
                                <Input value={formData.firstNameTh} onChange={(e) => setFormData({ ...formData, firstNameTh: e.target.value })} error={errors.firstNameTh} />
                            </div>
                            <div className="space-y-2">
                                <Label>นามสกุล *</Label>
                                <Input value={formData.lastNameTh} onChange={(e) => setFormData({ ...formData, lastNameTh: e.target.value })} error={errors.lastNameTh} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ตำแหน่ง</Label>
                                <Input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>กลุ่มสาระ</Label>
                                <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                            </div>
                        </div>
                        {errors.submit && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{errors.submit}</div>}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>ยกเลิก</Button>
                            <Button type="submit" loading={isMutating}>{selectedTeacher ? 'บันทึก' : 'สร้าง'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="ยืนยันการลบ"
                description={`คุณต้องการลบครู "${selectedTeacher ? getFullName(selectedTeacher) : ''}" หรือไม่?`}
                onConfirm={confirmDelete}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
