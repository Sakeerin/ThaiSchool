// Students Management Page - Admin dashboard

'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal, GraduationCap } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StudentForm } from './components/student-form';
import { useStudents, useDeleteStudent } from '@/hooks/use-students';
import { Student } from '@/lib/api/students';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function StudentsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const { data, isLoading, refetch } = useStudents({ page, limit: 20, search });
    const deleteMutation = useDeleteStudent();

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setFormOpen(true);
    };

    const handleDelete = (student: Student) => {
        setSelectedStudent(student);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedStudent) {
            await deleteMutation.mutateAsync(selectedStudent.id);
            setDeleteOpen(false);
            setSelectedStudent(null);
        }
    };

    const getFullName = (student: Student) => {
        return `${student.titleTh}${student.firstNameTh} ${student.lastNameTh}`;
    };

    const columns: Column<Student>[] = [
        {
            key: 'studentCode',
            header: 'รหัสนักเรียน',
            cell: (student) => (
                <span className="font-mono text-sm">{student.studentCode}</span>
            ),
        },
        {
            key: 'name',
            header: 'ชื่อ-นามสกุล',
            cell: (student) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white">{getFullName(student)}</div>
                    {student.nickname && (
                        <div className="text-xs text-gray-500">({student.nickname})</div>
                    )}
                </div>
            ),
        },
        {
            key: 'classroom',
            header: 'ชั้นเรียน',
            cell: (student) => (
                student.classroom ? (
                    <Badge variant="secondary">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {student.classroom.gradeLevel?.nameTh || student.classroom.name}
                    </Badge>
                ) : <span className="text-gray-400">-</span>
            ),
        },
        {
            key: 'email',
            header: 'อีเมล',
            cell: (student) => student.user?.email || '-',
        },
        {
            key: 'status',
            header: 'สถานะ',
            cell: (student) => <StatusBadge status={student.status} />,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการนักเรียน</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        จัดการข้อมูลนักเรียนทั้งหมดในระบบ
                    </p>
                </div>
                <Button onClick={() => { setSelectedStudent(null); setFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มนักเรียน
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={data?.items || []}
                loading={isLoading}
                searchPlaceholder="ค้นหาชื่อหรือรหัสนักเรียน..."
                onSearch={setSearch}
                pagination={data?.meta}
                onPageChange={setPage}
                emptyMessage="ไม่พบนักเรียน"
                actions={(student) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(student)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(student)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                ลบ
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            />

            {/* Create/Edit Modal */}
            <StudentForm
                open={formOpen}
                onOpenChange={setFormOpen}
                student={selectedStudent}
                onSuccess={refetch}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="ยืนยันการลบ"
                description={`คุณต้องการลบนักเรียน "${selectedStudent ? getFullName(selectedStudent) : ''}" หรือไม่?`}
                confirmText="ลบ"
                onConfirm={confirmDelete}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
