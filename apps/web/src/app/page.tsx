// Landing Page - Thai School LMS

import Link from 'next/link';
import { GraduationCap, Users, BookOpen, BarChart3, Bell, Shield } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Thai School LMS
                        </span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                        >
                            เข้าสู่ระบบ
                        </Link>
                        <Link
                            href="/register"
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            สมัครสมาชิก
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto text-center max-w-4xl">
                    <div className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-300 text-sm font-medium mb-6">
                        🎓 แพลตฟอร์มการเรียนการสอนสำหรับโรงเรียนไทย
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        ระบบจัดการการเรียนการสอน
                        <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            ครบวงจร ตั้งแต่ ป.1 - ม.6
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        รองรับทุกกลุ่มสาระการเรียนรู้ การบ้าน การสอบ คะแนน ใบ ปพ.
                        และการสื่อสารระหว่างครู นักเรียน และผู้ปกครอง ในที่เดียว
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
                        >
                            เข้าสู่ระบบ →
                        </Link>
                        <Link
                            href="#features"
                            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border"
                        >
                            ดูฟีเจอร์ทั้งหมด
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            ฟีเจอร์หลักของระบบ
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            ครอบคลุมทุกความต้องการในการจัดการการศึกษา
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: 'จัดการผู้ใช้หลายบทบาท',
                                description: 'ผู้บริหาร ครู นักเรียน ผู้ปกครอง พร้อมระบบสิทธิ์ที่ยืดหยุ่น',
                                color: 'blue',
                            },
                            {
                                icon: BookOpen,
                                title: 'บทเรียนมัลติมีเดีย',
                                description: 'วิดีโอ PDF สไลด์ แบบฝึกหัด รองรับ 8 กลุ่มสาระการเรียนรู้',
                                color: 'green',
                            },
                            {
                                icon: BarChart3,
                                title: 'การบ้านและการสอบ',
                                description: 'สร้างข้อสอบหลายรูปแบบ ธนาคารข้อสอบ ตรวจอัตโนมัติ',
                                color: 'purple',
                            },
                            {
                                icon: BarChart3,
                                title: 'ระบบคะแนนและ GPA',
                                description: 'บันทึกคะแนน คำนวณ GPA/GPAX พิมพ์ใบ ปพ. อัตโนมัติ',
                                color: 'orange',
                            },
                            {
                                icon: Bell,
                                title: 'แจ้งเตือนและสื่อสาร',
                                description: 'ประกาศ แชท แจ้งเตือน SMS/Email สำหรับผู้ปกครอง',
                                color: 'pink',
                            },
                            {
                                icon: Shield,
                                title: 'ปลอดภัยและมั่นคง',
                                description: 'รองรับมาตรฐานความปลอดภัย backup ข้อมูลอัตโนมัติ',
                                color: 'cyan',
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-xl transition-shadow group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* User Roles Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            สำหรับทุกคนในโรงเรียน
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { role: 'ผู้บริหาร', desc: 'ดูภาพรวม จัดการระบบ', color: 'from-red-500 to-orange-500' },
                            { role: 'ครู', desc: 'สอน ให้คะแนน รายงาน', color: 'from-blue-500 to-indigo-500' },
                            { role: 'นักเรียน', desc: 'เรียน ส่งงาน ดูคะแนน', color: 'from-green-500 to-teal-500' },
                            { role: 'ผู้ปกครอง', desc: 'ติดตาม รับแจ้งเตือน', color: 'from-purple-500 to-pink-500' },
                        ].map((item, index) => (
                            <div key={index} className="relative overflow-hidden rounded-2xl p-6 text-white group cursor-pointer">
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} group-hover:scale-105 transition-transform`} />
                                <div className="relative">
                                    <h3 className="text-xl font-bold mb-2">{item.role}</h3>
                                    <p className="text-white/80 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t bg-white/50 dark:bg-gray-800/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">Thai School LMS</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            © 2024 Thai School LMS. พัฒนาเพื่อการศึกษาไทย
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
