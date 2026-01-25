// Users Management Page - Admin dashboard

'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { RoleBadge, StatusBadge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserForm } from './components/user-form';
import { useUsers, useDeleteUser } from '@/hooks/use-users';
import { User } from '@/lib/api/users';
import { formatDateTime } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UsersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { data, isLoading, refetch } = useUsers({ page, limit: 20, search });
    const deleteMutation = useDeleteUser();

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormOpen(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedUser) {
            await deleteMutation.mutateAsync(selectedUser.id);
            setDeleteOpen(false);
            setSelectedUser(null);
        }
    };

    const columns: Column<User>[] = [
        {
            key: 'email',
            header: 'อีเมล',
            cell: (user) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white">{user.email}</div>
                    {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                </div>
            ),
        },
        {
            key: 'role',
            header: 'บทบาท',
            cell: (user) => <RoleBadge role={user.role} />,
        },
        {
            key: 'isActive',
            header: 'สถานะ',
            cell: (user) => <StatusBadge isActive={user.isActive} />,
        },
        {
            key: 'lastLoginAt',
            header: 'เข้าใช้งานล่าสุด',
            cell: (user) => user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '-',
        },
        {
            key: 'createdAt',
            header: 'สร้างเมื่อ',
            cell: (user) => formatDateTime(user.createdAt),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการผู้ใช้</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ
                    </p>
                </div>
                <Button onClick={() => { setSelectedUser(null); setFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มผู้ใช้
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={data?.items || []}
                loading={isLoading}
                searchPlaceholder="ค้นหาอีเมลหรือชื่อ..."
                onSearch={setSearch}
                pagination={data?.meta}
                onPageChange={setPage}
                emptyMessage="ไม่พบผู้ใช้"
                actions={(user) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(user)}
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
            <UserForm
                open={formOpen}
                onOpenChange={setFormOpen}
                user={selectedUser}
                onSuccess={refetch}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="ยืนยันการลบ"
                description={`คุณต้องการลบผู้ใช้ "${selectedUser?.email}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
                confirmText="ลบ"
                onConfirm={confirmDelete}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
