// Admin Settings Page - Academic Year & System Management

'use client';

import { useState } from 'react';
import {
    useAcademicYears,
    useCreateAcademicYear,
    useSetCurrentAcademicYear,
    useDeleteAcademicYear,
    useCreateSemester,
    useSetCurrentSemester,
} from '@/hooks/use-academic-years';
import { useAdminSystemInfo } from '@/hooks/use-admin';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Settings,
    Calendar,
    Plus,
    Star,
    Trash2,
    BookOpen,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';

export default function AdminSettingsPage() {
    const { data: systemInfo, isLoading } = useAdminSystemInfo();
    const { data: academicYears } = useAcademicYears();
    const createAYMutation = useCreateAcademicYear();
    const setCurrentAYMutation = useSetCurrentAcademicYear();
    const deleteAYMutation = useDeleteAcademicYear();
    const createSemesterMutation = useCreateSemester();
    const setCurrentSemesterMutation = useSetCurrentSemester();

    const [showCreateAY, setShowCreateAY] = useState(false);
    const [showCreateSemester, setShowCreateSemester] = useState<string | null>(null);
    const [deleteAYId, setDeleteAYId] = useState<string | null>(null);
    const [expandedYear, setExpandedYear] = useState<string | null>(null);

    const [ayForm, setAyForm] = useState({ year: new Date().getFullYear() + 543, name: '', startDate: '', endDate: '' });
    const [semForm, setSemForm] = useState({ number: 1, name: '', startDate: '', endDate: '' });

    const handleCreateAY = (e: React.FormEvent) => {
        e.preventDefault();
        createAYMutation.mutate(ayForm, {
            onSuccess: () => {
                setShowCreateAY(false);
                setAyForm({ year: new Date().getFullYear() + 543, name: '', startDate: '', endDate: '' });
            },
        });
    };

    const handleCreateSemester = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showCreateSemester) return;
        createSemesterMutation.mutate(
            { ...semForm, academicYearId: showCreateSemester },
            {
                onSuccess: () => {
                    setShowCreateSemester(null);
                    setSemForm({ number: 1, name: '', startDate: '', endDate: '' });
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ตั้งค่าระบบ</h1>
                    <p className="text-gray-600 dark:text-gray-400">จัดการปีการศึกษาและตั้งค่าระบบ</p>
                </div>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-7 h-7 text-gray-600" />
                    ตั้งค่าระบบ
                </h1>
                <p className="text-gray-600 dark:text-gray-400">จัดการปีการศึกษาและตั้งค่าระบบ</p>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grade Levels */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        ระดับชั้นในระบบ
                    </h2>
                    <div className="space-y-2">
                        {systemInfo?.gradeLevels?.map((gl: any) => (
                            <div key={gl.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{gl.nameTh}</span>
                                <span className="text-xs font-mono text-gray-500">{gl.code}</span>
                            </div>
                        ))}
                        {(!systemInfo?.gradeLevels || systemInfo.gradeLevels.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีข้อมูลระดับชั้น</p>
                        )}
                    </div>
                </div>

                {/* Subject Areas */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        กลุ่มสาระการเรียนรู้
                    </h2>
                    <div className="space-y-2">
                        {systemInfo?.subjectAreas?.map((area: any) => (
                            <div key={area.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{area.nameTh}</span>
                                <span className="text-xs text-gray-500">{area._count?.subjects || 0} วิชา</span>
                            </div>
                        ))}
                        {(!systemInfo?.subjectAreas || systemInfo.subjectAreas.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีข้อมูลกลุ่มสาระ</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Academic Years */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        ปีการศึกษา
                    </h2>
                    <button
                        onClick={() => setShowCreateAY(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> เพิ่มปีการศึกษา
                    </button>
                </div>

                <div className="space-y-3">
                    {(academicYears || []).map((ay: any) => (
                        <div key={ay.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div
                                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${ay.isCurrent ? 'bg-green-50 dark:bg-green-900/10' : ''}`}
                                onClick={() => setExpandedYear(expandedYear === ay.id ? null : ay.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {expandedYear === ay.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    <span className="font-medium text-gray-900 dark:text-white">{ay.name}</span>
                                    {ay.isCurrent && (
                                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
                                            <Star className="w-3 h-3" /> ปัจจุบัน
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500">
                                        {ay.semesters?.length || 0} ภาคเรียน
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!ay.isCurrent && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentAYMutation.mutate(ay.id); }}
                                                className="px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                                title="ตั้งเป็นปัจจุบัน"
                                            >
                                                ตั้งเป็นปัจจุบัน
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteAYId(ay.id); }}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="ลบ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            {expandedYear === ay.id && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">ภาคเรียน</h4>
                                        <button
                                            onClick={() => setShowCreateSemester(ay.id)}
                                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                        >
                                            <Plus className="w-3 h-3" /> เพิ่มภาคเรียน
                                        </button>
                                    </div>
                                    {ay.semesters && ay.semesters.length > 0 ? (
                                        <div className="space-y-2">
                                            {ay.semesters.map((sem: any) => (
                                                <div key={sem.id} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800 rounded-lg">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{sem.name}</span>
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            {sem.startDate && new Date(sem.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            {sem.endDate && ` - ${new Date(sem.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {sem.isCurrent && (
                                                            <span className="text-xs text-green-600 font-medium">ปัจจุบัน</span>
                                                        )}
                                                        {!sem.isCurrent && (
                                                            <button
                                                                onClick={() => setCurrentSemesterMutation.mutate(sem.id)}
                                                                className="text-xs text-blue-600 hover:text-blue-700"
                                                            >
                                                                ตั้งเป็นปัจจุบัน
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 text-center py-2">ยังไม่มีภาคเรียน</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {(!academicYears || academicYears.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-8">ยังไม่มีปีการศึกษา</p>
                    )}
                </div>
            </div>

            {/* Create Academic Year Dialog */}
            <Dialog open={showCreateAY} onOpenChange={setShowCreateAY}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>เพิ่มปีการศึกษา</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateAY} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ปี พ.ศ. *</label>
                                <input
                                    type="number"
                                    required
                                    value={ayForm.year}
                                    onChange={(e) => setAyForm({ ...ayForm, year: parseInt(e.target.value) })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อ *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="เช่น ปีการศึกษา 2568"
                                    value={ayForm.name}
                                    onChange={(e) => setAyForm({ ...ayForm, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">วันเริ่ม *</label>
                                <input
                                    type="date"
                                    required
                                    value={ayForm.startDate}
                                    onChange={(e) => setAyForm({ ...ayForm, startDate: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">วันสิ้นสุด *</label>
                                <input
                                    type="date"
                                    required
                                    value={ayForm.endDate}
                                    onChange={(e) => setAyForm({ ...ayForm, endDate: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowCreateAY(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">ยกเลิก</button>
                            <button type="submit" disabled={createAYMutation.isPending} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                                {createAYMutation.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create Semester Dialog */}
            <Dialog open={!!showCreateSemester} onOpenChange={(open) => !open && setShowCreateSemester(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>เพิ่มภาคเรียน</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSemester} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ภาคเรียนที่ *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={semForm.number}
                                    onChange={(e) => setSemForm({ ...semForm, number: parseInt(e.target.value) })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อ *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="เช่น ภาคเรียนที่ 1"
                                    value={semForm.name}
                                    onChange={(e) => setSemForm({ ...semForm, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">วันเริ่ม *</label>
                                <input
                                    type="date"
                                    required
                                    value={semForm.startDate}
                                    onChange={(e) => setSemForm({ ...semForm, startDate: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">วันสิ้นสุด *</label>
                                <input
                                    type="date"
                                    required
                                    value={semForm.endDate}
                                    onChange={(e) => setSemForm({ ...semForm, endDate: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowCreateSemester(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">ยกเลิก</button>
                            <button type="submit" disabled={createSemesterMutation.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                {createSemesterMutation.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Academic Year Confirmation */}
            <ConfirmDialog
                open={!!deleteAYId}
                onOpenChange={(open) => !open && setDeleteAYId(null)}
                title="ลบปีการศึกษา"
                description="คุณแน่ใจหรือไม่ว่าต้องการลบปีการศึกษานี้? ข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบด้วย"
                confirmText="ลบ"
                onConfirm={() => {
                    if (deleteAYId) {
                        deleteAYMutation.mutate(deleteAYId, { onSuccess: () => setDeleteAYId(null) });
                    }
                }}
                loading={deleteAYMutation.isPending}
            />
        </div>
    );
}
