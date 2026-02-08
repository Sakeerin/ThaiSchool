// Teacher Grades Management Dashboard

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, BookOpen, Users, TrendingUp, ChevronRight, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { subjectsApi, academicApi, SubjectInstance, Semester } from '@/lib/api/subjects';

export default function TeacherGradesPage() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [subjectInstances, setSubjectInstances] = useState<SubjectInstance[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch semesters on mount
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const data = await academicApi.getSemesters();
                setSemesters(data);
                // Set current semester as default
                const current = data.find((s) => s.isCurrent);
                if (current) {
                    setSelectedSemester(current.id);
                } else if (data.length > 0) {
                    setSelectedSemester(data[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch semesters:', error);
            }
        };
        fetchSemesters();
    }, []);

    // Fetch subject instances when semester changes
    useEffect(() => {
        const fetchSubjectInstances = async () => {
            if (!selectedSemester) return;
            setLoading(true);
            try {
                const data = await subjectsApi.getInstancesBySemester(selectedSemester);
                setSubjectInstances(data);
            } catch (error) {
                console.error('Failed to fetch subject instances:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjectInstances();
    }, [selectedSemester]);

    // Get subject area color
    const getSubjectColor = (code?: string) => {
        const colors: Record<string, string> = {
            THA: 'bg-amber-500',
            MAT: 'bg-blue-500',
            SCI: 'bg-green-500',
            SOC: 'bg-purple-500',
            HEA: 'bg-pink-500',
            ART: 'bg-orange-500',
            OCC: 'bg-teal-500',
            FOR: 'bg-indigo-500',
        };
        return colors[code || ''] || 'bg-gray-500';
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        จัดการเกรด
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        บันทึกและจัดการเกรดสำหรับวิชาที่สอน
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="เลือกภาคเรียน" />
                        </SelectTrigger>
                        <SelectContent>
                            {semesters.map((semester) => (
                                <SelectItem key={semester.id} value={semester.id}>
                                    {semester.academicYear?.name} / {semester.name}
                                    {semester.isCurrent && (
                                        <Badge variant="secondary" className="ml-2">
                                            ปัจจุบัน
                                        </Badge>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">วิชาที่สอน</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{subjectInstances.length}</div>
                        <p className="text-xs text-muted-foreground">วิชาในภาคเรียนนี้</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {subjectInstances.reduce((acc, s) => acc + (s._count?.enrollments || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">คนลงทะเบียน</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">บันทึกเกรดแล้ว</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">รายการเกรด</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">เกรดเฉลี่ย</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">ทุกวิชา</p>
                    </CardContent>
                </Card>
            </div>

            {/* Subject Instances Grid */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    วิชาที่สอน
                </h2>
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-4 w-24 mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4 mt-2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : subjectInstances.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-4 text-gray-500">ไม่พบวิชาที่สอนในภาคเรียนนี้</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {subjectInstances.map((instance) => (
                            <Card
                                key={instance.id}
                                className="hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-lg ${getSubjectColor(instance.subject?.subjectArea?.code)} flex items-center justify-center text-white font-medium text-sm`}
                                            >
                                                {instance.subject?.subjectArea?.code?.slice(0, 2) || 'SB'}
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">
                                                    {instance.subject?.nameTh}
                                                </CardTitle>
                                                <CardDescription>
                                                    {instance.subject?.code}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant="outline">
                                            {instance.subject?.credits} หน่วยกิต
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {instance._count?.enrollments || 0} คน
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BarChart3 className="w-4 h-4" />
                                                - เกรด
                                            </span>
                                        </div>
                                        <Link href={`/dashboard/teacher/grades/${instance.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="group-hover:bg-primary group-hover:text-primary-foreground"
                                            >
                                                บันทึกเกรด
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">รายงานและสถิติ</CardTitle>
                        <CardDescription>ดูรายงานสรุปเกรดและสถิติการเรียน</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/teacher/reports">
                            <Button variant="outline" className="w-full">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                ไปยังหน้ารายงาน
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">ใบรายงานผล (ปพ.)</CardTitle>
                        <CardDescription>สร้างและพิมพ์เอกสารผลการเรียน</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/teacher/reports?type=report-card">
                            <Button variant="outline" className="w-full">
                                <GraduationCap className="w-4 h-4 mr-2" />
                                สร้างใบรายงานผล
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
