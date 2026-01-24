// Admin Dashboard Page

import {
    Users,
    UserCheck,
    BookOpen,
    GraduationCap,
    TrendingUp,
    TrendingDown,
    Calendar,
    Bell
} from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ภาพรวมระบบ
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    ยินดีต้อนรับ ผู้ดูแลระบบ
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'นักเรียนทั้งหมด', value: '1,234', icon: Users, color: 'blue', change: '+12%' },
                    { label: 'ครูทั้งหมด', value: '89', icon: UserCheck, color: 'green', change: '+3%' },
                    { label: 'วิชาเปิดสอน', value: '156', icon: BookOpen, color: 'purple', change: '0%' },
                    { label: 'ห้องเรียน', value: '48', icon: GraduationCap, color: 'orange', change: '+2%' },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                            <span className={`flex items-center text-sm ${stat.change.startsWith('+') ? 'text-green-600' :
                                    stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                {stat.change.startsWith('+') ? <TrendingUp className="w-4 h-4 mr-1" /> :
                                    stat.change.startsWith('-') ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                                {stat.change}
                            </span>
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        การเข้าเรียนวันนี้
                    </h2>
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        <div className="text-center">
                            <div className="flex justify-center gap-8 mb-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">1,180</div>
                                    <div className="text-sm text-gray-500">มาเรียน</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-red-600">32</div>
                                    <div className="text-sm text-gray-500">ขาดเรียน</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-yellow-600">22</div>
                                    <div className="text-sm text-gray-500">มาสาย</div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div className="bg-green-500 h-4 rounded-full" style={{ width: '95%' }} />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">อัตราการเข้าเรียน 95%</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        กิจกรรมล่าสุด
                    </h2>
                    <div className="space-y-4">
                        {[
                            { text: 'นักเรียนใหม่ลงทะเบียน 5 คน', time: '10 นาทีที่แล้ว', type: 'user' },
                            { text: 'ครูประจำวิชา ม.3/1 เพิ่มบทเรียนใหม่', time: '1 ชั่วโมงที่แล้ว', type: 'lesson' },
                            { text: 'ประกาศใหม่: ปิดเรียนวันที่ 15 ม.ค.', time: '2 ชั่วโมงที่แล้ว', type: 'announcement' },
                            { text: 'สรุปคะแนนสอบกลางภาค ม.6', time: '3 ชั่วโมงที่แล้ว', type: 'grade' },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900 dark:text-white">{activity.text}</p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    การดำเนินการด่วน
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'เพิ่มนักเรียน', icon: Users, href: '/dashboard/admin/students/new' },
                        { label: 'เพิ่มครู', icon: UserCheck, href: '/dashboard/admin/teachers/new' },
                        { label: 'สร้างห้องเรียน', icon: GraduationCap, href: '/dashboard/admin/classrooms/new' },
                        { label: 'สร้างประกาศ', icon: Bell, href: '/dashboard/admin/announcements/new' },
                    ].map((action, index) => (
                        <button
                            key={index}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                        >
                            <action.icon className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
