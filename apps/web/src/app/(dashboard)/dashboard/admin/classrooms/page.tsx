// Admin Classrooms Management Page

'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useClassrooms, useDeleteClassroom } from '@/hooks/use-classrooms';
import { ClassroomForm } from './components/classroom-form';
import { Classroom } from '@/lib/api/classrooms';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminClassroomsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [editClassroom, setEditClassroom] = useState<Classroom | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data, isLoading } = useClassrooms({ page, limit: 20, search });
    const deleteMutation = useDeleteClassroom();

    const columns = [
        {
            key: 'name', header: 'ชื่อห้อง', cell: (c: Classroom) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.gradeLevel?.nameTh}</p>
                </div>
            )
        },
        { key: 'room', header: 'ห้องที่', cell: (c: Classroom) => c.room.toString() },
        {
            key: 'capacity', header: 'ความจุ', cell: (c: Classroom) => (
                <span>{c._count?.students || 0} / {c.capacity}</span>
            )
        },
        {
            key: 'gradeLevel', header: 'ระดับชั้น', cell: (c: Classroom) => (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    {c.gradeLevel?.code || '-'}
                </span>
            )
        },
        {
            key: 'advisor', header: 'ครูประจำชั้น', cell: (c: Classroom) => (
                c.advisor
                    ? <span>{c.advisor.titleTh}{c.advisor.firstNameTh} {c.advisor.lastNameTh}</span>
                    : <span className="text-gray-400">ยังไม่ระบุ</span>
            )
        },
        { key: 'academicYear', header: 'ปีการศึกษา', cell: (c: Classroom) => c.academicYear?.name || '-' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการห้องเรียน</h1>
                    <p className="text-gray-600 dark:text-gray-400">เพิ่ม แก้ไข และจัดการห้องเรียน</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" /> เพิ่มห้องเรียน
                </button>
            </div>

            <DataTable
                columns={columns}
                data={data?.items || []}
                loading={isLoading}
                searchPlaceholder="ค้นหาห้องเรียน..."
                onSearch={setSearch}
                pagination={data?.meta ? {
                    page: data.meta.page,
                    limit: 20,
                    totalPages: data.meta.totalPages,
                    total: data.meta.total,
                } : undefined}
                onPageChange={setPage}
                emptyMessage="ยังไม่มีห้องเรียน"
                actions={(classroom: Classroom) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditClassroom(classroom)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="แก้ไข"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setDeleteId(classroom.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="ลบ"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            />

            {/* Create Dialog */}
            <ClassroomForm
                open={showCreate}
                onOpenChange={setShowCreate}
            />

            {/* Edit Dialog */}
            {editClassroom && (
                <ClassroomForm
                    open={!!editClassroom}
                    onOpenChange={(open) => !open && setEditClassroom(null)}
                    classroom={editClassroom}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="ลบห้องเรียน"
                description="คุณแน่ใจหรือไม่ว่าต้องการลบห้องเรียนนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
                confirmText="ลบ"
                onConfirm={() => {
                    if (deleteId) {
                        deleteMutation.mutate(deleteId, {
                            onSuccess: () => setDeleteId(null),
                        });
                    }
                }}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
