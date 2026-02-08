// Teacher Grade Entry Page - Enter grades for a specific subject instance

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Users, BookOpen, Calculator, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSubjectInstanceGrades, useBulkGrades } from '@/hooks/use-grades';
import api from '@/lib/api';

// Thai grade scale for display
const GRADE_SCALE = [
    { min: 80, label: 'A', point: 4.0, color: 'bg-green-500' },
    { min: 75, label: 'B+', point: 3.5, color: 'bg-lime-500' },
    { min: 70, label: 'B', point: 3.0, color: 'bg-yellow-500' },
    { min: 65, label: 'C+', point: 2.5, color: 'bg-amber-500' },
    { min: 60, label: 'C', point: 2.0, color: 'bg-orange-500' },
    { min: 55, label: 'D+', point: 1.5, color: 'bg-red-400' },
    { min: 50, label: 'D', point: 1.0, color: 'bg-red-500' },
    { min: 0, label: 'F', point: 0, color: 'bg-gray-500' },
];

interface SubjectInstanceDetails {
    id: string;
    subject: {
        id: string;
        code: string;
        nameTh: string;
        credits: number;
        subjectArea?: {
            code: string;
            nameTh: string;
            color?: string;
        };
    };
    semester: {
        name: string;
        academicYear: {
            name: string;
        };
    };
    enrollments: {
        student: {
            id: string;
            studentCode: string;
            titleTh: string;
            firstNameTh: string;
            lastNameTh: string;
            studentNumber: number;
            classroom?: {
                name: string;
            };
        };
    }[];
}

interface GradeEntry {
    studentId: string;
    classworkScore: number | null;
    midtermScore: number | null;
    finalScore: number | null;
    totalScore: number | null;
    percentage: number | null;
    gradeLabel: string | null;
    gradePoint: number | null;
    isDirty: boolean;
}

function calculateGrade(percentage: number): { label: string; point: number; color: string } {
    const grade = GRADE_SCALE.find((g) => percentage >= g.min);
    return grade || { label: 'F', point: 0, color: 'bg-gray-500' };
}

function calculateTotal(classwork: number | null, midterm: number | null, final_: number | null): {
    totalScore: number;
    percentage: number;
    gradeLabel: string;
    gradePoint: number;
    gradeColor: string;
} {
    const cw = classwork ?? 0;
    const mt = midterm ?? 0;
    const fn = final_ ?? 0;
    const totalScore = cw * 0.3 + mt * 0.2 + fn * 0.5;
    const percentage = totalScore;
    const gradeInfo = calculateGrade(percentage);
    return {
        totalScore: Math.round(totalScore * 100) / 100,
        percentage: Math.round(percentage * 100) / 100,
        gradeLabel: gradeInfo.label,
        gradePoint: gradeInfo.point,
        gradeColor: gradeInfo.color,
    };
}

