// Admin Dashboard Page - Dynamic stats from API

'use client';

import { useAdminDashboard } from '@/hooks/use-admin';
import {
    Users,
    UserCheck,
    BookOpen,
    GraduationCap,
    TrendingUp,
    Bell,
    Calendar,
    Activity,
} from 'lucide-react';

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'ผู้ดูแลสูงสุด',
    ADMIN: 'ผู้ดูแลระบบ',
    TEACHER: 'ครู',
    STUDENT: 'นักเรียน',
    PARENT: 'ผู้ปกครอง',
};

const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    NORMAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminDashboardPage() {
    const { data, isLoading } = useAdminDashboard();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ภาพรวมระบบ</h1>
                    <p className="text-gray-600 dark:text-gray-400">ยินดีต้อนรับ ผู้ดูแลระบบ</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700 mb-4" />
                            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const stats = data?.stats;
    const attendance = data?.attendance;

    const statCards = [
        { label: 'นักเรียนทั้งหมด', value: stats?.totalStudents?.toLocaleString() || '0', icon: Users, colorClass: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
        { label: 'ครูทั้งหมด', value: stats?.totalTeachers?.toLocaleString() || '0', icon: UserCheck, colorClass: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400' },
        { label: 'วิชาทั้งหมด', value: stats?.totalSubjects?.toLocaleString() || '0', icon: BookOpen, colorClass: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
        { label: 'ห้องเรียน', value: stats?.totalClassrooms?.toLocaleString() || '0', icon: GraduationCap, colorClass: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ภาพรวมระบบ</h1>
                    <p className="text-gray-600 dark:text-gray-400">ยินดีต้อนรับ ผู้ดูแลระบบ</p>
                </div>
                {data?.currentAcademicYear && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {data.currentAcademicYear.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.colorClass} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        การเข้าเรียนวันนี้
                    </h2>
                    <div className="flex items-center justify-center">
                        <div className="text-center w-full">
                            <div className="flex justify-center gap-8 mb-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">{attendance?.present?.toLocaleString() || 0}</div>
                                    <div className="text-sm text-gray-500">มาเรียน</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-red-600">{attendance?.absent || 0}</div>
                                    <div className="text-sm text-gray-500">ขาดเรียน</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-yellow-600">{attendance?.late || 0}</div>
                                    <div className="text-sm text-gray-500">มาสาย</div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${attendance?.rate || 0}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                อัตราการเข้าเรียน {attendance?.rate || 0}%
                                {attendance?.total === 0 && ' (ยังไม่มีข้อมูล)'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Role Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        ผู้ใช้งานในระบบ
                    </h2>
                    <div className="space-y-3">
                        {data?.roleDistribution && Object.entries(data.roleDistribution).map(([role, count]) => {
                            const total = stats?.totalUsers || 1;
                            const pct = Math.round(((count as number) / total) * 100);
                            return (
                                <div key={role} className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 w-28 truncate">
                                        {roleLabels[role] || role}
                                    </span>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                                        {(count as number).toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">ผู้ใช้ที่เปิดใช้งาน</span>
                                <span className="font-semibold text-green-600">
                                    {stats?.activeUsers?.toLocaleString()} / {stats?.totalUsers?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    ประกาศล่าสุด
                </h2>
                {data?.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
                    <div className="space-y-3">
                        {data.recentAnnouncements.map((ann) => (
                            <div key={ann.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ann.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ann.priority] || priorityColors.NORMAL}`}>
                                            {ann.priority === 'URGENT' ? 'เร่งด่วน' : ann.priority === 'HIGH' ? 'สำคัญ' : ann.type === 'ACADEMIC' ? 'วิชาการ' : 'ทั่วไป'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(ann.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-8">ยังไม่มีประกาศ</p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    การดำเนินการด่วน
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'จัดการผู้ใช้', icon: Users, href: '/dashboard/admin/users' },
                        { label: 'จัดการชั้นเรียน', icon: GraduationCap, href: '/dashboard/admin/classrooms' },
                        { label: 'จัดการวิชา', icon: BookOpen, href: '/dashboard/admin/subjects' },
                        { label: 'ดูรายงาน', icon: Activity, href: '/dashboard/admin/reports' },
                    ].map((action, index) => (
                        <a
                            key={index}
                            href={action.href}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                        >
                            <action.icon className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600">
                                {action.label}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
