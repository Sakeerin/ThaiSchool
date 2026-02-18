// Admin Subjects Management Page

'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useSubjectsAdmin, useDeleteSubject, useSubjectAreas } from '@/hooks/use-subjects-admin';
import { SubjectForm } from './components/subject-form';
import { Subject } from '@/lib/api/subjects';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';

export default function AdminSubjectsPage() {
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [editSubject, setEditSubject] = useState<Subject | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data: subjects, isLoading } = useSubjectsAdmin();
    const { data: subjectAreas } = useSubjectAreas();
    const deleteMutation = useDeleteSubject();

    // Client-side filtering since subjects API returns array
    const filteredSubjects = (subjects || []).filter((s: Subject) =>
        !search || s.nameTh.includes(search) || s.code.includes(search) || (s.nameEn && s.nameEn.toLowerCase().includes(search.toLowerCase()))
    );

    const areaColorMap: Record<string, string> = {
        'TH': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        'MA': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'SC': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'SO': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        'EN': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        'HE': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        'AR': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        'CA': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    };

    const columns = [
        {
            key: 'code', header: 'รหัสวิชา', cell: (s: Subject) => (
                <span className="font-mono text-sm">{s.code}</span>
            )
        },
        {
            key: 'nameTh', header: 'ชื่อวิชา', cell: (s: Subject) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">{s.nameTh}</p>
                    {s.nameEn && <p className="text-xs text-gray-500">{s.nameEn}</p>}
                </div>
            )
        },
        {
            key: 'subjectArea', header: 'กลุ่มสาระ', cell: (s: Subject) => {
                const code = s.subjectArea?.code?.substring(0, 2) || '';
                const colorClass = areaColorMap[code] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                        {s.subjectArea?.nameTh || '-'}
                    </span>
                );
            }
        },
        {
            key: 'credits', header: 'หน่วยกิต', cell: (s: Subject) => (
                <span className="text-center">{s.credits}</span>
            )
        },
        {
            key: 'hoursPerWeek', header: 'ชม./สัปดาห์', cell: (s: Subject) => (
                <span>{s.hoursPerWeek}</span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-7 h-7 text-purple-600" />
                        จัดการรายวิชา
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">เพิ่ม แก้ไข และจัดการรายวิชา</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-4 h-4" /> เพิ่มรายวิชา
                </button>
            </div>

            {/* Subject Areas Summary */}
            {subjectAreas && subjectAreas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {subjectAreas.map((area: any) => {
                        const code = area.code?.substring(0, 2) || '';
                        const colorClass = areaColorMap[code] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
                        return (
                            <span key={area.id} className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                                {area.nameTh}
                            </span>
                        );
                    })}
                </div>
            )}

            <DataTable
                columns={columns}
                data={filteredSubjects}
                loading={isLoading}
                searchPlaceholder="ค้นหารายวิชา..."
                onSearch={setSearch}
                emptyMessage="ยังไม่มีรายวิชา"
                actions={(subject: Subject) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditSubject(subject)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="แก้ไข"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setDeleteId(subject.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="ลบ"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            />

            <SubjectForm open={showCreate} onOpenChange={setShowCreate} />
            {editSubject && (
                <SubjectForm
                    open={!!editSubject}
                    onOpenChange={(open) => !open && setEditSubject(null)}
                    subject={editSubject}
                />
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="ลบรายวิชา"
                description="คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชานี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
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
