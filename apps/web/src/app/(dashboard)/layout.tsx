// Dashboard Layout - Authenticated pages wrapper

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import {
    GraduationCap,
    Home,
    Users,
    BookOpen,
    ClipboardList,
    FileText,
    BarChart3,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    Moon,
    Sun,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';

const roleNavigation: Record<string, { label: string; href: string; icon: any }[]> = {
    ADMIN: [
        { label: 'ภาพรวม', href: '/dashboard/admin', icon: Home },
        { label: 'จัดการผู้ใช้', href: '/dashboard/admin/users', icon: Users },
        { label: 'จัดการชั้นเรียน', href: '/dashboard/admin/classrooms', icon: BookOpen },
        { label: 'จัดการวิชา', href: '/dashboard/admin/subjects', icon: ClipboardList },
        { label: 'รายงาน', href: '/dashboard/admin/reports', icon: BarChart3 },
        { label: 'ตั้งค่า', href: '/dashboard/admin/settings', icon: Settings },
    ],
    TEACHER: [
        { label: 'ภาพรวม', href: '/dashboard/teacher', icon: Home },
        { label: 'วิชาที่สอน', href: '/dashboard/teacher/subjects', icon: BookOpen },
        { label: 'บทเรียน', href: '/dashboard/teacher/lessons', icon: FileText },
        { label: 'การบ้าน', href: '/dashboard/teacher/assignments', icon: ClipboardList },
        { label: 'ข้อสอบ', href: '/dashboard/teacher/exams', icon: FileText },
        { label: 'คะแนน', href: '/dashboard/teacher/grades', icon: BarChart3 },
    ],
    STUDENT: [
        { label: 'ภาพรวม', href: '/dashboard/student', icon: Home },
        { label: 'วิชาเรียน', href: '/dashboard/student/subjects', icon: BookOpen },
        { label: 'การบ้าน', href: '/dashboard/student/assignments', icon: ClipboardList },
        { label: 'ข้อสอบ', href: '/dashboard/student/exams', icon: FileText },
        { label: 'คะแนน', href: '/dashboard/student/grades', icon: BarChart3 },
    ],
    PARENT: [
        { label: 'ภาพรวม', href: '/dashboard/parent', icon: Home },
        { label: 'ผลการเรียน', href: '/dashboard/parent/grades', icon: BarChart3 },
        { label: 'ข้อความ', href: '/dashboard/parent/messages', icon: Bell },
    ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const navigation = roleNavigation[user.role] || roleNavigation.STUDENT;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">Thai School LMS</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 overflow-y-auto">
                        <ul className="space-y-1">
                            {navigation.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                                {user.profile?.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.profile?.name || user.email}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' :
                                        user.role === 'TEACHER' ? 'ครู' :
                                            user.role === 'STUDENT' ? 'นักเรียน' : 'ผู้ปกครอง'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1" />

                    {/* Theme toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                </header>

                {/* Page content */}
                <main className="p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
