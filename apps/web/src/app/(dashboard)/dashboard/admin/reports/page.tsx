// Admin Reports Dashboard Page

'use client';

import { useState } from 'react';
import { useAdminReports } from '@/hooks/use-admin';
import { useAcademicYears } from '@/hooks/use-academic-years';
import { BarChart3, Users, GraduationCap, TrendingUp, BookOpen } from 'lucide-react';

const stageLabels: Record<string, string> = {
    PRIMARY: 'ประถมศึกษา',
    LOWER_SECONDARY: 'มัธยมศึกษาตอนต้น',
    UPPER_SECONDARY: 'มัธยมศึกษาตอนปลาย',
};

const attendanceStatusLabels: Record<string, { label: string; color: string }> = {
    PRESENT: { label: 'มาเรียน', color: 'bg-green-500' },
    ABSENT: { label: 'ขาดเรียน', color: 'bg-red-500' },
    LATE: { label: 'มาสาย', color: 'bg-yellow-500' },
    LEAVE: { label: 'ลา', color: 'bg-blue-500' },
    SICK: { label: 'ป่วย', color: 'bg-orange-500' },
};

export default function AdminReportsPage() {
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | undefined>();
    const [selectedSemesterId, setSelectedSemesterId] = useState<string | undefined>();
    const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance'>('overview');

    const { data: academicYears } = useAcademicYears();
    const { data, isLoading } = useAdminReports({
        academicYearId: selectedAcademicYearId,
        semesterId: selectedSemesterId,
    });

    const selectedAcademicYear = academicYears?.find((ay) => ay.id === selectedAcademicYearId);

    // Group grade levels by stage
    const gradeLevelsByStage = data?.gradeLevelSummary?.reduce((acc, gl) => {
        if (!acc[gl.stage]) acc[gl.stage] = [];
        acc[gl.stage].push(gl);
        return acc;
    }, {} as Record<string, typeof data.gradeLevelSummary>) || {};

    const totalStudents = data?.gradeLevelSummary?.reduce((s, gl) => s + gl.totalStudents, 0) || 0;
    const totalClassrooms = data?.gradeLevelSummary?.reduce((s, gl) => s + gl.totalClassrooms, 0) || 0;

    // Attendance total
    const attendanceTotal = Object.values(data?.attendance || {}).reduce((s, c) => s + c, 0);

    const tabs = [
        { id: 'overview' as const, label: 'ภาพรวม', icon: BarChart3 },
        { id: 'grades' as const, label: 'ผลการเรียน', icon: GraduationCap },
        { id: 'attendance' as const, label: 'การเข้าเรียน', icon: Users },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-blue-600" />
                        รายงาน
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">ภาพรวมข้อมูลรายงานสำหรับผู้ดูแลระบบ</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedAcademicYearId || ''}
                        onChange={(e) => {
                            setSelectedAcademicYearId(e.target.value || undefined);
                            setSelectedSemesterId(undefined);
                        }}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    >
                        <option value="">ทุกปีการศึกษา</option>
                        {academicYears?.map((ay) => (
                            <option key={ay.id} value={ay.id}>{ay.name}</option>
                        ))}
                    </select>
                    {selectedAcademicYear && selectedAcademicYear.semesters.length > 0 && (
                        <select
                            value={selectedSemesterId || ''}
                            onChange={(e) => setSelectedSemesterId(e.target.value || undefined)}
                            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                        >
                            <option value="">ทุกภาคเรียน</option>
                            {selectedAcademicYear.semesters.map((sem) => (
                                <option key={sem.id} value={sem.id}>{sem.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">นักเรียนทั้งหมด</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-green-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalClassrooms}</div>
                            <div className="text-sm text-gray-500">ห้องเรียน</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-purple-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data?.subjectStats?.totalSubjects || 0}</div>
                            <div className="text-sm text-gray-500">รายวิชา</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-orange-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data?.subjectStats?.totalSubjectAreas || 0}</div>
                            <div className="text-sm text-gray-500">กลุ่มสาระ</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                            ))}
                        </div>
                    ) : activeTab === 'overview' ? (
                        // Overview Tab - Grade Level Summary
                        <div className="space-y-6">
                            {Object.entries(gradeLevelsByStage).map(([stage, levels]) => (
                                <div key={stage}>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        {stageLabels[stage] || stage}
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">ระดับชั้น</th>
                                                    <th className="px-4 py-2 text-center font-medium text-gray-600 dark:text-gray-300">จำนวนห้อง</th>
                                                    <th className="px-4 py-2 text-center font-medium text-gray-600 dark:text-gray-300">จำนวนนักเรียน</th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">รายละเอียด</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {levels.map((gl) => (
                                                    <tr key={gl.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{gl.nameTh}</td>
                                                        <td className="px-4 py-3 text-center">{gl.totalClassrooms}</td>
                                                        <td className="px-4 py-3 text-center font-semibold text-blue-600">{gl.totalStudents.toLocaleString()}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap gap-1">
                                                                {gl.classrooms.map((c) => (
                                                                    <span key={c.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                                                        {c.name}: {c.studentCount} คน
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                            {(!data?.gradeLevelSummary || data.gradeLevelSummary.length === 0) && (
                                <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูลระดับชั้น</p>
                            )}
                        </div>
                    ) : activeTab === 'grades' ? (
                        // Grades Tab - Grade Distribution
                        <div>
                            {!selectedSemesterId ? (
                                <div className="text-center py-12 text-gray-500">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>กรุณาเลือกปีการศึกษาและภาคเรียนเพื่อดูข้อมูลผลการเรียน</p>
                                </div>
                            ) : data?.gradeDistribution && data.gradeDistribution.length > 0 ? (
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">การกระจายตัวของเกรด</h3>
                                    {data.gradeDistribution.map((gd) => {
                                        const totalGrades = data.gradeDistribution.reduce((s, g) => s + g.count, 0);
                                        const pct = totalGrades > 0 ? Math.round((gd.count / totalGrades) * 100) : 0;
                                        return (
                                            <div key={gd.grade} className="flex items-center gap-3">
                                                <span className="w-12 text-sm font-bold text-gray-900 dark:text-white">{gd.grade}</span>
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-6 rounded-full flex items-center justify-end px-2"
                                                        style={{ width: `${Math.max(pct, 5)}%` }}
                                                    >
                                                        <span className="text-xs text-white font-medium">{pct}%</span>
                                                    </div>
                                                </div>
                                                <span className="w-16 text-sm text-right text-gray-600 dark:text-gray-400">{gd.count.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูลผลการเรียน</p>
                            )}
                        </div>
                    ) : (
                        // Attendance Tab
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">สรุปการเข้าเรียน 30 วันล่าสุด</h3>
                            {attendanceTotal > 0 ? (
                                <div className="space-y-3">
                                    {Object.entries(data?.attendance || {}).map(([status, count]) => {
                                        const info = attendanceStatusLabels[status] || { label: status, color: 'bg-gray-500' };
                                        const pct = Math.round((count / attendanceTotal) * 100);
                                        return (
                                            <div key={status} className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${info.color}`} />
                                                <span className="w-20 text-sm text-gray-700 dark:text-gray-300">{info.label}</span>
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                                    <div
                                                        className={`${info.color} h-4 rounded-full transition-all`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="w-20 text-sm text-right text-gray-600 dark:text-gray-400">
                                                    {count.toLocaleString()} ({pct}%)
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-500">
                                            จำนวนรายการทั้งหมด: <span className="font-semibold text-gray-900 dark:text-white">{attendanceTotal.toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูลการเข้าเรียน</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