export default function GradeEntryPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const subjectInstanceId = params.subjectInstanceId as string;

    const [subjectInstance, setSubjectInstance] = useState<SubjectInstanceDetails | null>(null);
    const [gradeEntries, setGradeEntries] = useState<Record<string, GradeEntry>>({});
    const [loadingInstance, setLoadingInstance] = useState(true);
    const [saving, setSaving] = useState(false);

    const { data: existingGrades, isLoading: loadingGrades, refetch } = useSubjectInstanceGrades(subjectInstanceId);
    const bulkGradeMutation = useBulkGrades();

    // Load subject instance details
    useEffect(() => {
        const fetchSubjectInstance = async () => {
            try {
                const { data } = await api.get(`/subjects/instances/${subjectInstanceId}`);
                setSubjectInstance(data);
            } catch (error) {
                console.error('Failed to fetch subject instance:', error);
                toast({
                    title: 'เกิดข้อผิดพลาด',
                    description: 'ไม่สามารถโหลดข้อมูลวิชาได้',
                    variant: 'destructive',
                });
            } finally {
                setLoadingInstance(false);
            }
        };
        if (subjectInstanceId) {
            fetchSubjectInstance();
        }
    }, [subjectInstanceId, toast]);

    // Initialize grade entries when data is loaded
    useEffect(() => {
        if (!subjectInstance || !existingGrades) return;

        const entries: Record<string, GradeEntry> = {};

        // Initialize from enrolled students
        for (const enrollment of subjectInstance.enrollments || []) {
            const studentId = enrollment.student.id;
            const existing = existingGrades.find((g) => g.studentId === studentId);

            if (existing) {
                entries[studentId] = {
                    studentId,
                    classworkScore: existing.classworkScore ?? null,
                    midtermScore: existing.midtermScore ?? null,
                    finalScore: existing.finalScore ?? null,
                    totalScore: existing.totalScore ?? null,
                    percentage: existing.percentage ?? null,
                    gradeLabel: existing.gradeLabel ?? null,
                    gradePoint: existing.gradePoint ?? null,
                    isDirty: false,
                };
            } else {
                entries[studentId] = {
                    studentId,
                    classworkScore: null,
                    midtermScore: null,
                    finalScore: null,
                    totalScore: null,
                    percentage: null,
                    gradeLabel: null,
                    gradePoint: null,
                    isDirty: false,
                };
            }
        }

        setGradeEntries(entries);
    }, [subjectInstance, existingGrades]);

    // Handle score change
    const handleScoreChange = (
        studentId: string,
        field: 'classworkScore' | 'midtermScore' | 'finalScore',
        value: string
    ) => {
        const numValue = value === '' ? null : Math.min(100, Math.max(0, Number(value)));

        setGradeEntries((prev) => {
            const entry = prev[studentId];
            const updated = { ...entry, [field]: numValue, isDirty: true };

            // Recalculate totals
            const calc = calculateTotal(
                field === 'classworkScore' ? numValue : updated.classworkScore,
                field === 'midtermScore' ? numValue : updated.midtermScore,
                field === 'finalScore' ? numValue : updated.finalScore
            );

            return {
                ...prev,
                [studentId]: {
                    ...updated,
                    totalScore: calc.totalScore,
                    percentage: calc.percentage,
                    gradeLabel: calc.gradeLabel,
                    gradePoint: calc.gradePoint,
                },
            };
        });
    };

    // Save all grades
    const handleSaveAll = async () => {
        const dirtyEntries = Object.values(gradeEntries).filter((e) => e.isDirty);

        if (dirtyEntries.length === 0) {
            toast({
                title: 'ไม่มีการเปลี่ยนแปลง',
                description: 'ไม่มีข้อมูลเกรดที่ต้องบันทึก',
            });
            return;
        }

        setSaving(true);
        try {
            await bulkGradeMutation.mutateAsync({
                subjectInstanceId,
                grades: dirtyEntries.map((e) => ({
                    studentId: e.studentId,
                    classworkScore: e.classworkScore ?? undefined,
                    midtermScore: e.midtermScore ?? undefined,
                    finalScore: e.finalScore ?? undefined,
                })),
            });

            toast({
                title: 'บันทึกสำเร็จ',
                description: `บันทึกเกรดสำหรับ ${dirtyEntries.length} คน`,
            });

            // Reset dirty flags
            setGradeEntries((prev) => {
                const updated = { ...prev };
                for (const key of Object.keys(updated)) {
                    updated[key] = { ...updated[key], isDirty: false };
                }
                return updated;
            });

            refetch();
        } catch (error) {
            console.error('Failed to save grades:', error);
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถบันทึกเกรดได้ กรุณาลองใหม่',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    // Statistics
    const stats = useMemo(() => {
        const entries = Object.values(gradeEntries);
        const withGrades = entries.filter((e) => e.gradeLabel);
        const gradeCounts: Record<string, number> = {};

        for (const entry of withGrades) {
            if (entry.gradeLabel) {
                gradeCounts[entry.gradeLabel] = (gradeCounts[entry.gradeLabel] || 0) + 1;
            }
        }

        const avgPercentage =
            withGrades.length > 0
                ? withGrades.reduce((sum, e) => sum + (e.percentage || 0), 0) / withGrades.length
                : 0;

        return {
            total: entries.length,
            graded: withGrades.length,
            avgPercentage: Math.round(avgPercentage * 100) / 100,
            gradeCounts,
        };
    }, [gradeEntries]);

    const hasDirtyEntries = Object.values(gradeEntries).some((e) => e.isDirty);

    if (loadingInstance || loadingGrades) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (!subjectInstance) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">ไม่พบข้อมูลวิชา</p>
                <Link href="/dashboard/teacher/grades">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับ
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/teacher/grades">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            บันทึกเกรด: {subjectInstance.subject.nameTh}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subjectInstance.subject.code} • {subjectInstance.semester.academicYear.name} / {subjectInstance.semester.name}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        รีเฟรช
                    </Button>
                    <Button variant="outline" disabled>
                        <Download className="w-4 h-4 mr-2" />
                        ส่งออก Excel
                    </Button>
                    <Button onClick={handleSaveAll} disabled={!hasDirtyEntries || saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">บันทึกเกรดแล้ว</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.graded}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">คะแนนเฉลี่ย</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgPercentage}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">กระจายเกรด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-1 flex-wrap">
                            {GRADE_SCALE.map(({ label, color }) => (
                                <Badge key={label} variant="outline" className="text-xs">
                                    {label}: {stats.gradeCounts[label] || 0}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grade Weight Info */}
            <Card>
                <CardHeader className="py-3">
                    <CardDescription>
                        สัดส่วนคะแนน: คะแนนเก็บ 30% • กลางภาค 20% • ปลายภาค 50%
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Grade Entry Table */}
            <Card>
                <CardHeader>
                    <CardTitle>รายชื่อนักเรียน</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-2 font-medium w-12">เลขที่</th>
                                    <th className="text-left py-3 px-2 font-medium">รหัสนักเรียน</th>
                                    <th className="text-left py-3 px-2 font-medium min-w-[180px]">ชื่อ-นามสกุล</th>
                                    <th className="text-center py-3 px-2 font-medium w-24">คะแนนเก็บ<br />(30%)</th>
                                    <th className="text-center py-3 px-2 font-medium w-24">กลางภาค<br />(20%)</th>
                                    <th className="text-center py-3 px-2 font-medium w-24">ปลายภาค<br />(50%)</th>
                                    <th className="text-center py-3 px-2 font-medium w-20">รวม</th>
                                    <th className="text-center py-3 px-2 font-medium w-16">เกรด</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(subjectInstance.enrollments || [])
                                    .sort((a, b) => a.student.studentNumber - b.student.studentNumber)
                                    .map((enrollment) => {
                                        const student = enrollment.student;
                                        const entry = gradeEntries[student.id];
                                        const calc = entry
                                            ? calculateTotal(entry.classworkScore, entry.midtermScore, entry.finalScore)
                                            : null;

                                        return (
                                            <tr
                                                key={student.id}
                                                className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 ${entry?.isDirty ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}
                                            >
                                                <td className="py-2 px-2 text-center">{student.studentNumber}</td>
                                                <td className="py-2 px-2">{student.studentCode}</td>
                                                <td className="py-2 px-2">
                                                    {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        className="w-20 text-center"
                                                        value={entry?.classworkScore ?? ''}
                                                        onChange={(e) => handleScoreChange(student.id, 'classworkScore', e.target.value)}
                                                        placeholder="-"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        className="w-20 text-center"
                                                        value={entry?.midtermScore ?? ''}
                                                        onChange={(e) => handleScoreChange(student.id, 'midtermScore', e.target.value)}
                                                        placeholder="-"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        className="w-20 text-center"
                                                        value={entry?.finalScore ?? ''}
                                                        onChange={(e) => handleScoreChange(student.id, 'finalScore', e.target.value)}
                                                        placeholder="-"
                                                    />
                                                </td>
                                                <td className="py-2 px-2 text-center font-medium">
                                                    {calc?.percentage ?? '-'}
                                                </td>
                                                <td className="py-2 px-2 text-center">
                                                    {calc?.gradeLabel ? (
                                                        <Badge className={`${calc.gradeColor} text-white`}>
                                                            {calc.gradeLabel}
                                                        </Badge>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Floating Save Button */}
            {hasDirtyEntries && (
                <div className="fixed bottom-6 right-6">
                    <Button size="lg" onClick={handleSaveAll} disabled={saving} className="shadow-lg">
                        <Save className="w-5 h-5 mr-2" />
                        {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </Button>
                </div>
            )}
        </div>
    );
}
