// Login Page

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'เกิดข้อผิดพลาด');
            }

            // Store token and redirect based on role
            localStorage.setItem('accessToken', data.accessToken);

            switch (data.user.role) {
                case 'ADMIN':
                case 'SUPER_ADMIN':
                    router.push('/dashboard/admin');
                    break;
                case 'TEACHER':
                    router.push('/dashboard/teacher');
                    break;
                case 'STUDENT':
                    router.push('/dashboard/student');
                    break;
                case 'PARENT':
                    router.push('/dashboard/parent');
                    break;
                default:
                    router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                <GraduationCap className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Thai School LMS
                            </span>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            ยินดีต้อนรับกลับ
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                อีเมล
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@school.ac.th"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-600 dark:text-gray-400">จดจำฉัน</span>
                            </label>
                            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700">
                                ลืมรหัสผ่าน?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                'เข้าสู่ระบบ'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8">
                        ยังไม่มีบัญชี?{' '}
                        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                            สมัครสมาชิก
                        </Link>
                    </p>

                    {/* Demo accounts */}
                    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            บัญชีทดสอบ:
                        </p>
                        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                            <p>ผู้ดูแล: admin@school.ac.th / Admin123!</p>
                            <p>ครู: teacher@school.ac.th / Teacher123!</p>
                            <p>นักเรียน: student@school.ac.th / Student123!</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Decoration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>
                <div className="relative text-white text-center max-w-lg">
                    <GraduationCap className="w-20 h-20 mx-auto mb-8 opacity-90" />
                    <h2 className="text-3xl font-bold mb-4">
                        ระบบจัดการการเรียนการสอน
                    </h2>
                    <p className="text-white/80 text-lg">
                        แพลตฟอร์มครบวงจรสำหรับโรงเรียนไทย รองรับ 8 กลุ่มสาระการเรียนรู้
                        ตั้งแต่ประถมศึกษาจนถึงมัธยมศึกษาตอนปลาย
                    </p>
                </div>
            </div>
        </div>
    );
}
